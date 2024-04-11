const express = require('express');
const bodyParser = require('body-parser');
const { getTasksByEmployee, addTaskForEmployee, updateTaskForEmployee, deleteTaskForEmployee } = require('./tasks');
const { getAllEmployees, addEmployee, updateEmployee, deleteEmployee, getEmployeeByRowguid } = require('./employees');
const cors = require('cors');
const moment = require('moment'); // Add moment for date validation

const app = express();
const port = process.env.PORT || 3000;
app.use(cors())

app.use(bodyParser.json());


// Enhanced date validation to support both "DD-MM-YYYY" strings and Date objects
const validateAndParseDate = (dateInput) => {
    if (!dateInput) return { isValid: true, date: null }; // Allow null dates
    if (dateInput instanceof Date) return { isValid: true, date: dateInput }; // Directly pass through Date objects
    if (typeof dateInput === 'string' && moment(dateInput, "DD-MM-YYYY", true).isValid()) {
        // Convert valid date strings to Date objects
        return { isValid: true, date: moment(dateInput, "DD-MM-YYYY").toDate() };
    }
    return { isValid: false }; // Invalid format
};

// Route to get all tasks for a specific employee
app.get('/employees/:employeeRowguid/tasks', async (req, res) => {
    const { employeeRowguid } = req.params;
    try {
        const tasks = await getTasksByEmployee(employeeRowguid);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to add a new task for a specific employee
app.post('/employees/:employeeRowguid/tasks', async (req, res) => {
    const { title, description, start, deadline, type } = req.body;
    const { taskRowguid } = req.params;

    // Validate and parse start and deadline dates
    const { isValid: isValidStart, date: startStr } = validateAndParseDate(start);
    const { isValid: isValidDeadline, date: deadlineStr } = validateAndParseDate(deadline);

    if (!isValidStart || !isValidDeadline) {
        return res.status(400).json({ error: 'Invalid date format. Please use "DD-MM-YYYY" or a valid Date object.' });
    }

    try {
        // Assuming addTaskForEmployee now expects Date objects or null for start and deadline
        const newTask = await addTaskForEmployee(taskRowguid, title, description, startStr, deadlineStr, type);
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Failed to add new task:', error);
        res.status(500).json({ error: 'Failed to add new task' });
    }
});


// Route to update a task
app.put('/tasks/:taskRowguid', async (req, res) => {
    const { taskRowguid } = req.params;
    const { title, description, start, deadline, type } = req.body;

    if (!validateDate(start) || !validateDate(deadline)) {
        return res.status(400).json({ error: 'Invalid date format. Please use "DD-MM-YYYY".' });
    }

    try {
        const updatedTask = await updateTaskForEmployee(taskRowguid, title, description, start, deadline, type);
        if (updatedTask) {
            res.json(updatedTask);
        } else {
            res.status(404).json({ error: 'Task not found' });
        }
    } catch (error) {
        console.error('Failed to update task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});



// Route to delete a task
app.delete('/tasks/:taskRowguid', async (req, res) => {
    const { taskRowguid } = req.params;
    try {
        const task = await deleteTaskForEmployee(taskRowguid);
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/employees', async (req, res) => {
    try {
        const employees = await getAllEmployees();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/employees', async (req, res) => {
    try {
        const employee = await addEmployee(req.body);
        res.status(201).json(employee);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/employees/:rowguid', async (req, res) => {
    const { rowguid } = req.params;
    try {
        const employee = await updateEmployee(rowguid, req.body);
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/employees/:rowguid', async (req, res) => {
    const { rowguid } = req.params;
    try {
        const employee = await deleteEmployee(rowguid);
        res.json({ message: 'Employee deleted successfully', employee });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/employees/:rowguid', async (req, res) => {
    const { rowguid } = req.params;
    try {
        const employee = await getEmployeeByRowguid(rowguid);
        if(employee) {
            res.json(employee);
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
