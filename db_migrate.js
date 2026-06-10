const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS pendaftaran_akun (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      email_sso VARCHAR(255) UNIQUE NOT NULL,
      nim VARCHAR(50) UNIQUE NOT NULL,
      foto_ktm LONGTEXT,
      status_pendaftaran ENUM('Menunggu', 'Disetujui', 'Ditolak') DEFAULT 'Menunggu',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Table pendaftaran_akun created!');
  await conn.end();
}

run().catch(console.error);
