const pool = require('./db'); // Import the connection pool

// Get all tasks
async function getAllTasks() {
    try {
        const result = await pool.query('SELECT * FROM tasks');
        return result.rows;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
    }
}

// Add a new task
async function addTask(title, description, status) {
    try {
        const result = await pool.query('INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *', [title, description, status]);
        return result.rows[0];
    } catch (error) {
        console.error('Error adding task:', error);
        throw error;
    }
}

// Update a task
async function updateTask(id, title, description, status) {
    try {
        const result = await pool.query('UPDATE tasks SET title = $2, description = $3, status = $4 WHERE id = $1 RETURNING *', [id, title, description, status]);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    }
}

// Delete a task
async function deleteTask(id) {
    try {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting task:', error);
        throw error;
    }
}

module.exports = { getAllTasks, addTask, updateTask, deleteTask };
