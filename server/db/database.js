import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../geocrop.db');

// Connect to SQLite database (creates file automatically if not exists)
const db = new Database(dbPath, { verbose: null });

// Enable Foreign Key constraints and WAL mode for high performance concurrency
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

/**
 * Automatically creates all required database tables, constraints, and indexes
 */
export function initDatabase() {
  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      mobile TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      is_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);
  `);

  // 2. Pending Registrations Table (Holds user data UNTIL OTP is verified)
  db.exec(`
    CREATE TABLE IF NOT EXISTS pending_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      mobile TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      otp_code_hash TEXT NOT NULL,
      plain_otp TEXT,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. OTP Verification Table (Legacy / fallback, optional)
  db.exec(`
    CREATE TABLE IF NOT EXISTS otp_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      otp_code_hash TEXT NOT NULL,
      plain_otp TEXT,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_otp_user_id ON otp_verifications(user_id);
  `);

  // 3. Password Resets Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      reset_otp_hash TEXT NOT NULL,
      plain_otp TEXT,
      expires_at DATETIME NOT NULL,
      is_used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_pw_reset_user_id ON password_resets(user_id);
  `);

  // 4. Login Attempts & Account Lockout Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      identifier TEXT NOT NULL UNIQUE, -- username, email, or IP address
      failed_count INTEGER DEFAULT 0,
      locked_until DATETIME,
      last_attempt_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_login_attempts_identifier ON login_attempts(identifier);
  `);

  // 6. Official Audit Generated Reports Table (For Government / Structural Audit Records)
  db.exec(`
    CREATE TABLE IF NOT EXISTS generated_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_ref_id TEXT NOT NULL UNIQUE,
      user_id INTEGER,
      engineer_name TEXT,
      location_city TEXT,
      location_district TEXT,
      gps_coords TEXT,
      soil_type TEXT,
      safe_bearing_capacity REAL,
      max_safe_floors INTEGER,
      target_floors INTEGER,
      target_status TEXT,
      pdf_base64 TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_reports_ref_id ON generated_reports(report_ref_id);
    CREATE INDEX IF NOT EXISTS idx_reports_user_id ON generated_reports(user_id);
  `);

  console.log('✅ SQLite Database & Tables Initialized Successfully at:', dbPath);
}

export default db;
