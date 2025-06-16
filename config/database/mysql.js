const { mysql2 } = require('mysql2/promise');

const DB = process.env.DATABASE;
const HOST = process.env.DB_HOST;
const USER = process.env.DB_USER;
const PASSWORD = process.env.DB_PASSWORD;

const mysqlDB = async () => {
    try {
        await mysql2.createConnection({
            host: HOST,
            user: USER,
            password: PASSWORD,
            database: DB
        });
        console.log('Database connected');
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = mysqlDB;