const mysql = require('mysql2/promise');

async function fixDb() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_siprabu_ft'
  });

  try {
    await connection.query("UPDATE mutasi_barang SET ruangan_asal = '5402' WHERE id_ruangan_tujuan = 'Lab LPPD' AND ruangan_asal IS NULL LIMIT 1");
    console.log("Fixed old mutasi");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await connection.end();
  }
}

fixDb();
