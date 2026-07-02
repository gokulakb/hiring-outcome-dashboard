// Global variables
let charts = {};
let currentData = {};
let refreshInterval = null;
const API_BASE = '/api';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    startAutoRefresh();
});

function initializeDashboard() {
    showLoading(true);
    // Load data in parallel
    Promise.all([
        loadDashboardData(),
        loadAnalyticsData(),
        loadDepartmentFilterOptions(),
        loadStatusFilterOptions()
    ]).then(() => {
        // All data loaded, hide loading
        showLoading(false);
    }).catch((error) => {
        console.error('Error initializing dashboard:', error);
        showLoading(false);
        showError('Failed to initialize dashboard. Please refresh the page.');
    });
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;
    
    if (show) {
        overlay.classList.remove('hidden');
        const loadingText = overlay.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = 'Loading Dashboard...';
        }
    } else {
        setTimeout(() => {
            overlay.classList.add('hidden');
            const loadingText = overlay.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = 'Dashboard Loaded!';
                setTimeout(() => {
                    loadingText.textContent = 'Loading Dashboard...';
                }, 1000);
            }
        }, 300);
    }
}

function setupEventListeners() {
    // Apply filters
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    
    // Enter key on search
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });
    
    // Export CSV
    document.getElementById('exportCSV').addEventListener('click', exportCSV);
    
    // Print dashboard
    document.getElementById('printDashboard').addEventListener('click', () => window.print());
    
    // Verify offer
    document.getElementById('verifyButton').addEventListener('click', verifyOffer);
    
    // Enter key on verification input
    document.getElementById('verificationInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyOffer();
        }
    });

    // Show candidates with signed offers
    document.getElementById('showCandidatesBtn').addEventListener('click', toggleCandidatesList);

    // Refresh button
    document.getElementById('refreshDashboard').addEventListener('click', refreshDashboard);
}

function startAutoRefresh() {
    // Refresh every 30 seconds
    refreshInterval = setInterval(() => {
        console.log('Auto-refreshing dashboard...');
        loadDashboardData();
        loadAnalyticsData();
    }, 30000);
}

async function refreshDashboard() {
    const btn = document.getElementById('refreshDashboard');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i> Refreshing...';
    btn.disabled = true;
    
    showLoading(true);
    try {
        await Promise.all([
            loadDashboardData(),
            loadAnalyticsData()
        ]);
        showLoading(false);
        btn.innerHTML = '<i class="bi bi-check-circle me-1"></i> Done!';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 2000);
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
        showLoading(false);
        btn.innerHTML = originalText;
        btn.disabled = false;
        showError('Failed to refresh dashboard. Please try again.');
    }
}

async function loadDashboardData() {
    try {
        const response = await fetch(`${API_BASE}/dashboard`);
        if (!response.ok) throw new Error('Failed to load dashboard data');
        
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'API returned error');
        
        const data = result.data;
        currentData = data;
        updateKPIs(data.kpis);
        updateRecommendations(data.recommendations);
        updateFreshness(data.lastUpdated);
        updateLastUpdated(data.lastUpdated);
        
        return data;
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data. Please refresh the page.');
    }
}

async function loadAnalyticsData() {
    try {
        // Load hiring analytics
        const hiringResponse = await fetch(`${API_BASE}/analytics/hiring`);
        if (!hiringResponse.ok) throw new Error('Failed to load hiring analytics');
        const hiringResult = await hiringResponse.json();
        
        if (hiringResult.success) {
            updateHiringCharts(hiringResult.data);
            updateVerificationSuccess(hiringResult.data.verificationSuccess);
        }
        
        // Load funnel analytics
        const funnelResponse = await fetch(`${API_BASE}/analytics/funnel`);
        if (!funnelResponse.ok) throw new Error('Failed to load funnel analytics');
        const funnelResult = await funnelResponse.json();
        
        if (funnelResult.success) {
            updateFunnelChart(funnelResult.data.funnelData);
            updateRecentActivity(funnelResult.data.recentActivities);
        }
        
        // Load department analytics
        const deptResponse = await fetch(`${API_BASE}/analytics/departments`);
        if (!deptResponse.ok) throw new Error('Failed to load department analytics');
        const deptResult = await deptResponse.json();
        
        if (deptResult.success) {
            updateDepartmentChart(deptResult.data.departments);
            updateSalaryChart(deptResult.data.avgSalaries);
        }
        
        // Load trends analytics
        const trendsResponse = await fetch(`${API_BASE}/analytics/trends`);
        if (!trendsResponse.ok) throw new Error('Failed to load trends analytics');
        const trendsResult = await trendsResponse.json();
        
        if (trendsResult.success) {
            updateTrendChart(trendsResult.data.dailyTrends);
        }
        
        return true;
    } catch (error) {
        console.error('Error loading analytics data:', error);
        showError('Failed to load analytics data. Please refresh the page.');
        throw error;
    }
}

