const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'hiring.db');

function getDatabase() {
  const db = new sqlite3.Database(DB_PATH);
  return db;
}

function generateVerificationHash(candidateId, offerSigned) {
  const data = `${candidateId}-${offerSigned}-${Date.now()}-${Math.random()}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

function fixVerificationHashes(db) {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT id FROM candidates WHERE offerSigned = 1 AND (verificationHash IS NULL OR verificationHash = "")',
      (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (rows.length === 0) {
          resolve();
          return;
        }
        
        let completed = 0;
        rows.forEach((row) => {
          const hash = generateVerificationHash(row.id, true);
          db.run(
            'UPDATE candidates SET verificationHash = ? WHERE id = ?',
            [hash, row.id],
            (updateErr) => {
              if (updateErr) {
                console.error(`Error updating hash for candidate ${row.id}:`, updateErr);
              }
              completed++;
              if (completed === rows.length) {
                resolve();
              }
            }
          );
        });
      }
    );
  });
}

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);

    db.serialize(() => {
      // Create Candidates table
      db.run(`
        CREATE TABLE IF NOT EXISTS candidates (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          role TEXT NOT NULL,
          department TEXT NOT NULL,
          salary REAL,
          status TEXT NOT NULL,
          offerSent BOOLEAN DEFAULT 0,
          offerSigned BOOLEAN DEFAULT 0,
          verificationHash TEXT,
          offerDate TEXT,
          hireDate TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating candidates table:', err);
          reject(err);
          return;
        }
        console.log('✅ Candidates table created/verified');
      });

      // Create Events table
      db.run(`
        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          candidateId INTEGER,
          eventType TEXT NOT NULL,
          description TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (candidateId) REFERENCES candidates (id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating events table:', err);
          reject(err);
          return;
        }
        console.log('✅ Events table created/verified');
      });

      // Create indexes for performance
      db.run(`CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status)`, (err) => {
        if (err) console.error('Error creating status index:', err);
      });
      db.run(`CREATE INDEX IF NOT EXISTS idx_candidates_department ON candidates(department)`, (err) => {
        if (err) console.error('Error creating department index:', err);
      });
      db.run(`CREATE INDEX IF NOT EXISTS idx_candidates_offerDate ON candidates(offerDate)`, (err) => {
        if (err) console.error('Error creating offerDate index:', err);
      });
      db.run(`CREATE INDEX IF NOT EXISTS idx_events_candidateId ON events(candidateId)`, (err) => {
        if (err) console.error('Error creating events index:', err);
      });

      // Check if we need to seed data
      db.get('SELECT COUNT(*) as count FROM candidates', (err, row) => {
        if (err) {
          console.error('Error checking candidates:', err);
          reject(err);
          return;
        }
        
        if (row.count === 0) {
          console.log('Seeding initial data...');
          seedDatabase(db).then(() => {
            console.log('✅ Database seeded successfully');
            // Fix verification hashes after seeding
            return fixVerificationHashes(db);
          }).then(() => {
            console.log('✅ Verification hashes generated for signed offers');
            resolve();
          }).catch(reject);
        } else {
          console.log(`✅ Database already contains ${row.count} candidates`);
          // Fix verification hashes for existing data
          fixVerificationHashes(db).then(() => {
            console.log('✅ Verification hashes verified/fixed for signed offers');
            resolve();
          }).catch(reject);
        }
      });
    });
  });
}

function seedDatabase(db) {
  return new Promise((resolve, reject) => {
    const candidates = generateCandidates();
    let completed = 0;
    const total = candidates.length;

    candidates.forEach((candidate, index) => {
      const stmt = db.prepare(`
        INSERT INTO candidates (
          name, email, role, department, salary, status, 
          offerSent, offerSigned, verificationHash, offerDate, hireDate, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        candidate.name,
        candidate.email,
        candidate.role,
        candidate.department,
        candidate.salary,
        candidate.status,
        candidate.offerSent ? 1 : 0,
        candidate.offerSigned ? 1 : 0,
        candidate.verificationHash,
        candidate.offerDate,
        candidate.hireDate,
        candidate.createdAt
      );

      stmt.finalize((err) => {
        if (err) {
          console.error('Error inserting candidate:', err);
          reject(err);
          return;
        }

        completed++;
        // Create events for this candidate
        createEventsForCandidate(db, candidate, index + 1);

        if (completed === total) {
          resolve();
        }
      });
    });
  });
}

