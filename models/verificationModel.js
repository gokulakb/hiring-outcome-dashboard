const { getDatabase } = require('../database/database');
const crypto = require('crypto');

class VerificationModel {
  static generateHash(candidateId) {
    const data = `${candidateId}-${Date.now()}-${Math.random()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  static verifyOffer(id) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.get(
        'SELECT id, name, verificationHash, offerSigned, status FROM candidates WHERE id = ?',
        [id],
        (err, row) => {
          db.close();
          if (err) {
            reject(err);
            return;
          }
          
          if (!row) {
            resolve({ 
              verified: false, 
              error: 'Candidate not found. Please check the ID and try again.' 
            });
            return;
          }
          
          if (!row.offerSigned) {
            resolve({ 
              verified: false, 
              error: `Offer not signed. Candidate ${row.name} (ID: ${row.id}) has not signed an offer yet. Current status: ${row.status}` 
            });
            return;
          }
          
          if (!row.verificationHash) {
            // Generate a hash for this candidate if they have signed but no hash
            const newHash = this.generateHash(row.id);
            const updateDb = getDatabase();
            updateDb.run(
              'UPDATE candidates SET verificationHash = ? WHERE id = ?',
              [newHash, row.id],
              (updateErr) => {
                updateDb.close();
                if (updateErr) {
                  console.error('Error updating verification hash:', updateErr);
                  resolve({ 
                    verified: false, 
                    error: `Verification hash not found for ${row.name}. Please try again.` 
                  });
                } else {
                  resolve({ 
                    verified: true, 
                    candidate: row.name,
                    status: row.status,
                    message: `Offer verified successfully for ${row.name}! Hash generated.` 
                  });
                }
              }
            );
            return;
          }
          
          resolve({ 
            verified: true, 
            candidate: row.name,
            status: row.status,
            message: `Offer verified successfully for ${row.name}!` 
          });
        }
      );
    });
  }

  static updateVerificationStatus(id, verified) {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      // Only update if currently not verified
      db.get(
        'SELECT status FROM candidates WHERE id = ? AND status != "Offer Verified"',
        [id],
        (err, row) => {
          if (err) {
            db.close();
            reject(err);
            return;
          }
          
          if (!row) {
            db.close();
            resolve({ changes: 0, message: 'Candidate already verified' });
            return;
          }
          
          const status = verified ? 'Offer Verified' : 'Offer Signed';
          
          db.run(
            'UPDATE candidates SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id],
            function(err) {
              db.close();
              if (err) {
                reject(err);
                return;
              }
              resolve({ changes: this.changes });
            }
          );
        }
      );
    });
  }

  static getCandidatesWithSignedOffers() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.all(
        `SELECT id, name, status, offerSigned, 
         CASE WHEN verificationHash IS NOT NULL THEN 1 ELSE 0 END as verificationHash 
         FROM candidates 
         WHERE offerSigned = 1 
         ORDER BY id`,
        (err, rows) => {
          db.close();
          if (err) {
            reject(err);
            return;
          }
          resolve(rows || []);
        }
      );
    });
  }

  static fixVerificationHashes() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      // Find all signed offers without verification hashes
      db.all(
        'SELECT id, name FROM candidates WHERE offerSigned = 1 AND (verificationHash IS NULL OR verificationHash = "")',
        (err, rows) => {
          if (err) {
            db.close();
            reject(err);
            return;
          }
          
          if (rows.length === 0) {
            db.close();
            resolve({ updated: 0, message: 'All signed offers already have verification hashes' });
            return;
          }
          
          let updated = 0;
          const total = rows.length;
          
          rows.forEach((row) => {
            const newHash = this.generateHash(row.id);
            db.run(
              'UPDATE candidates SET verificationHash = ? WHERE id = ?',
              [newHash, row.id],
              (updateErr) => {
                if (updateErr) {
                  console.error(`Error updating hash for candidate ${row.id}:`, updateErr);
                } else {
                  updated++;
                  console.log(`✅ Generated verification hash for ${row.name} (ID: ${row.id})`);
                }
                
                if (updated === total) {
                  db.close();
                  resolve({ 
                    updated, 
                    total, 
                    message: `Generated verification hashes for ${updated} candidates` 
                  });
                }
              }
            );
          });
        }
      );
    });
  }
}

module.exports = VerificationModel;