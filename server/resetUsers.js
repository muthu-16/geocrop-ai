import db, { initDatabase } from './db/database.js';

initDatabase();

console.log('🧹 Clearing all registered accounts, emails, mobile numbers, and sessions...');

db.prepare('DELETE FROM users').run();
db.prepare('DELETE FROM otp_verifications').run();
db.prepare('DELETE FROM password_resets').run();
db.prepare('DELETE FROM login_attempts').run();
db.prepare('DELETE FROM sessions').run();

console.log('✅ All registered accounts, emails, numbers, and locks deleted successfully!');
process.exit(0);
