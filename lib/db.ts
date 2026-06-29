import mysql from 'mysql2/promise';

const globalForMysql = globalThis as unknown as {
  mysqlPool: mysql.Pool | undefined;
};

// Create the connection pool. Uses environment variables for hosted/Vercel environments.
// Untuk TiDB Serverless (Free Tier), kita batasi connectionLimit agar tidak cepat "Too Many Connections".
const pool = globalForMysql.mysqlPool ?? mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_siprabu_ft',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  waitForConnections: true,
  connectionLimit: 3, // Diturunkan dari 10 ke 3 agar aman untuk Serverless TiDB Free Tier
  maxIdle: 3, 
  idleTimeout: 30000, // 30 detik (agar koneksi mati yang tidak dipakai segera diputus)
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Cache pool di global object saat development/serverless hot reload
if (process.env.NODE_ENV !== 'production') {
  globalForMysql.mysqlPool = pool;
}

export default pool;
