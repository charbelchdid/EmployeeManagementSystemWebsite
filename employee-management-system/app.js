const express = require('express');
const bodyParser = require('body-parser');
const { getAllTasks, addTask, updateTask, deleteTask } = require('./tasks');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Route to get all tasks
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await getAllTasks();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to add a new task
app.post('/tasks', async (req, res) => {
    const { title, description, status } = req.body;
    try {
        const task = await addTask(title, description, status);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to update a task
app.put('/tasks/:id', async (req, res) => {
    const id = req.params.id;
    const { title, description, status } = req.body;
    try {
        const task = await updateTask(id, title, description, status);
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to delete a task
app.delete('/tasks/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const task = await deleteTask(id);
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
