const fs = require('fs');
const mysql = require('mysql2/promise');

async function main() {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  let dbUrl = '';
  envContent.split('\n').forEach(line => {
    if (line.startsWith('DATABASE_URL=')) {
      dbUrl = line.split('=')[1].trim().replace(/['"]/g, '');
    }
  });

  if (!dbUrl) {
    console.error('DATABASE_URL not found');
    process.exit(1);
  }

  const pool = mysql.createPool({
    uri: dbUrl,
  });

  try {
    console.log('Adding catatan_pj to laporan_kerusakans...');
    await pool.query('ALTER TABLE laporan_kerusakans ADD COLUMN catatan_pj TEXT NULL');
    console.log('Added catatan_pj!');
  } catch (err) {
    console.log('Error adding catatan_pj:', err.message);
  }

  try {
    console.log('Adding pelapor_id to laporan_kerusakans...');
    await pool.query('ALTER TABLE laporan_kerusakans ADD COLUMN pelapor_id INT NULL');
    console.log('Added pelapor_id!');
  } catch (err) {
    console.log('Error adding pelapor_id:', err.message);
  }

  process.exit(0);
}

main();
