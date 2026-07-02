const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/hiring', analyticsController.getHiringAnalytics);
router.get('/funnel', analyticsController.getFunnelAnalytics);
router.get('/departments', analyticsController.getDepartmentAnalytics);
router.get('/trends', analyticsController.getTrendsAnalytics);

module.exports = router;