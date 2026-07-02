const DashboardModel = require('../models/dashboardModel');

class DashboardController {
  async getDashboardData(req, res) {
    try {
      const kpis = await DashboardModel.getKPIs();
      const timeline = await DashboardModel.getTimeline();
      const recommendations = await DashboardModel.getRecommendations();
      
      res.json({
        success: true,
        data: {
          kpis,
          timeline,
          recommendations,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard data',
        message: error.message
      });
    }
  }

  async getKPIs(req, res) {
    try {
      const kpis = await DashboardModel.getKPIs();
      res.json({
        success: true,
        data: kpis,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch KPIs',
        message: error.message
      });
    }
  }

  async getTimeline(req, res) {
    try {
      const timeline = await DashboardModel.getTimeline();
      res.json({
        success: true,
        data: timeline,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching timeline:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch timeline',
        message: error.message
      });
    }
  }

  async getRecommendations(req, res) {
    try {
      const recommendations = await DashboardModel.getRecommendations();
      res.json({
        success: true,
        data: recommendations,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch recommendations',
        message: error.message
      });
    }
  }
}

module.exports = new DashboardController();