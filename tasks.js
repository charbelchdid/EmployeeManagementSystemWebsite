const client = require('./db');

// Get all tasks for a specific employee
async function getTasksByEmployee(employeeRowguid) {
    try {
        const result = await client.query('SELECT * FROM tasks WHERE employee_rowguid = $1', [employeeRowguid]);
        return result.rows;
    } catch (error) {
        console.error('Error fetching tasks for employee:', error);
        throw error;
    }
}

// Add a new task for a specific employee
async function addTaskForEmployee(employeeRowguid, title, description, status) {
    try {
        const result = await client.query(
            'INSERT INTO tasks (employee_rowguid, title, description, status, rowguid) VALUES ($1, $2, $3, $4, uuid_generate_v4()) RETURNING *', 
            [employeeRowguid, title, description, status]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error adding task for employee:', error);
        throw error;
    }
}

// Update a task for a specific employee
async function updateTaskForEmployee(taskRowguid, title, description, status) {
    try {
        const result = await client.query(
            'UPDATE tasks SET title = $2, description = $3, status = $4 WHERE rowguid = $1 RETURNING *', 
            [taskRowguid, title, description, status]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error updating task for employee:', error);
        throw error;
    }
}

// Delete a task for a specific employee
async function deleteTaskForEmployee(taskRowguid) {
    try {
        const result = await client.query('DELETE FROM tasks WHERE rowguid = $1 RETURNING *', [taskRowguid]);
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting task for employee:', error);
        throw error;
    }
}

module.exports = { getTasksByEmployee, addTaskForEmployee, updateTaskForEmployee, deleteTaskForEmployee };