function updateKPIs(kpis) {
    if (!kpis) return;
    
    document.getElementById('totalCandidates').textContent = kpis.totalCandidates || 0;
    document.getElementById('totalHired').textContent = kpis.totalHired || 0;
    document.getElementById('offersGenerated').textContent = kpis.offersGenerated || 0;
    document.getElementById('offersSigned').textContent = kpis.offersSigned || 0;
    document.getElementById('pendingOffers').textContent = kpis.pendingOffers || 0;
    document.getElementById('rejectedCandidates').textContent = kpis.rejectedCandidates || 0;
    document.getElementById('withdrawnCandidates').textContent = kpis.withdrawnCandidates || 0;
    document.getElementById('hiringRate').textContent = kpis.hiringRate ? `${kpis.hiringRate}%` : '0%';
    document.getElementById('offerAcceptance').textContent = kpis.offerAcceptanceRate ? `${kpis.offerAcceptanceRate}%` : '0%';
    document.getElementById('avgSalary').textContent = kpis.avgSalary ? `$${kpis.avgSalary.toLocaleString()}` : '$0';
    document.getElementById('avgHiringTime').textContent = kpis.avgHiringTime ? `${kpis.avgHiringTime} days` : '0 days';
}

function updateVerificationSuccess(verificationData) {
    if (!verificationData) return;
    const element = document.getElementById('verificationSuccess');
    element.textContent = verificationData.percentage ? `${verificationData.percentage}%` : '0%';
}

