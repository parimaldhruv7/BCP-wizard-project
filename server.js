import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database
const sqlite3Verbose = sqlite3.verbose();
const db = new sqlite3Verbose.Database('bcp_database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS bcps (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      business_unit TEXT,
      sub_business_unit TEXT,
      service_name TEXT NOT NULL,
      service_description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS processes (
      id TEXT PRIMARY KEY,
      bcp_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sites TEXT,
      primary_owner_name TEXT,
      primary_owner_email TEXT,
      backup_owner_name TEXT,
      backup_owner_email TEXT,
      FOREIGN KEY (bcp_id) REFERENCES bcps (id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS bia_data (
      id TEXT PRIMARY KEY,
      bcp_id TEXT NOT NULL,
      criticality_unit TEXT,
      criticality_value INTEGER,
      headcount_requirement INTEGER,
      dependencies TEXT,
      FOREIGN KEY (bcp_id) REFERENCES bcps (id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS communications (
      id TEXT PRIMARY KEY,
      bcp_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      type TEXT DEFAULT 'individual',
      FOREIGN KEY (bcp_id) REFERENCES bcps (id)
    )`,
    
    `CREATE TABLE IF NOT EXISTS risks (
      id TEXT PRIMARY KEY,
      bcp_id TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (bcp_id) REFERENCES bcps (id)
    )`
  ];

  queries.forEach(query => {
    db.run(query, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      }
    });
  });
}

// API Routes

// Create new BCP
app.post('/api/bcp', (req, res) => {
  const { name, businessUnit, subBusinessUnit, serviceName, serviceDescription } = req.body;
  const id = uuidv4();
  
  const query = `INSERT INTO bcps (id, name, business_unit, sub_business_unit, service_name, service_description) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [id, name, businessUnit, subBusinessUnit, serviceName, serviceDescription], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, message: 'BCP created successfully' });
  });
});

// Save processes for a BCP
app.post('/api/bcp/:id/processes', (req, res) => {
  const { id } = req.params;
  const { processes } = req.body;
  
  // Clear existing processes for this BCP
  db.run('DELETE FROM processes WHERE bcp_id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Insert new processes
    const insertQuery = `INSERT INTO processes 
      (id, bcp_id, name, sites, primary_owner_name, primary_owner_email, backup_owner_name, backup_owner_email) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
    processes.forEach(process => {
      const processId = uuidv4();
      db.run(insertQuery, [
        processId, id, process.name, JSON.stringify(process.sites),
        process.primaryOwner.name, process.primaryOwner.email,
        process.backupOwner.name, process.backupOwner.email
      ]);
    });
    
    res.json({ message: 'Processes saved successfully' });
  });
});

// Save BIA data
app.post('/api/bcp/:id/bia', (req, res) => {
  const { id } = req.params;
  const { criticalityUnit, criticalityValue, headcountRequirement, dependencies } = req.body;
  
  // Clear existing BIA data
  db.run('DELETE FROM bia_data WHERE bcp_id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Insert new BIA data
    const query = `INSERT INTO bia_data (id, bcp_id, criticality_unit, criticality_value, headcount_requirement, dependencies) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
    
    const biaId = uuidv4();
    db.run(query, [biaId, id, criticalityUnit, criticalityValue, headcountRequirement, JSON.stringify(dependencies)], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'BIA data saved successfully' });
    });
  });
});

// Save communications
app.post('/api/bcp/:id/communications', (req, res) => {
  const { id } = req.params;
  const { communications } = req.body;
  
  // Clear existing communications
  db.run('DELETE FROM communications WHERE bcp_id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Insert new communications
    const query = `INSERT INTO communications (id, bcp_id, name, email, type) VALUES (?, ?, ?, ?, ?)`;
    
    communications.forEach(comm => {
      const commId = uuidv4();
      db.run(query, [commId, id, comm.name, comm.email, comm.type || 'individual']);
    });
    
    res.json({ message: 'Communications saved successfully' });
  });
});

// Save risks
app.post('/api/bcp/:id/risks', (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  
  // Clear existing risks
  db.run('DELETE FROM risks WHERE bcp_id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Insert new risk
    if (description && description.trim()) {
      const query = `INSERT INTO risks (id, bcp_id, description) VALUES (?, ?, ?)`;
      const riskId = uuidv4();
      db.run(query, [riskId, id, description]);
    }
    
    res.json({ message: 'Risks saved successfully' });
  });
});

// Get all BCPs
app.get('/api/bcps', (req, res) => {
  const query = 'SELECT * FROM bcps ORDER BY created_at DESC';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get BCP report
app.get('/api/bcp/:id/report', (req, res) => {
  const { id } = req.params;
  
  const queries = {
    bcp: 'SELECT * FROM bcps WHERE id = ?',
    processes: 'SELECT * FROM processes WHERE bcp_id = ?',
    bia: 'SELECT * FROM bia_data WHERE bcp_id = ?',
    communications: 'SELECT * FROM communications WHERE bcp_id = ?',
    risks: 'SELECT * FROM risks WHERE bcp_id = ?'
  };
  
  const report = {};
  let completed = 0;
  const total = Object.keys(queries).length;
  
  Object.keys(queries).forEach(key => {
    db.all(queries[key], [id], (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      report[key] = rows;
      completed++;
      
      if (completed === total) {
        // Parse JSON fields
        if (report.processes) {
          report.processes.forEach(process => {
            try {
              process.sites = JSON.parse(process.sites || '[]');
            } catch (e) {
              process.sites = [];
            }
          });
        }
        
        if (report.bia && report.bia.length > 0) {
          try {
            report.bia[0].dependencies = JSON.parse(report.bia[0].dependencies || '[]');
          } catch (e) {
            report.bia[0].dependencies = [];
          }
        }
        
        res.json(report);
      }
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});