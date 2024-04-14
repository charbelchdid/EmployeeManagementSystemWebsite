const client = require('./db');
const moment = require('moment'); // We'll use moment.js for date parsing and formatting

// Adjusted parseDate to handle both string and Date inputs
function parseDate(dateInput) {
    if (!dateInput) return null; // If no input, return null
    if (dateInput instanceof Date) return dateInput; // If already a Date, return as is
    // If a string, attempt to parse it
    const parsedDate = moment(dateInput, "DD-MM-YYYY", true);
    return parsedDate.isValid() ? parsedDate.toDate() : null;
}

// Adjusted formatDate to ensure it doesn't fail on null values
function formatDate(date) {
    return date ? moment(date).format("DD-MM-YYYY") : null;
}

async function getTasksByEmployee(employeeRowguid) {
    try {
        const query = `
            SELECT 
                t.rowguid AS task_rowguid,
                t.title,
                t.description,
                t.start,
                t.deadline,
                t.type,
                json_agg(json_build_object('employeeRowguid', e.rowguid, 'name', e.employee_name, 'percentage', ta.percentage)) AS assignments
            FROM 
                tasks t
            INNER JOIN 
                task_assignments ta ON t.rowguid = ta.task_rowguid
            INNER JOIN 
                employee e ON ta.employee_rowguid = e.rowguid
            WHERE 
                t.employee_rowguid = $1
            GROUP BY 
                t.rowguid
        `;
        
        const result = await client.query(query, [employeeRowguid]);
        // Format the task start and deadline dates, if necessary, before returning
        const tasks = result.rows.map(task => ({
            ...task,
            start: formatDate(task.start), // Assuming you have a formatDate function defined as before
            deadline: formatDate(task.deadline)
        }));

        return tasks;
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
        console.error('Error  deleting task for employee:', error);
        throw error;
    }
}

async function getProjectTask() {
    try {
        const result = await pool.query('SELECT * FROM tasks WHERE project_rowguid = $1', [rowguid]);
        const tasks = result.rows.map(task => ({
            ...task,
            start: formatDate(task.start), // Assuming you have a formatDate function defined as before
            deadline: formatDate(task.deadline)
        }));
        return tasks;
    } catch (error) {
        console.error('Error fetching tasls for project:', error);
        throw error;     }
}

module.exports = { getTasksByEmployee, addTaskForEmployee, updateTaskForEmployee, deleteTaskForEmployee,getProjectTask };

