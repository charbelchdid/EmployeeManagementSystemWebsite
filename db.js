const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.PGUSER, // Render sets PGUSER environment variable automatically
    host: process.env.PGHOST || 'localhost',
    database: 'project430',
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT || 5432,
});

module.exports = pool;
