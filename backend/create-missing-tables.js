const { pool } = require('./db/db');
const fs = require('fs');
const path = require('path');

async function createMissingTables() {
  try {
    console.log('Creating missing tables...');
    
    // Read schema.sql to extract table creation statements
    const schemaPath = path.join(__dirname, 'db', 'schema.sql');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Extract CREATE TABLE statements for the missing tables
    const tableRegex = /CREATE\s+TABLE\s+(\w+)\s*\(([\s\S]*?)(?=\);)\);/g;
    let match;
    const tables = [];
    
    while ((match = tableRegex.exec(schemaContent)) !== null) {
      const tableName = match[1].toLowerCase();
      const tableDefinition = match[0];
      tables.push({ name: tableName, definition: tableDefinition });
    }
    
    // Get existing tables
    const existingTablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const existingTables = existingTablesResult.rows.map(row => row.table_name.toLowerCase());
    console.log('Existing tables:', existingTables);
    
    // Find missing tables
    const missingTables = tables.filter(table => !existingTables.includes(table.name));
    console.log('Missing tables:', missingTables.map(t => t.name));
    
    // Create missing tables
    for (const table of missingTables) {
      console.log(`Creating table: ${table.name}`);
      try {
        await pool.query(table.definition);
        console.log(`Table ${table.name} created successfully`);
      } catch (err) {
        console.error(`Error creating table ${table.name}:`, err.message);
      }
    }
    
    console.log('Table creation process completed');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

createMissingTables(); 