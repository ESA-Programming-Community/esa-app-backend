import mysql from 'mysql2';
import dotenv from 'dotenv';

// enabling dotenv config
dotenv.config();

/**
 * creating connection pool
 * @type {Pool}
 *
 * @author Aaron Will Djaba
 */
const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
}).promise()

export default pool;