function updateHiringCharts(data) {
    if (!data) return;
    
    // Update Hiring Outcome Pie Chart
    if (data.pieData && data.pieData.length > 0) {
        updateChart('hiringPieChart', {
            type: 'pie',
            data: {
                labels: data.pieData.map(d => d.status),
                datasets: [{
                    data: data.pieData.map(d => d.count),
                    backgroundColor: generateColors(data.pieData.length)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e8edf5'
                        }
                    }
                }
            }
        });
    }
    
    // Update Candidate Status Bar Chart
    if (data.statusData && data.statusData.length > 0) {
        updateChart('statusBarChart', {
            type: 'bar',
            data: {
                labels: data.statusData.map(d => d.status),
                datasets: [{
                    label: 'Candidates',
                    data: data.statusData.map(d => d.count),
                    backgroundColor: 'rgba(74, 138, 244, 0.8)',
                    borderColor: 'rgba(74, 138, 244, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#8899bb'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#8899bb',
                            maxRotation: 45,
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        });
    }
}

function updateDepartmentChart(departments) {
    if (!departments || departments.length === 0) return;
    
    updateChart('departmentChart', {
        type: 'bar',
        data: {
            labels: departments.map(d => d.department),
            datasets: [
                {
                    label: 'Hired',
                    data: departments.map(d => d.hired || 0),
                    backgroundColor: 'rgba(40, 167, 69, 0.8)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Applied',
                    data: departments.map(d => d.applied || 0),
                    backgroundColor: 'rgba(74, 138, 244, 0.8)',
                    borderColor: 'rgba(74, 138, 244, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Rejected',
                    data: departments.map(d => d.rejected || 0),
                    backgroundColor: 'rgba(220, 53, 69, 0.8)',
                    borderColor: 'rgba(220, 53, 69, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#e8edf5'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#8899bb'
                    }
                },
                x: {
                    ticks: {
                        color: '#8899bb',
                        maxRotation: 45
                    }
                }
            }
        }
    });
}

function updateFunnelChart(funnelData) {
    if (!funnelData || funnelData.length === 0) return;
    
    updateChart('funnelChart', {
        type: 'bar',
        data: {
            labels: funnelData.map(d => d.stage),
            datasets: [{
                label: 'Count',
                data: funnelData.map(d => d.total || 0),
                backgroundColor: funnelData.map((_, i) => {
                    const colors = [
                        'rgba(74, 138, 244, 0.8)',
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(240, 173, 78, 0.8)',
                        'rgba(23, 162, 184, 0.8)',
                        'rgba(108, 117, 125, 0.8)',
                        'rgba(220, 53, 69, 0.8)'
                    ];
                    return colors[i % colors.length];
                }),
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#8899bb'
                    }
                },
                x: {
                    ticks: {
                        color: '#8899bb',
                        maxRotation: 45,
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

function updateTrendChart(trendData) {
    if (!trendData || trendData.length === 0) return;
    
    const dates = trendData.map(d => d.date);
    const hired = trendData.map(d => d.hired || 0);
    const applied = trendData.map(d => d.applied || 0);
    
    updateChart('trendChart', {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Hired',
                    data: hired,
                    borderColor: 'rgba(40, 167, 69, 1)',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Applied',
                    data: applied,
                    borderColor: 'rgba(74, 138, 244, 1)',
                    backgroundColor: 'rgba(74, 138, 244, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#e8edf5'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#8899bb'
                    }
                },
                x: {
                    ticks: {
                        color: '#8899bb',
                        maxRotation: 45,
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

function updateSalaryChart(salaryData) {
    if (!salaryData || salaryData.length === 0) return;
    
    updateChart('salaryChart', {
        type: 'bar',
        data: {
            labels: salaryData.map(d => d.department),
            datasets: [
                {
                    label: 'Average Salary',
                    data: salaryData.map(d => d.avgSalary || 0),
                    backgroundColor: 'rgba(74, 138, 244, 0.8)',
                    borderColor: 'rgba(74, 138, 244, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `$${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#8899bb',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    ticks: {
                        color: '#8899bb',
                        maxRotation: 45
                    }
                }
            }
        }
    });
}

function updateRecommendations(recommendations) {
    const container = document.getElementById('recommendationsContainer');
    
    if (!recommendations || recommendations.length === 0) {
        container.innerHTML = `
            <div class="text-muted text-center py-3">
                <i class="bi bi-check-circle text-success me-2"></i>
                No recommendations at this time.
            </div>
        `;
        return;
    }
    
    container.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item priority-${rec.priority}">
            <div class="rec-title">${rec.message}</div>
            <div class="rec-category">
                <i class="bi bi-tag me-1"></i>
                ${rec.category}
            </div>
            <div class="rec-action">
                <i class="bi bi-arrow-right me-1"></i>
                ${rec.action}
            </div>
        </div>
    `).join('');
}

function updateRecentActivity(activities) {
    const container = document.getElementById('recentActivityContainer');
    
    if (!activities || activities.length === 0) {
        container.innerHTML = `
            <div class="text-muted text-center py-3">
                <i class="bi bi-info-circle me-2"></i>
                No recent activity.
            </div>
        `;
        return;
    }
    
    container.innerHTML = activities.slice(0, 10).map(activity => `
        <div class="activity-item">
            <div class="activity-text">
                <span class="badge bg-${getEventBadgeColor(activity.eventType)} me-2">${activity.eventType}</span>
                ${activity.description}
            </div>
            <div class="activity-time">${formatTimeAgo(activity.createdAt)}</div>
        </div>
    `).join('');
}

function getEventBadgeColor(eventType) {
    const colors = {
        'Applied': 'primary',
        'Interview Scheduled': 'info',
        'Interview Completed': 'info',
        'Offer Generated': 'warning',
        'Offer Sent': 'warning',
        'Offer Viewed': 'warning',
        'Offer Signed': 'success',
        'Offer Verified': 'success',
        'Hired': 'success',
        'Rejected': 'danger',
        'Withdrawn': 'secondary'
    };
    return colors[eventType] || 'secondary';
}

function updateFreshness(lastUpdated) {
    const indicator = document.getElementById('freshnessIndicator');
    if (!lastUpdated) {
        indicator.innerHTML = '<i class="bi bi-circle-fill text-danger"></i>';
        return;
    }
    
    const updated = new Date(lastUpdated);
    const now = new Date();
    const diffHours = (now - updated) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
        indicator.innerHTML = '<i class="bi bi-circle-fill text-success"></i>';
    } else {
        indicator.innerHTML = '<i class="bi bi-circle-fill text-danger"></i>';
    }
}

function updateLastUpdated(lastUpdated) {
    const element = document.getElementById('lastUpdated');
    if (!lastUpdated) {
        element.textContent = 'Last Updated: Never';
        return;
    }
    
    const date = new Date(lastUpdated);
    const formatted = date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    element.innerHTML = `<i class="bi bi-clock me-1"></i> Last Updated: ${formatted}`;
}

function updateChart(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    // Destroy existing chart if it exists
    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }
    
    const ctx = canvas.getContext('2d');
    charts[canvasId] = new Chart(ctx, config);
}

function generateColors(count) {
    const colors = [
        'rgba(74, 138, 244, 0.8)',
        'rgba(40, 167, 69, 0.8)',
        'rgba(240, 173, 78, 0.8)',
        'rgba(220, 53, 69, 0.8)',
        'rgba(23, 162, 184, 0.8)',
        'rgba(108, 117, 125, 0.8)',
        'rgba(255, 193, 7, 0.8)',
        'rgba(232, 62, 140, 0.8)',
        'rgba(52, 58, 64, 0.8)',
        'rgba(0, 123, 255, 0.8)'
    ];
    
    if (count <= colors.length) {
        return colors.slice(0, count);
    }
    
    // Generate more colors if needed
    const additional = [];
    for (let i = colors.length; i < count; i++) {
        const hue = (i * 360 / count) % 360;
        additional.push(`hsla(${hue}, 70%, 60%, 0.8)`);
    }
    return [...colors, ...additional];
}

function formatTimeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

async function loadDepartmentFilterOptions() {
    try {
        const response = await fetch(`${API_BASE}/analytics/departments`);
        if (!response.ok) throw new Error('Failed to load departments');
        const result = await response.json();
        
        if (result.success && result.data.departments) {
            const select = document.getElementById('departmentFilter');
            const departments = result.data.departments.map(d => d.department);
            
            // Clear existing options except the first one
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept;
                option.textContent = dept;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading department filter options:', error);
    }
}

async function loadStatusFilterOptions() {
    try {
        const response = await fetch(`${API_BASE}/analytics/hiring`);
        if (!response.ok) throw new Error('Failed to load statuses');
        const result = await response.json();
        
        if (result.success && result.data.statusData) {
            const select = document.getElementById('statusFilter');
            const statuses = result.data.statusData.map(d => d.status);
            
            // Clear existing options except the first one
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            statuses.forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading status filter options:', error);
    }
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const department = document.getElementById('departmentFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    console.log('Applying filters:', { searchTerm, department, status });
    // In a real implementation, this would filter the candidates table
    // For now, we just refresh the data
    loadDashboardData();
    loadAnalyticsData();
}

async function exportCSV() {
    try {
        const response = await fetch(`${API_BASE}/dashboard`);
        if (!response.ok) throw new Error('Failed to fetch data for export');
        const result = await response.json();
        
        if (!result.success) throw new Error('Failed to export data');
        
        // Create CSV content
        const kpis = result.data.kpis;
        const headers = [
            'Metric',
            'Value'
        ];
        
        const rows = [
            ['Total Candidates', kpis.totalCandidates],
            ['Total Hired', kpis.totalHired],
            ['Offers Generated', kpis.offersGenerated],
            ['Offers Signed', kpis.offersSigned],
            ['Pending Offers', kpis.pendingOffers],
            ['Rejected Candidates', kpis.rejectedCandidates],
            ['Withdrawn Candidates', kpis.withdrawnCandidates],
            ['Hiring Rate', `${kpis.hiringRate}%`],
            ['Offer Acceptance Rate', `${kpis.offerAcceptanceRate}%`],
            ['Verification Success Rate', `${kpis.verificationSuccessRate}%`],
            ['Average Salary', `$${kpis.avgSalary.toLocaleString()}`],
            ['Average Hiring Time', `${kpis.avgHiringTime} days`]
        ];
        
        let csv = headers.join(',') + '\n';
        csv += rows.map(row => row.join(',')).join('\n');
        
        // Download CSV
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `hiring-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('Error exporting CSV:', error);
        showError('Failed to export CSV. Please try again.');
    }
}

// Handle rate limit errors
function handleRateLimitError(error) {
    if (error.message && error.message.includes('Too many requests')) {
        showError('⏳ Rate limit reached. Please wait a few minutes before trying again.');
        return true;
    }
    return false;
}

// Verify offer function with rate limit handling
async function verifyOffer() {
    const input = document.getElementById('verificationInput');
    const result = document.getElementById('verificationResult');
    const id = input.value.trim();
    
    if (!id) {
        result.innerHTML = `
            <div class="text-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Please enter a Candidate ID (e.g., 4)
            </div>
        `;
        return;
    }
    
    // Check if it's a valid number
    if (isNaN(id) || parseInt(id) <= 0) {
        result.innerHTML = `
            <div class="text-warning">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Please enter a valid positive number for Candidate ID
            </div>
        `;
        return;
    }
    
    result.innerHTML = `
        <div class="text-info">
            <i class="bi bi-hourglass-split me-2"></i>
            Verifying candidate ID ${id}...
        </div>
    `;
    
    try {
        const response = await fetch(`${API_BASE}/verify/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        // Handle rate limit
        if (response.status === 429) {
            result.innerHTML = `
                <div class="verification-failure">
                    <i class="bi bi-clock-history me-2"></i>
                    <strong>⏳ Rate Limit Reached!</strong> Too many requests. Please wait a few minutes before trying again.
                    <span class="badge bg-warning ms-2">Try again later</span>
                </div>
            `;
            return;
        }
        
        if (!response.ok) {
            throw new Error(data.error || 'Verification failed');
        }
        
        if (data.verified) {
            result.innerHTML = `
                <div class="verification-success">
                    <i class="bi bi-check-circle-fill me-2"></i>
                    <strong>✅ Verified!</strong> ${data.message || 'The offer has been verified successfully.'}
                    ${data.candidate ? `<br><small class="text-muted">Candidate: ${data.candidate} (Status: ${data.status})</small>` : ''}
                    <span class="badge bg-success ms-2">Authentic</span>
                </div>
            `;
            // Refresh dashboard to update verification success rate
            setTimeout(() => {
                loadDashboardData();
                loadAnalyticsData();
            }, 1000);
        } else {
            result.innerHTML = `
                <div class="verification-failure">
                    <i class="bi bi-x-circle-fill me-2"></i>
                    <strong>❌ Verification Failed!</strong> ${data.error || 'Offer could not be verified.'}
                    <span class="badge bg-danger ms-2">Invalid</span>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error verifying offer:', error);
        if (handleRateLimitError(error)) {
            return;
        }
        result.innerHTML = `
            <div class="verification-failure">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>Error:</strong> ${error.message || 'Failed to verify offer. Please try again.'}
            </div>
        `;
    }
}

// Toggle candidates list with rate limit handling
async function toggleCandidatesList() {
    const list = document.getElementById('candidateList');
    const tbody = document.getElementById('candidateTableBody');
    const btn = document.getElementById('showCandidatesBtn');
    
    if (list.style.display === 'block') {
        list.style.display = 'none';
        btn.innerHTML = '<i class="bi bi-list me-1"></i> Show Candidates with Signed Offers';
        return;
    }
    
    btn.innerHTML = '<i class="bi bi-hourglass-split me-1"></i> Loading...';
    
    try {
        const response = await fetch('/api/verify/signed-offers');
        
        // Handle rate limit
        if (response.status === 429) {
            btn.innerHTML = '<i class="bi bi-list me-1"></i> Show Candidates with Signed Offers';
            showError('⏳ Rate limit reached. Please wait a few minutes before trying again.');
            return;
        }
        
        if (!response.ok) throw new Error('Failed to fetch candidates');
        const result = await response.json();
        
        if (result.success && result.data) {
            tbody.innerHTML = '';
            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No candidates with signed offers found</td></tr>';
            } else {
                result.data.forEach(candidate => {
                    const row = document.createElement('tr');
                    const isVerified = candidate.hasHash && candidate.hasHash === 1;
                    row.innerHTML = `
                        <td><strong>${candidate.id}</strong></td>
                        <td>${candidate.name}</td>
                        <td><span class="badge bg-${candidate.status === 'Offer Verified' ? 'success' : 'warning'}">${candidate.status}</span></td>
                        <td><i class="bi bi-${candidate.offerSigned ? 'check-circle text-success' : 'x-circle text-danger'}"></i></td>
                        <td><i class="bi bi-${isVerified ? 'check-circle text-success' : 'x-circle text-danger'}"></i></td>
                    `;
                    row.style.cursor = 'pointer';
                    row.title = 'Click to verify this candidate';
                    row.addEventListener('click', function() {
                        document.getElementById('verificationInput').value = candidate.id;
                        document.getElementById('verifyButton').click();
                    });
                    tbody.appendChild(row);
                });
            }
            list.style.display = 'block';
            btn.innerHTML = '<i class="bi bi-x-circle me-1"></i> Hide Candidates';
        }
    } catch (error) {
        console.error('Error fetching candidates:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Failed to load candidates</td></tr>';
        list.style.display = 'block';
        btn.innerHTML = '<i class="bi bi-x-circle me-1"></i> Hide Candidates';
        if (!handleRateLimitError(error)) {
            showError('Failed to load candidates. Please try again.');
        }
    }
}

function showError(message) {
    // Create a toast notification
    const toastContainer = document.querySelector('.toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="toast-header bg-danger text-white">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <strong class="me-auto">Error</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body bg-dark text-light">
            ${message}
        </div>
    `;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
    return container;
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});