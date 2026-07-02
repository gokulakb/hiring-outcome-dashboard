const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');

router.post('/:id', verificationController.verifyOffer.bind(verificationController));
router.get('/status/:id', verificationController.getVerificationStatus.bind(verificationController));
router.get('/signed-offers', verificationController.getSignedOffers.bind(verificationController));
router.post('/fix-hashes', verificationController.fixVerificationHashes.bind(verificationController));

// Helper endpoint to list all candidates with their verification status
router.get('/candidates/all', (req, res) => {
  const db = require('../database/database').getDatabase();
  
  db.all(
    `SELECT id, name, status, offerSent, offerSigned, 
     CASE WHEN verificationHash IS NOT NULL THEN 1 ELSE 0 END as hasHash 
     FROM candidates 
     ORDER BY id`,
    (err, rows) => {
      db.close();
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Database error',
          message: err.message
        });
      }
      
      res.json({
        success: true,
        data: rows,
        count: rows.length,
        timestamp: new Date().toISOString()
      });
    }
  );
});

// Rate limit status endpoint
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Verification API is working',
    timestamp: new Date().toISOString(),
    endpoints: {
      verify: 'POST /api/verify/:id',
      status: 'GET /api/verify/status/:id',
      signedOffers: 'GET /api/verify/signed-offers',
      allCandidates: 'GET /api/verify/candidates/all',
      fixHashes: 'POST /api/verify/fix-hashes'
    }
  });
});

module.exports = router;