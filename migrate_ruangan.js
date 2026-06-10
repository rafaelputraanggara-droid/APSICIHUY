const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_siprabu_ft'
  });

  try {
    console.log("Checking if ruangan_asal exists...");
    const [columns] = await connection.query("SHOW COLUMNS FROM mutasi_barang LIKE 'ruangan_asal'");
    if (columns.length === 0) {
      console.log("Adding ruangan_asal column...");
      await connection.query("ALTER TABLE mutasi_barang ADD COLUMN ruangan_asal VARCHAR(100)");
      console.log("Column added successfully!");
    } else {
      console.log("Column already exists.");
    }
    
    // Also update setup.sql to match
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await connection.end();
  }
}

migrate();
