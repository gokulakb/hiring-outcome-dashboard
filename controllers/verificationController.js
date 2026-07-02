const VerificationModel = require('../models/verificationModel');

class VerificationController {
  async verifyOffer(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Candidate ID is required'
        });
      }
      
      // Check if id is a valid number
      const candidateId = parseInt(id);
      if (isNaN(candidateId) || candidateId <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid candidate ID. Please provide a positive number.',
          verified: false
        });
      }
      
      const result = await VerificationModel.verifyOffer(candidateId);
      
      if (result.error) {
        return res.status(400).json({
          success: false,
          error: result.error,
          verified: false
        });
      }
      
      // If verified, update the candidate status
      if (result.verified) {
        await VerificationModel.updateVerificationStatus(candidateId, true);
      }
      
      res.json({
        success: true,
        verified: result.verified,
        candidate: result.candidate,
        status: result.status,
        message: result.message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error verifying offer:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify offer',
        message: error.message,
        verified: false
      });
    }
  }

  async getVerificationStatus(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Candidate ID is required'
        });
      }
      
      const candidateId = parseInt(id);
      if (isNaN(candidateId) || candidateId <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid candidate ID. Please provide a positive number.'
        });
      }
      
      const db = require('../database/database').getDatabase();
      
      db.get(
        'SELECT id, name, verificationHash, offerSigned, status FROM candidates WHERE id = ?',
        [candidateId],
        (err, row) => {
          db.close();
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
              success: false,
              error: 'Database error',
              message: err.message
            });
          }
          
          if (!row) {
            return res.status(404).json({
              success: false,
              error: `Candidate with ID ${candidateId} not found`
            });
          }
          
          res.json({
            success: true,
            data: {
              id: row.id,
              name: row.name,
              verified: row.verificationHash !== null && row.offerSigned === 1,
              offerSigned: row.offerSigned === 1,
              status: row.status,
              hasHash: row.verificationHash !== null
            },
            timestamp: new Date().toISOString()
          });
        }
      );
    } catch (error) {
      console.error('Error fetching verification status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch verification status',
        message: error.message
      });
    }
  }

  async fixVerificationHashes(req, res) {
    try {
      const result = await VerificationModel.fixVerificationHashes();
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fixing verification hashes:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fix verification hashes',
        message: error.message
      });
    }
  }

  async getSignedOffers(req, res) {
    try {
      const db = require('../database/database').getDatabase();
      
      db.all(
        `SELECT id, name, status, offerSigned, 
         CASE WHEN verificationHash IS NOT NULL THEN 1 ELSE 0 END as verificationHash 
         FROM candidates 
         WHERE offerSigned = 1 
         ORDER BY id`,
        (err, rows) => {
          db.close();
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
              success: false,
              error: 'Database error',
              message: err.message
            });
          }
          
          res.json({
            success: true,
            data: rows || [],
            count: rows ? rows.length : 0,
            timestamp: new Date().toISOString()
          });
        }
      );
    } catch (error) {
      console.error('Error fetching signed offers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch signed offers',
        message: error.message
      });
    }
  }
}

module.exports = new VerificationController();