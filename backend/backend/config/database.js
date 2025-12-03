const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bobfly',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Veritabanı bağlantısı başarılı');
        connection.release();
    } catch (error) {
        console.error('Veritabanı bağlantı hatası:', error.message);
    }
}

testConnection();

module.exports = pool;



