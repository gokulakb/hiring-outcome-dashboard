const { getDatabase } = require('../database/database');

class AnalyticsModel {
  static getHiringOutcomePieData() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.all(`
        SELECT 
          status,
          COUNT(*) as count
        FROM candidates
        GROUP BY status
        ORDER BY count DESC
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

  static getCandidateStatusBarData() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.all(`
        SELECT 
          status,
          COUNT(*) as count
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

  static getDepartmentHiringData() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.all(`
        SELECT 
          department,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Hired' THEN 1 ELSE 0 END) as hired,
          SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN status = 'Applied' THEN 1 ELSE 0 END) as applied
        FROM candidates
        GROUP BY department
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

  static getOfferFunnelData() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.all(`
        SELECT 
          'Applied' as stage,
          COUNT(*) as count
        FROM candidates
        UNION ALL
        SELECT 
          'Interview Scheduled',
          COUNT(*)
        FROM candidates
        WHERE status IN ('Interview Scheduled', 'Interview Completed', 'Offer Generated', 'Offer Sent', 'Offer Viewed', 'Offer Signed', 'Offer Verified', 'Hired')
        UNION ALL
        SELECT 
          'Interview Completed',
          COUNT(*)
        FROM candidates
        WHERE status IN ('Interview Completed', 'Offer Generated', 'Offer Sent', 'Offer Viewed', 'Offer Signed', 'Offer Verified', 'Hired')
        UNION ALL
        SELECT 
          'Offer Generated',
          COUNT(*)
        FROM candidates
        WHERE status IN ('Offer Generated', 'Offer Sent', 'Offer Viewed', 'Offer Signed', 'Offer Verified', 'Hired')
        UNION ALL
        SELECT 
          'Offer Sent',
          COUNT(*)
        FROM candidates
        WHERE offerSent = 1
        UNION ALL
        SELECT 
          'Offer Signed',
          COUNT(*)
        FROM candidates
        WHERE offerSigned = 1
        UNION ALL
        SELECT 
          'Hired',
          COUNT(*)
        FROM candidates
        WHERE status = 'Hired'
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

  static getDailyHiringTrendData() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.all(`
        SELECT 
          date(createdAt) as date,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Hired' THEN 1 ELSE 0 END) as hired,
          SUM(CASE WHEN status = 'Applied' THEN 1 ELSE 0 END) as applied
        FROM candidates
        WHERE createdAt >= datetime('now', '-30 days')
        GROUP BY date(createdAt)
        ORDER BY date(createdAt) ASC
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

  static getSalaryDistributionData() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.all(`
        SELECT 
          department,
          AVG(salary) as avgSalary,
          MIN(salary) as minSalary,
          MAX(salary) as maxSalary,
          COUNT(*) as count
        FROM candidates
        WHERE salary IS NOT NULL AND salary > 0
        GROUP BY department
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

  static getRecentActivities() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.all(`
        SELECT 
          e.id,
          e.eventType,
          e.description,
          e.createdAt,
          c.name as candidateName,
          c.role as candidateRole
        FROM events e
        JOIN candidates c ON e.candidateId = c.id
        ORDER BY e.createdAt DESC
        LIMIT 20
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

  static getDepartmentWiseHiring() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.all(`
        SELECT 
          department,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Hired' THEN 1 ELSE 0 END) as hired,
          SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN status = 'Applied' THEN 1 ELSE 0 END) as applied
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

  static getAvgSalaryByDepartment() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.all(`
        SELECT 
          department,
          AVG(salary) as avgSalary,
          COUNT(*) as count
        FROM candidates
        WHERE salary IS NOT NULL AND salary > 0
        GROUP BY department
        ORDER BY avgSalary DESC
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

  static getHiringTrends() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.all(`
        SELECT 
          strftime('%Y-%m', createdAt) as month,
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Hired' THEN 1 ELSE 0 END) as hired,
          SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
          SUM(CASE WHEN status = 'Applied' THEN 1 ELSE 0 END) as applied
        FROM candidates
        GROUP BY strftime('%Y-%m', createdAt)
        ORDER BY month ASC
        LIMIT 12
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

  static getFunnelAnalytics() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.all(`
        SELECT 
          'Applied' as stage,
          COUNT(*) as total
        FROM candidates
        UNION ALL
        SELECT 
          'Interview Scheduled',
          COUNT(*)
        FROM candidates
        WHERE status IN ('Interview Scheduled', 'Interview Completed', 'Offer Generated', 'Offer Sent', 'Offer Viewed', 'Offer Signed', 'Offer Verified', 'Hired')
        UNION ALL
        SELECT 
          'Interview Completed',
          COUNT(*)
        FROM candidates
        WHERE status IN ('Interview Completed', 'Offer Generated', 'Offer Sent', 'Offer Viewed', 'Offer Signed', 'Offer Verified', 'Hired')
        UNION ALL
        SELECT 
          'Offer Generated',
          COUNT(*)
        FROM candidates
        WHERE status IN ('Offer Generated', 'Offer Sent', 'Offer Viewed', 'Offer Signed', 'Offer Verified', 'Hired')
        UNION ALL
        SELECT 
          'Offer Sent',
          COUNT(*)
        FROM candidates
        WHERE offerSent = 1
        UNION ALL
        SELECT 
          'Offer Signed',
          COUNT(*)
        FROM candidates
        WHERE offerSigned = 1
        UNION ALL
        SELECT 
          'Offer Verified',
          COUNT(*)
        FROM candidates
        WHERE status = 'Offer Verified'
        UNION ALL
        SELECT 
          'Hired',
          COUNT(*)
        FROM candidates
        WHERE status = 'Hired'
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

  static getHiringSuccessPercentage() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Hired' THEN 1 ELSE 0 END) as hired
        FROM candidates
      `, (err, row) => {
        db.close();
        if (err) {
          reject(err);
          return;
        }
        
        const total = row.total || 0;
        const hired = row.hired || 0;
        const percentage = total > 0 ? (hired / total) * 100 : 0;
        
        resolve({
          percentage: Math.round(percentage * 100) / 100,
          hired,
          total
        });
      });
    });
  }

  static getOfferAcceptancePercentage() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.get(`
        SELECT 
          SUM(CASE WHEN status IN ('Offer Generated', 'Offer Sent', 'Offer Viewed', 'Offer Signed', 'Offer Verified', 'Hired') THEN 1 ELSE 0 END) as offers,
          SUM(CASE WHEN offerSigned = 1 THEN 1 ELSE 0 END) as signed
        FROM candidates
      `, (err, row) => {
        db.close();
        if (err) {
          reject(err);
          return;
        }
        
        const offers = row.offers || 0;
        const signed = row.signed || 0;
        const percentage = offers > 0 ? (signed / offers) * 100 : 0;
        
        resolve({
          percentage: Math.round(percentage * 100) / 100,
          signed,
          offers
        });
      });
    });
  }

  static getVerificationSuccessPercentage() {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      
      db.get(`
        SELECT 
          SUM(CASE WHEN offerSigned = 1 THEN 1 ELSE 0 END) as signed,
          SUM(CASE WHEN verificationHash IS NOT NULL AND status = 'Offer Verified' THEN 1 ELSE 0 END) as verified
        FROM candidates
        WHERE offerSigned = 1
      `, (err, row) => {
        db.close();
        if (err) {
          reject(err);
          return;
        }
        
        const signed = row.signed || 0;
        const verified = row.verified || 0;
        const percentage = signed > 0 ? (verified / signed) * 100 : 0;
        
        resolve({
          percentage: Math.round(percentage * 100) / 100,
          verified,
          signed
        });
      });
    });
  }
}

module.exports = AnalyticsModel;