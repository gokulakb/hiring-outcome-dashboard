const { getDatabase } = require('../database/database');

class DashboardModel {
  static getKPIs() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.get(`
        SELECT 
          (SELECT COUNT(*) FROM candidates) as totalCandidates,
          (SELECT COUNT(*) FROM candidates WHERE status = 'Hired') as totalHired,
          (SELECT COUNT(*) FROM candidates WHERE status IN ('Offer Generated', 'Offer Sent', 'Offer Viewed', 'Offer Signed', 'Offer Verified', 'Hired')) as offersGenerated,
          (SELECT COUNT(*) FROM candidates WHERE offerSigned = 1) as offersSigned,
          (SELECT COUNT(*) FROM candidates WHERE status IN ('Offer Sent', 'Offer Viewed', 'Offer Signed', 'Offer Verified')) as pendingOffers,
          (SELECT COUNT(*) FROM candidates WHERE status = 'Rejected') as rejectedCandidates,
          (SELECT COUNT(*) FROM candidates WHERE status = 'Withdrawn') as withdrawnCandidates,
          (SELECT AVG(salary) FROM candidates WHERE status = 'Hired' AND salary IS NOT NULL) as avgSalary,
          (SELECT ROUND(AVG(julianday(hireDate) - julianday(createdAt)), 1) FROM candidates WHERE status = 'Hired' AND hireDate IS NOT NULL) as avgHiringTime,
          (SELECT COUNT(*) FROM candidates WHERE verificationHash IS NOT NULL AND status = 'Offer Verified') as verifiedOffers
        FROM candidates
      `, (err, row) => {
        db.close();
        if (err) {
          reject(err);
          return;
        }
        
        const data = row || {};
        const totalCandidates = data.totalCandidates || 0;
        const totalHired = data.totalHired || 0;
        // Fix: offersGenerated should count candidates with offer status OR hired
        const offersGenerated = data.offersGenerated || 0;
        const offersSigned = data.offersSigned || 0;
        const verifiedOffers = data.verifiedOffers || 0;
        
        // Calculate derived metrics
        const hiringRate = totalCandidates > 0 ? (totalHired / totalCandidates) * 100 : 0;
        // Fix: Offer acceptance rate should be offersSigned / offersGenerated, but cap at 100%
        const offerAcceptanceRate = offersGenerated > 0 ? Math.min((offersSigned / offersGenerated) * 100, 100) : 0;
        const verificationSuccessRate = offersSigned > 0 ? (verifiedOffers / offersSigned) * 100 : 0;
        
        resolve({
          totalCandidates,
          totalHired,
          offersGenerated,
          offersSigned,
          pendingOffers: data.pendingOffers || 0,
          rejectedCandidates: data.rejectedCandidates || 0,
          withdrawnCandidates: data.withdrawnCandidates || 0,
          hiringRate: Math.round(hiringRate * 100) / 100,
          offerAcceptanceRate: Math.round(offerAcceptanceRate * 100) / 100,
          verificationSuccessRate: Math.round(verificationSuccessRate * 100) / 100,
          avgSalary: Math.round(data.avgSalary || 0),
          avgHiringTime: Math.round(data.avgHiringTime || 0),
          verifiedOffers
        });
      });
    });
  }

  static getTimeline() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.all(`
        SELECT 
          date(createdAt) as date,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Hired' THEN 1 ELSE 0 END) as hired,
          SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN status = 'Applied' THEN 1 ELSE 0 END) as applied,
          SUM(CASE WHEN status IN ('Offer Sent', 'Offer Viewed', 'Offer Signed', 'Offer Verified') THEN 1 ELSE 0 END) as offers
        FROM candidates
        WHERE createdAt >= datetime('now', '-30 days')
        GROUP BY date(createdAt)
        ORDER BY date(createdAt) DESC
      `, (err, rows) => {
        db.close();
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      });
    });
  }

  static getRecommendations() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.get(`
        SELECT 
          (SELECT COUNT(*) FROM candidates) as totalCandidates,
          (SELECT COUNT(*) FROM candidates WHERE status = 'Hired') as totalHired,
          (SELECT COUNT(*) FROM candidates WHERE status IN ('Offer Generated', 'Offer Sent', 'Offer Viewed', 'Offer Signed', 'Offer Verified', 'Hired')) as offersGenerated,
          (SELECT COUNT(*) FROM candidates WHERE offerSigned = 1) as offersSigned,
          (SELECT COUNT(*) FROM candidates WHERE status IN ('Offer Sent', 'Offer Viewed', 'Offer Signed', 'Offer Verified')) as pendingOffers,
          (SELECT COUNT(*) FROM candidates WHERE status = 'Rejected') as rejectedCandidates,
          (SELECT COUNT(*) FROM candidates WHERE status = 'Withdrawn') as withdrawnCandidates,
          (SELECT AVG(salary) FROM candidates WHERE status = 'Hired') as avgSalary,
          (SELECT COUNT(*) FROM candidates WHERE verificationHash IS NOT NULL AND status = 'Offer Verified') as verifiedOffers,
          (SELECT COUNT(*) FROM candidates WHERE createdAt >= datetime('now', '-7 days')) as newCandidates
        FROM candidates
      `, (err, row) => {
        db.close();
        if (err) {
          reject(err);
          return;
        }
        
        const data = row || {};
        const recommendations = [];
        
        const totalCandidates = data.totalCandidates || 0;
        const totalHired = data.totalHired || 0;
        const offersGenerated = data.offersGenerated || 0;
        const offersSigned = data.offersSigned || 0;
        const pendingOffers = data.pendingOffers || 0;
        const rejectedCandidates = data.rejectedCandidates || 0;
        const withdrawnCandidates = data.withdrawnCandidates || 0;
        const verifiedOffers = data.verifiedOffers || 0;
        const newCandidates = data.newCandidates || 0;
        
        const hiringRate = totalCandidates > 0 ? (totalHired / totalCandidates) * 100 : 0;
        const offerAcceptanceRate = offersGenerated > 0 ? Math.min((offersSigned / offersGenerated) * 100, 100) : 0;
        const verificationSuccessRate = offersSigned > 0 ? (verifiedOffers / offersSigned) * 100 : 0;
        const rejectionRate = totalCandidates > 0 ? (rejectedCandidates / totalCandidates) * 100 : 0;
        const withdrawalRate = totalCandidates > 0 ? (withdrawnCandidates / totalCandidates) * 100 : 0;
        
        // Hiring rate below target (20%)
        if (hiringRate < 20 && totalCandidates > 10) {
          recommendations.push({
            priority: 'high',
            category: 'Hiring Process',
            message: `Hiring rate is ${hiringRate.toFixed(1)}% (below 20% target). Consider increasing interview capacity and expanding candidate sourcing.`,
            action: 'Review screening criteria, increase interview capacity, and expand job postings'
          });
        }
        
        // Offer acceptance dropping (below 50%)
        if (offerAcceptanceRate < 50 && offersGenerated > 5) {
          recommendations.push({
            priority: 'high',
            category: 'Compensation',
            message: `Offer acceptance rate is ${offerAcceptanceRate.toFixed(1)}% (below 50% target). Review compensation package and benefits.`,
            action: 'Benchmark salaries against industry standards and improve benefits package'
          });
        }
        
        // Verification failures (below 80%)
        if (verificationSuccessRate < 80 && offersSigned > 3) {
          recommendations.push({
            priority: 'high',
            category: 'Compliance',
            message: `Verification success rate is ${verificationSuccessRate.toFixed(1)}% (below 80% target). Audit signed documents and verification process.`,
            action: 'Review document verification procedures and implement additional checks'
          });
        }
        
        // Pending offers high (more than 5)
        if (pendingOffers > 5) {
          recommendations.push({
            priority: 'medium',
            category: 'Follow-up',
            message: `${pendingOffers} pending offers require follow-up. Candidates may be considering other opportunities.`,
            action: 'Schedule follow-up calls with pending candidates and expedite decision making'
          });
        }
        
        // Rejected percentage increasing (above 30%)
        if (rejectionRate > 30 && totalCandidates > 10) {
          recommendations.push({
            priority: 'medium',
            category: 'Screening',
            message: `Rejection rate is ${rejectionRate.toFixed(1)}% (above 30% threshold). Review screening criteria and job requirements.`,
            action: 'Analyze rejection reasons, adjust job requirements, and improve screening process'
          });
        }
        
        // Withdrawn candidates (above 10%)
        if (withdrawalRate > 10 && totalCandidates > 10) {
          recommendations.push({
            priority: 'low',
            category: 'Candidate Experience',
            message: `Withdrawal rate is ${withdrawalRate.toFixed(1)}% (above 10% threshold). Improve candidate engagement and communication.`,
            action: 'Conduct exit interviews, improve communication, and enhance candidate experience'
          });
        }
        
        // New candidates (low volume)
        if (newCandidates < 5 && totalCandidates > 20) {
          recommendations.push({
            priority: 'medium',
            category: 'Sourcing',
            message: `Only ${newCandidates} new candidates in the last 7 days. Increase sourcing efforts.`,
            action: 'Expand job postings, increase recruitment marketing, and leverage employee referrals'
          });
        }
        
        // High average salary (potential budget concern)
        const avgSalary = data.avgSalary || 0;
        if (avgSalary > 120000 && totalHired > 5) {
          recommendations.push({
            priority: 'low',
            category: 'Budget',
            message: `Average salary of $${Math.round(avgSalary).toLocaleString()} is high. Review compensation strategy.`,
            action: 'Analyze salary bands and ensure competitive but sustainable compensation'
          });
        }
        
        // No recommendations if everything is healthy
        if (recommendations.length === 0) {
          recommendations.push({
            priority: 'low',
            category: 'Status',
            message: 'All hiring metrics are within healthy ranges. Continue current strategies.',
            action: 'Monitor trends and maintain current processes'
          });
        }
        
        resolve(recommendations);
      });
    });
  }

  static getCandidatesWithFilters(filters = {}) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      let query = 'SELECT * FROM candidates WHERE 1=1';
      const params = [];
      
      if (filters.search) {
        query += ' AND (name LIKE ? OR email LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      
      if (filters.department) {
        query += ' AND department = ?';
        params.push(filters.department);
      }
      
      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }
      
      if (filters.sortBy) {
        const sortOrder = filters.sortOrder || 'ASC';
        query += ` ORDER BY ${filters.sortBy} ${sortOrder}`;
      } else {
        query += ' ORDER BY createdAt DESC';
      }
      
      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
      }
      
      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
      }
      
      db.all(query, params, (err, rows) => {
        db.close();
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      });
    });
  }

  static getCandidatesCount(filters = {}) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      let query = 'SELECT COUNT(*) as total FROM candidates WHERE 1=1';
      const params = [];
      
      if (filters.search) {
        query += ' AND (name LIKE ? OR email LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      
      if (filters.department) {
        query += ' AND department = ?';
        params.push(filters.department);
      }
      
      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }
      
      db.get(query, params, (err, row) => {
        db.close();
        if (err) {
          reject(err);
          return;
        }
        resolve(row ? row.total : 0);
      });
    });
  }

  static getDepartmentStats() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.all(`
        SELECT 
          department,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Hired' THEN 1 ELSE 0 END) as hired,
          SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN status = 'Applied' THEN 1 ELSE 0 END) as applied,
          SUM(CASE WHEN status IN ('Offer Generated', 'Offer Sent', 'Offer Viewed', 'Offer Signed', 'Offer Verified', 'Hired') THEN 1 ELSE 0 END) as offers,
          AVG(salary) as avgSalary
        FROM candidates
        GROUP BY department
        ORDER BY hired DESC
      `, (err, rows) => {
        db.close();
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      });
    });
  }

  static getStatusDistribution() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.all(`
        SELECT 
          status,
          COUNT(*) as count,
          ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM candidates), 1) as percentage
        FROM candidates
        GROUP BY status
        ORDER BY 
          CASE status
            WHEN 'Applied' THEN 1
            WHEN 'Interview Scheduled' THEN 2
            WHEN 'Interview Completed' THEN 3
            WHEN 'Offer Generated' THEN 4
            WHEN 'Offer Sent' THEN 5
            WHEN 'Offer Viewed' THEN 6
            WHEN 'Offer Signed' THEN 7
            WHEN 'Offer Verified' THEN 8
            WHEN 'Hired' THEN 9
            WHEN 'Rejected' THEN 10
            WHEN 'Withdrawn' THEN 11
          END
      `, (err, rows) => {
        db.close();
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      });
    });
  }

  static getRecentHires(limit = 10) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.all(`
        SELECT 
          id,
          name,
          role,
          department,
          salary,
          hireDate,
          createdAt
        FROM candidates
        WHERE status = 'Hired'
        ORDER BY hireDate DESC
        LIMIT ?
      `, [limit], (err, rows) => {
        db.close();
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      });
    });
  }
}

module.exports = DashboardModel;