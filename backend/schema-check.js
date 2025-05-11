const { pool } = require('./db/db');
const fs = require('fs');
const path = require('path');

async function checkSchema() {
  try {
    // Get the expected schema from schema.sql
    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Extract table names from schema.sql
    const expectedTables = [];
    const tableRegex = /CREATE\s+TABLE\s+(\w+)\s*\(/gi;
    let match;
    while ((match = tableRegex.exec(schemaContent)) !== null) {
      expectedTables.push(match[1].toLowerCase());
    }
    
    console.log('Expected tables from schema.sql:', expectedTables);
    
    // Get actual tables from database
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    const actualTables = tablesResult.rows.map(row => row.table_name.toLowerCase());
    console.log('Actual tables in database:', actualTables);
    
    // Compare expected vs actual tables
    const missingTables = expectedTables.filter(table => !actualTables.includes(table));
    const extraTables = actualTables.filter(table => !expectedTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('\nMissing tables (in schema.sql but not in database):', missingTables);
    } else {
      console.log('\nNo missing tables.');
    }
    
    if (extraTables.length > 0) {
      console.log('Extra tables (in database but not in schema.sql):', extraTables);
    } else {
      console.log('No extra tables.');
    }
    
    // For each table that exists in both, check columns
    console.log('\nChecking table columns...');
    for (const tableName of actualTables) {
      if (expectedTables.includes(tableName)) {
        // Get actual columns
        const columnsResult = await pool.query(`
          SELECT column_name, data_type, character_maximum_length, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position;
        `, [tableName]);
        
        console.log(`\nTable: ${tableName}`);
        console.log('Columns:');
        columnsResult.rows.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const type = col.character_maximum_length 
            ? `${col.data_type}(${col.character_maximum_length})` 
            : col.data_type;
          console.log(`- ${col.column_name} ${type} ${nullable}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Schema check failed:', error);
  } finally {
    await pool.end();
  }
}

checkSchema(); 