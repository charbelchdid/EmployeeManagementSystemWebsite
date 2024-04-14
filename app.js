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
    if (moment(dateInput, moment.ISO_8601, true).isValid()) {
        // Parse the string to a Date object
        return { isValid: true, date: new Date(dateInput) };
    }
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




app.get('/projects', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM projects');
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
  app.post('/projects', async (req, res) => {
    const { name, deadline } = req.body;
    try {
      const result = await pool.query('INSERT INTO projects (name, deadline) VALUES ($1, TO_DATE($2, \'DD-MM-YYYY\')) RETURNING *', [name, deadline]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
  
  // Update an existing project
  app.put('/projects/:rowguid', async (req, res) => {
    const { rowguid } = req.params;
    const { name, deadline } = req.body;
    try {
      const result = await pool.query('UPDATE projects SET name = $1, deadline = TO_DATE($2, \'DD-MM-YYYY\') WHERE rowguid = $3 RETURNING *', [name, deadline, rowguid]);
      if (result.rows.length === 0) {
        res.status(404).send('Project not found');
      } else {
        res.json(result.rows[0]);
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
  
  // Delete a project
  app.delete('/projects/:rowguid', async (req, res) => {
    const { rowguid } = req.params;
    try {
      const result = await pool.query('DELETE FROM projects WHERE rowguid = $1 RETURNING *', [rowguid]);
      if (result.rows.length === 0) {
        res.status(404).send('Project not found');
      } else {
        res.json(result.rows[0]);
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
  


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
