require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
  });

  try {
    const [rows] = await pool.query('DESCRIBE laporan_kerusakans');
    console.log(rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

main();
