// Assuming you're adding this to a new file, employees.js
const client = require('./db'); // Import the database connection

async function getAllEmployees() {
    try {
        const result = await client.query('SELECT * FROM employee');
        return result.rows;
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw error;
    }
}

module.exports = { getAllEmployees };
