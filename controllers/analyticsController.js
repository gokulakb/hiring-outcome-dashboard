const AnalyticsModel = require('../models/analyticsModel');

class AnalyticsController {
  async getHiringAnalytics(req, res) {
    try {
      const pieData = await AnalyticsModel.getHiringOutcomePieData();
      const statusData = await AnalyticsModel.getCandidateStatusBarData();
      const departments = await AnalyticsModel.getDepartmentHiringData();
      const hiringSuccess = await AnalyticsModel.getHiringSuccessPercentage();
      const offerAcceptance = await AnalyticsModel.getOfferAcceptancePercentage();
      const verificationSuccess = await AnalyticsModel.getVerificationSuccessPercentage();
      
      res.json({
        success: true,
        data: {
          pieData,
          statusData,
          departmentData: departments,
          hiringSuccess,
          offerAcceptance,
          verificationSuccess
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching hiring analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch hiring analytics',
        message: error.message
      });
    }
  }

  async getFunnelAnalytics(req, res) {
    try {
      const funnelData = await AnalyticsModel.getOfferFunnelData();
      const funnelAnalytics = await AnalyticsModel.getFunnelAnalytics();
      const recentActivities = await AnalyticsModel.getRecentActivities();
      
      res.json({
        success: true,
        data: {
          funnelData,
          funnelAnalytics,
          recentActivities
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching funnel analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch funnel analytics',
        message: error.message
      });
    }
  }

  async getDepartmentAnalytics(req, res) {
    try {
      const departments = await AnalyticsModel.getDepartmentWiseHiring();
      const avgSalaries = await AnalyticsModel.getAvgSalaryByDepartment();
      
      res.json({
        success: true,
        data: {
          departments,
          avgSalaries
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching department analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch department analytics',
        message: error.message
      });
    }
  }

  async getTrendsAnalytics(req, res) {
    try {
      const dailyTrends = await AnalyticsModel.getDailyHiringTrendData();
      const monthlyTrends = await AnalyticsModel.getHiringTrends();
      const salaryDistribution = await AnalyticsModel.getSalaryDistributionData();
      
      res.json({
        success: true,
        data: {
          dailyTrends,
          monthlyTrends,
          salaryDistribution
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching trends analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trends analytics',
        message: error.message
      });
    }
  }
}

module.exports = new AnalyticsController();