require('dotenv').config({path: '.env.local'});
const mysql = require('mysql2/promise');

async function migrate() {
  const pool = mysql.createPool({
    host: process.env.TIDB_HOST,
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: 'test',
    port: 4000,
    ssl: {
      minVersion: 'TLSv1.2'
    }
  });

  try {
    console.log("Updating peran_pengaju ENUM in pendaftaran_akun...");
    await pool.query("ALTER TABLE pendaftaran_akun MODIFY COLUMN peran_pengaju ENUM('Mahasiswa', 'PJ_Ruangan', 'Laboran', 'Sarpras') DEFAULT 'Mahasiswa'");
    console.log("Success updating peran_pengaju ENUM");
  } catch (e) {
    console.log("Error updating peran_pengaju ENUM:", e.message);
  }

  console.log("Migration finished.");
  process.exit(0);
}

migrate();
