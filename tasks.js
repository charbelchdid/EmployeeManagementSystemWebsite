
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
// Updated addTaskForEmployee function to include deadline and type
async function addTaskForEmployee(employeeRowguid, title, description, start, deadline, type) {
        // If start is not provided, use the current date/time
        if (!start) {
            start = new Date();
        }
        try {
            const result = await client.query(
                'INSERT INTO tasks (title, description, start, deadline, type, employee_rowguid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', 
                [title, description, start, deadline, type, employeeRowguid]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error adding task for employee:', error);
            throw error;
        }

}

// Assuming an updateTaskForEmployee function exists and needs updating
async function updateTaskForEmployee(taskRowguid, title, description, start, deadline, type) {
        // Handle start and deadline update with appropriate data types
        try {
            const result = await client.query(
                'UPDATE tasks SET title = $1, description = $2, start = COALESCE($3, start), deadline = $4, type = $5 WHERE rowguid = $6 RETURNING *', 
                [title, description, start, deadline, type, taskRowguid]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error updating task:', error);
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

