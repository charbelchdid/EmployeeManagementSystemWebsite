const client = require('./db');
const moment = require('moment'); // We'll use moment.js for date parsing and formatting

// Helper function to parse date from "DD-MM-YYYY" to Date object
function parseDate(dateStr) {
    return dateStr ? moment(dateStr, "DD-MM-YYYY").toDate() : null;
}

// Helper function to format date from Date object to "DD MMMM YYYY"
function formatDate(date) {
    return moment(date).format("DD MMMM YYYY");
}

async function getTasksByEmployee(employeeRowguid) {
    try {
        const result = await client.query('SELECT * FROM tasks WHERE employee_rowguid = $1', [employeeRowguid]);
        // Format dates in the result set
        const formattedRows = result.rows.map(task => ({
            ...task,
            start: formatDate(task.start),
            deadline: task.deadline ? formatDate(task.deadline) : null // Check if deadline exists before formatting
        }));
        return formattedRows;
    } catch (error) {
        console.error('Error fetching tasks for employee:', error);
        throw error;
    }
}

async function addTaskForEmployee(employeeRowguid, title, description, startStr, deadlineStr, type) {
    let start = parseDate(startStr) || new Date(); // Use current date/time if start is not provided
    let deadline = parseDate(deadlineStr);

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

async function updateTaskForEmployee(taskRowguid, title, description, startStr, deadlineStr, type) {
    let start = startStr ? parseDate(startStr) : null;
    let deadline = parseDate(deadlineStr);

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