function createEventsForCandidate(db, candidate, candidateId) {
  const events = [
    { eventType: 'Applied', description: `${candidate.name} applied for ${candidate.role}` },
  ];

  if (candidate.status === 'Interview Scheduled' || candidate.status === 'Interview Completed' || candidate.status === 'Offer Generated' || candidate.status === 'Offer Sent' || candidate.status === 'Offer Viewed' || candidate.status === 'Offer Signed' || candidate.status === 'Offer Verified' || candidate.status === 'Hired') {
    events.push({ eventType: 'Interview Scheduled', description: `${candidate.name} scheduled for interview` });
  }

  if (candidate.status === 'Interview Completed' || candidate.status === 'Offer Generated' || candidate.status === 'Offer Sent' || candidate.status === 'Offer Viewed' || candidate.status === 'Offer Signed' || candidate.status === 'Offer Verified' || candidate.status === 'Hired') {
    events.push({ eventType: 'Interview Completed', description: `${candidate.name} completed interview` });
  }

  if (candidate.status === 'Offer Generated' || candidate.status === 'Offer Sent' || candidate.status === 'Offer Viewed' || candidate.status === 'Offer Signed' || candidate.status === 'Offer Verified' || candidate.status === 'Hired') {
    events.push({ eventType: 'Offer Generated', description: `Offer generated for ${candidate.name}` });
  }

  if (candidate.offerSent) {
    events.push({ eventType: 'Offer Sent', description: `Offer sent to ${candidate.name}` });
  }

  if (candidate.offerSigned) {
    events.push({ eventType: 'Offer Signed', description: `${candidate.name} signed the offer` });
    // Add verification event if offer is signed
    events.push({ eventType: 'Offer Verified', description: `Offer verified for ${candidate.name}` });
  }

  if (candidate.status === 'Hired') {
    events.push({ eventType: 'Hired', description: `${candidate.name} hired` });
  }

  if (candidate.status === 'Rejected') {
    events.push({ eventType: 'Rejected', description: `${candidate.name} rejected` });
  }

  if (candidate.status === 'Withdrawn') {
    events.push({ eventType: 'Withdrawn', description: `${candidate.name} withdrawn` });
  }

  events.forEach((event) => {
    const stmt = db.prepare(`
      INSERT INTO events (candidateId, eventType, description, createdAt)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(candidateId || 1, event.eventType, event.description, new Date().toISOString());
    stmt.finalize();
  });
}

function generateCandidates() {
  const names = [
    'John Smith', 'Emma Johnson', 'Michael Brown', 'Sarah Davis', 'James Wilson',
    'Emily Martinez', 'Robert Taylor', 'Olivia Anderson', 'William Thomas', 'Sophia Jackson',
    'David White', 'Isabella Harris', 'Richard Martin', 'Mia Thompson', 'Joseph Garcia',
    'Charlotte Martinez', 'Thomas Robinson', 'Amelia Clark', 'Charles Lewis', 'Evelyn Lee',
    'Christopher Walker', 'Abigail Hall', 'Daniel Allen', 'Emily Young', 'Matthew Hernandez',
    'Grace King', 'Anthony Wright', 'Victoria Lopez', 'Donald Hill', 'Madison Scott',
    'Steven Adams', 'Jessica Rivera', 'Kevin Mitchell', 'Laura Phillips', 'Brian Campbell'
  ];

  const roles = [
    'Software Engineer', 'Senior Software Engineer', 'Frontend Developer',
    'Backend Developer', 'Full Stack Developer', 'DevOps Engineer',
    'Data Scientist', 'Product Manager', 'UX Designer', 'QA Engineer',
    'Tech Lead', 'Engineering Manager', 'Solutions Architect', 'Cloud Engineer',
    'Data Analyst'
  ];

  const departments = ['Engineering', 'Product', 'Design', 'Data', 'QA', 'DevOps'];

  const statuses = [
    'Applied', 'Interview Scheduled', 'Interview Completed', 'Offer Generated',
    'Offer Sent', 'Offer Viewed', 'Offer Signed', 'Offer Verified', 'Hired',
    'Rejected', 'Withdrawn'
  ];

  const candidates = [];
  const now = Date.now();
  const sixMonthsAgo = now - (180 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < 35; i++) {
    const name = names[i % names.length];
    const role = roles[i % roles.length];
    const department = departments[i % departments.length];
    const status = statuses[i % statuses.length];
    const salary = 60000 + Math.floor(Math.random() * 100000);
    const offerSent = Math.random() > 0.3;
    const offerSigned = offerSent && Math.random() > 0.4;

    const createdAt = new Date(sixMonthsAgo + Math.random() * (now - sixMonthsAgo));
    const offerDate = offerSent ? new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) : null;
    const hireDate = status === 'Hired' ? new Date(offerDate ? offerDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000 : createdAt.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000) : null;

    // Generate verification hash for signed offers
    const verificationHash = offerSigned ? generateVerificationHash(i + 1, true) : null;

    candidates.push({
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@company.com`,
      role,
      department,
      salary: Math.round(salary / 1000) * 1000,
      status,
      offerSent,
      offerSigned,
      verificationHash,
      offerDate: offerDate ? offerDate.toISOString() : null,
      hireDate: hireDate ? hireDate.toISOString() : null,
      createdAt: createdAt.toISOString()
    });
  }

  return candidates;
}

module.exports = {
  getDatabase,
  initializeDatabase,
  generateVerificationHash,
  fixVerificationHashes
};