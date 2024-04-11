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
    // If it's already a Date object, we assume it's valid
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
        return { isValid: true, date: dateInput };
    }
  
    // If it's a string, validate it's in the "YYYY-MM-DD" format
    if (typeof dateInput === 'string' && moment(dateInput, "YYYY-MM-DD", true).isValid()) {
        // Convert to a Date object for consistent handling later
        // Note: This creates a Date at 00:00:00 in local time zone
        return { isValid: true, date: moment(dateInput, "YYYY-MM-DD").toDate() };
    }

    // If none of the above, return as invalid
    return { isValid: false, date: null };
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
    const { employeeRowguid } = req.params;

    // Validate and parse start and deadline dates
    const { isValid: isValidStart, date: startDate } = validateAndParseDate(start);
    const { isValid: isValidDeadline, date: deadlineDate } = validateAndParseDate(deadline);

    if (!isValidStart || !isValidDeadline) {
        return res.status(400).json({ error: 'Invalid date format. Please use "DD-MM-YYYY" or a valid Date object.' });
    }

    try {
        // Assuming addTaskForEmployee now expects Date objects or null for start and deadline
        const newTask = await addTaskForEmployee(employeeRowguid, title, description, startDate, deadlineDate, type);
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

    // Validate and parse start and deadline dates using the same validateAndParseDate function
    const { isValid: isValidStart, date: startDate } = validateAndParseDate(start);
    const { isValid: isValidDeadline, date: deadlineDate } = validateAndParseDate(deadline);

    if (!isValidStart || !isValidDeadline) {
        return res.status(400).json({ error: 'Invalid date format. Please use "DD-MM-YYYY" or a valid Date object.' });
    }

    try {
        // Now passing the parsed dates (startDate and deadlineDate) which are either Date objects or null
        const updatedTask = await updateTaskForEmployee(taskRowguid, title, description, startDate, deadlineDate, type);
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
