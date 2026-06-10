const mysql = require('mysql2/promise');

async function run() {
  try {
    const conn = await mysql.createConnection({host:'localhost', user:'root', database:'db_siprabu_ft'});
    console.log('Connected.');
    
    await conn.query('DROP TABLE IF EXISTS mutasis;');
    console.log('Dropped old mutasis.');
    
    await conn.query(`
      CREATE TABLE IF NOT EXISTS mutasi_barang (
          id_mutasi INT AUTO_INCREMENT PRIMARY KEY,
          id_barang INT NOT NULL,
          id_user_pengaju VARCHAR(255) NOT NULL,
          id_ruangan_tujuan VARCHAR(100) NOT NULL,
          tanggal_mutasi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          alasan_mutasi LONGTEXT NOT NULL,
          status_mutasi VARCHAR(30) DEFAULT 'Menunggu',
          tanggal_validasi TIMESTAMP NULL,
          catatan_validasi LONGTEXT NULL,
          FOREIGN KEY (id_barang) REFERENCES barangs(id) ON DELETE CASCADE
      );
    `);
    console.log('Created mutasi_barang table.');
    
    await conn.end();
  } catch (err) {
    console.error('Error migrating mutasi:', err.message);
  }
}

run();
