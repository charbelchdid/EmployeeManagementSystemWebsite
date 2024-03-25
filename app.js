const express = require('express');
const bodyParser = require('body-parser');
const { getTasksByEmployee, addTaskForEmployee, updateTaskForEmployee, deleteTaskForEmployee } = require('./tasks');
const { getAllEmployees } = require('./employees');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

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
    const { employeeRowguid } = req.params;
    const { title, description, status } = req.body;
    try {
        const task = await addTaskForEmployee(employeeRowguid, title, description, status);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to update a task
app.put('/tasks/:taskRowguid', async (req, res) => {
    const { taskRowguid } = req.params;
    const { title, description, status } = req.body;
    try {
        const task = await updateTaskForEmployee(taskRowguid, title, description, status);
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
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


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
