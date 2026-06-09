const mysql = require('mysql2/promise');
const fs = require('fs');

async function setup() {
  const pool = mysql.createPool({host:'localhost', user:'root', database:'db_siprabu_ft', multipleStatements: true});
  try {
    const sql = fs.readFileSync('setup.sql', 'utf8');
    await pool.query(sql);
    console.log('Database schema successfully updated.');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
setup();
