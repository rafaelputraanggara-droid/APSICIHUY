const mysql = require('mysql2/promise');

async function fix() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_siprabu_ft'
  });

  try {
    console.log("Cleaning up rejected or conflicting accounts...");
    await connection.query("DELETE FROM pendaftaran_akun WHERE status_pendaftaran = 'Ditolak'");
    await connection.query("DELETE FROM pendaftaran_akun WHERE username = 'Rafael Anggara' OR nim = 'I0323084' OR email_sso = 'rafaelputraanggara@student.uns.ac.id'");
    console.log("Cleanup success.");
  } catch (err) {
    console.error(err);
  } finally {
    connection.end();
  }
}

fix();
