const mysql = require('mysql2/promise');

async function testLocalDB() {
  try {
    const conn = await mysql.createConnection({host:'localhost', user:'root', database:'db_siprabu_ft'});
    const [rows] = await conn.query("SHOW TABLES LIKE 'pendaftaran_akun'");
    if (rows.length > 0) {
      console.log('Tabel pendaftaran_akun ADA di database LOCAL.');
    } else {
      console.log('Tabel pendaftaran_akun TIDAK ADA di database LOCAL!');
    }
    await conn.end();
  } catch (err) {
    console.error('Error LOCAL DB:', err.message);
  }
}

testLocalDB();
