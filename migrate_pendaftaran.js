const mysql = require('mysql2/promise');

async function migrate() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_siprabu_ft',
    port: 3306
  });

  try {
    // 1. Add peran_pengaju
    console.log("Adding peran_pengaju column...");
    await pool.query(`ALTER TABLE pendaftaran_akun ADD COLUMN peran_pengaju ENUM('Mahasiswa', 'PJ_Ruangan') DEFAULT 'Mahasiswa'`);
    console.log("Success adding peran_pengaju");
  } catch (e) {
    console.log("Column peran_pengaju might already exist or error:", e.message);
  }

  try {
    // 2. Change foto_ktm to dokumen_pdf
    console.log("Changing foto_ktm to dokumen_pdf...");
    await pool.query(`ALTER TABLE pendaftaran_akun CHANGE foto_ktm dokumen_pdf LONGTEXT`);
    console.log("Success changing foto_ktm to dokumen_pdf");
  } catch (e) {
    console.log("Column might already be changed or error:", e.message);
  }

  console.log("Migration finished.");
  process.exit(0);
}

migrate();
