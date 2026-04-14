import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const {
  DB_HOST = 'localhost',
  DB_USER = 'root',
  DB_PASSWORD,
  DB_PASS,
  DB_NAME = 'staynest',
  DB_PORT = 3306,
} = process.env;

const databasePassword = DB_PASSWORD || DB_PASS;

if (!DB_HOST || !DB_USER || !databasePassword || !DB_NAME) {
  throw new Error(
    'Missing database environment variables. Please set DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME.'
  );
}

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: databasePassword,
  database: DB_NAME,
  port: Number(DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  connectTimeout: 10000,   // ⬅️ 10 sec max

  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

pool.on('connection', (connection) => {
  console.log(`MySQL connected: ${connection.threadId}`);
});

pool.on('error', (error) => {
  console.error('MySQL pool error:', error.message);
});

export const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Database query failed:', error.message);
    throw error;
  }
};

export const testDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database pool connected successfully');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
};

export default pool;
