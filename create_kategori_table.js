const fs = require('fs');
const mysql = require('mysql2/promise');

async function run() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const urlMatch = envFile.match(/DATABASE_URL=(.+)/);
  if (!urlMatch) {
    console.error('No DATABASE_URL in .env.local');
    return;
  }
  const url = urlMatch[1].trim().replace(/['"]/g, '');
  const conn = await mysql.createConnection(url);
  await conn.query('CREATE TABLE IF NOT EXISTS kategori_barang (id INT AUTO_INCREMENT PRIMARY KEY, nama_kategori VARCHAR(255) UNIQUE NOT NULL)');
  console.log('Table kategori_barang created');
  await conn.end();
}

run().catch(console.error);
