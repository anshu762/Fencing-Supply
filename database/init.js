/**
 * Database Initialization — Neon PostgreSQL
 * Creates all tables and indexes
 */
require('dotenv').config();
const db = require('./db');
const migrations = require('./migrations');

async function initDatabase() {
  console.log('🔧 Initializing Neon PostgreSQL database...');
  console.log('📡 Connecting to:', process.env.DATABASE_URL?.substring(0, 30) + '...');

  try {
    // Test connection
    const test = await db.get('SELECT 1 as test');
    console.log('✅ Database connected:', test);

    // Run all migrations
    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      try {
        await db.exec(migration);
        const tableName = migration.match(/CREATE (?:TABLE|INDEX) IF NOT EXISTS (\w+)/i);
        if (tableName) {
          console.log(`  ✓ ${tableName[1]}`);
        }
      } catch (err) {
        // Index creation on existing index is OK
        if (!err.message.includes('already exists')) {
          console.error(`  ✗ Migration ${i + 1} failed:`, err.message);
        }
      }
    }

    // Insert default settings
    const defaultSettings = [
      ['market', 'India'],
      ['language', 'English'],
      ['cart_rule', 'one_supplier_per_cart'],
      ['express_response_minutes', '30'],
      ['standard_response_hours', '24'],
      ['payment_window_minutes', '15'],
      ['local_express_enabled', '0'],
      ['club_pickup_enabled', '0'],
      ['competition_pickup_enabled', '0'],
      ['cod_enabled', '1']
    ];

    for (const [key, value] of defaultSettings) {
      await db.run(
        `INSERT INTO settings (key, value) VALUES (?, ?)
         ON CONFLICT (key) DO NOTHING`,
        [key, value]
      );
    }

    console.log('✅ Database initialization complete!');
  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initDatabase().then(() => process.exit(0));
}

module.exports = initDatabase;