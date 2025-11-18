-- Database schema for Website Accessibility Checker
-- SQLite database with 2 main tables: users and scans

-- Table 1: users
-- Stores user registration information (email gate data)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  whatsapp TEXT,
  has_website BOOLEAN DEFAULT 0,
  website_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  total_scans INTEGER DEFAULT 0
);

-- Table 2: scans
-- Stores scan history for each user
CREATE TABLE IF NOT EXISTS scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  score INTEGER NOT NULL,
  violations_count INTEGER NOT NULL,
  critical_count INTEGER DEFAULT 0,
  serious_count INTEGER DEFAULT 0,
  moderate_count INTEGER DEFAULT 0,
  minor_count INTEGER DEFAULT 0,
  violations_json TEXT,
  scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_scanned_at ON scans(scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
