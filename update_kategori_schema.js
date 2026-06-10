const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_siprabu_ft'
  });

  try {
    console.log("Creating kategori_barang table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS kategori_barang (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nama_kategori VARCHAR(255) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Adding nama_kategori to barangs...");
    try {
      await connection.query(`ALTER TABLE barangs ADD COLUMN nama_kategori VARCHAR(255) NULL`);
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') throw e;
      console.log("Column nama_kategori already exists.");
    }

    console.log("Seeding initial categories...");
    await connection.query(`INSERT IGNORE INTO kategori_barang (nama_kategori) VALUES ('PC Desktop'), ('Laptop'), ('AC / Pendingin Ruangan'), ('Proyektor'), ('Meja Kerja'), ('Kursi Kerja')`);

    console.log("Migration successful.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    connection.end();
  }
}

migrate();
