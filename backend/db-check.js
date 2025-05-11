const { pool } = require('./db/db');

async function checkDatabase() {
  try {
    // Check database connection
    const connectionResult = await pool.query('SELECT NOW()');
    console.log('Database connection successful:', connectionResult.rows[0].now);
    
    // List all tables in the database
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\nDatabase tables:');
    if (tablesResult.rows.length === 0) {
      console.log('No tables found in the database');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
    
    // Count records in each table
    console.log('\nTable record counts:');
    for (const row of tablesResult.rows) {
      const tableName = row.table_name;
      const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
      console.log(`- ${tableName}: ${countResult.rows[0].count} records`);
    }
    
  } catch (error) {
    console.error('Database check failed:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

checkDatabase(); 