const mysql = require('mysql2/promise'); 
async function run() { 
  const conn = await mysql.createConnection({host:'localhost', user:'root', database:'db_siprabu_ft'}); 
  await conn.query("ALTER TABLE laporan_kerusakans MODIFY COLUMN status_laporan ENUM('Menunggu', 'Diterima', 'Sedang Diperbaiki', 'Selesai', 'Ditolak') DEFAULT 'Menunggu'"); 
  try { await conn.query("ALTER TABLE laporan_kerusakans ADD COLUMN nama_teknisi VARCHAR(255) DEFAULT NULL"); } catch(e){}
  try { await conn.query("ALTER TABLE laporan_kerusakans ADD COLUMN bukti_penyelesaian_pdf LONGTEXT DEFAULT NULL"); } catch(e){}
  console.log('DB Updated'); 
  await conn.end(); 
} 
run();
