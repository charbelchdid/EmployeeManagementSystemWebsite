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
async function addEmployee(employee) {
    const { name, email, department, age, gender } = employee;
    try {
        const result = await client.query(
            'INSERT INTO employee (employee_name, email, department, age, gender) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, email, department, age, gender]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error adding new employee:', error);
        throw error;
    }
}

async function updateEmployee(rowguid, updatedEmployee) {
    const { name, email, department, age, gender } = updatedEmployee;
    try {
        const result = await client.query(
            'UPDATE employee SET employee_name = $1, email = $2, department = $3, age = $4, gender = $5 WHERE rowguid = $6 RETURNING *',
            [name, email, department, age, gender, rowguid]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error updating employee:', error);
        throw error;
    }
}

async function deleteEmployee(rowguid) {
    try {
        await client.query('DELETE FROM task_assignments WHERE employee_rowguid = $1',[rowguid]);
        const result = await client.query('DELETE FROM employee WHERE rowguid = $1 RETURNING *', [rowguid]);
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting employee:', error);
        throw error;
    }
}
async function getEmployeeByRowguid(rowguid) {
    try {
        const result = await client.query('SELECT * FROM employee WHERE rowguid = $1', [rowguid]);
        return result.rows[0]; // Assuming rowguid is unique, this returns the specific employee
    } catch (error) {
        console.error('Error fetching employee by rowguid:', error);
        throw error;
    }
}
async function getEmployeeRowguid(email) {
    try {
        // Query to fetch rowguid based on email
        const query = `
          SELECT rowguid
          FROM employee
          WHERE email = $1
        `;
    
        const result = await client.query(query, [email]);
        return result.rows[0];
      } catch (error) {
        console.error('Error executing query', error);
        throw error;
      }
}

module.exports = { getAllEmployees, addEmployee, updateEmployee, deleteEmployee, getEmployeeByRowguid,getEmployeeRowguid };
