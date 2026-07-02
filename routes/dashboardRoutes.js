const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Make sure the controller methods are defined
router.get('/', dashboardController.getDashboardData.bind(dashboardController));
router.get('/kpis', dashboardController.getKPIs.bind(dashboardController));
router.get('/timeline', dashboardController.getTimeline.bind(dashboardController));
router.get('/recommendations', dashboardController.getRecommendations.bind(dashboardController));

module.exports = router;