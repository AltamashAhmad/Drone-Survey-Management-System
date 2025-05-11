const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// PostgreSQL connection details
const config = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432
};

// Path to the SQL script
const sqlScriptPath = path.join(__dirname, 'init-db.sql');

// Function to execute psql command
const executePsql = (args) => {
  return new Promise((resolve, reject) => {
    const psql = spawn('psql', args);

    psql.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    psql.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    psql.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`psql process exited with code ${code}`));
      }
    });
  });
};

// Main function to set up the database
async function setupDatabase() {
  try {
    // Check if SQL script exists
    if (!fs.existsSync(sqlScriptPath)) {
      throw new Error('SQL script not found');
    }

    // Build psql arguments
    const psqlArgs = [
      '-h', config.host,
      '-p', config.port.toString(),
      '-U', config.user,
      '-f', sqlScriptPath
    ];

    // Execute the SQL script
    console.log('Initializing database...');
    await executePsql(psqlArgs);
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase(); 