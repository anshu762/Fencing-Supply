/**
 * Neon PostgreSQL Database Wrapper
 * Provides SQLite-compatible interface (db.get, db.all, db.run)
 * Auto-converts ? placeholders to $1, $2, $n for PostgreSQL
 */
const { neon } = require('@neondatabase/serverless');

let sql;

function getSql() {
  if (!sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

/**
 * Convert SQLite ? placeholders to PostgreSQL $1, $2, $n
 */
function convertQuery(query, params = []) {
  let index = 0;
  const text = query.replace(/\?/g, () => `$${++index}`);
  return { text, values: params };
}

const db = {
  /**
   * Get a single row (like SQLite db.get)
   */
  async get(query, params = []) {
    try {
      const { text, values } = convertQuery(query, params);
      const rows = await getSql()(text, values);
      return rows[0] || null;
    } catch (err) {
      console.error('DB GET Error:', err.message);
      console.error('Query:', query);
      throw err;
    }
  },

  /**
   * Get all rows (like SQLite db.all)
   */
  async all(query, params = []) {
    try {
      const { text, values } = convertQuery(query, params);
      const rows = await getSql()(text, values);
      return rows || [];
    } catch (err) {
      console.error('DB ALL Error:', err.message);
      console.error('Query:', query);
      throw err;
    }
  },

  /**
   * Run INSERT/UPDATE/DELETE (like SQLite db.run)
   * Automatically adds RETURNING * for INSERT/UPDATE/DELETE
   * Returns { changes, lastID, rows }
   */
  async run(query, params = []) {
    try {
      const { text, values } = convertQuery(query, params);
      let finalText = text.trim();

      // Auto-add RETURNING clause if not present
      const isWrite = /^\s*(INSERT|UPDATE|DELETE)/i.test(finalText);
      const hasReturning = /RETURNING/i.test(finalText);

      if (isWrite && !hasReturning) {
        // Remove trailing semicolon before adding RETURNING
        finalText = finalText.replace(/;\s*$/, '');
        finalText += ' RETURNING *';
      }

      const rows = await getSql()(finalText, values);

      return {
        changes: rows ? rows.length : 0,
        lastID: rows && rows[0] ? (rows[0].id || 0) : 0,
        rows: rows || []
      };
    } catch (err) {
      console.error('DB RUN Error:', err.message);
      console.error('Query:', query);
      throw err;
    }
  },

  /**
   * Execute raw SQL (for migrations, multi-statement)
   */
  async exec(query) {
    try {
      const result = await getSql()(query);
      return result;
    } catch (err) {
      console.error('DB EXEC Error:', err.message);
      throw err;
    }
  }
};

module.exports = db;