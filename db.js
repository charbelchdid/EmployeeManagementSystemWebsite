const { Client } = require('pg');

const client = new Client({
    user: 'project430_user',
    host: 'dpg-co0at2fsc6pc738qqtng-a.oregon-postgres.render.com',
    database: 'project430',
    password: 'cU4b1JtlsSIxSCPn4XlwLWHNOFRvsS6V',
    port: 5432,
    ssl: {
        rejectUnauthorized: false // For testing purposes only; use a valid CA certificate in production
    }
});

client.connect()
    .then(() => {
        console.log('Connected to PostgreSQL database');
    })
    .catch(err => {
        console.error('Error connecting to PostgreSQL database:', err);
    });

module.exports = client;
