const { Pool } = require('pg');


const pool = new Pool({
    user: 'project430_user',
    host: 'dpg-co0at2fsc6pc738qqtng-a.oregon-postgres.render.com',
    database: 'project430',
    password: 'cU4b1JtlsSIxSCPn4XlwLWHNOFRvsS6V',
    port: 5432,
});
module.exports = pool;
