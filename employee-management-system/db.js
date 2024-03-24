const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres', // your PostgreSQL username
    host: 'localhost',
    database: 'employee_management_system', // your database name
    password: 'your_password', // your PostgreSQL password
    port: 5432, // default PostgreSQL port
});

module.exports = pool;
