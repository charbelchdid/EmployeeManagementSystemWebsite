const express = require('express');
const bodyParser = require('body-parser');
const { getTasksByEmployee, addTask, updateTaskForEmployee, deleteTaskForEmployee, getProjectTask, addAssignment, deleteAssignment } = require('./tasks');
const { getAllEmployees, addEmployee, updateEmployee, deleteEmployee, getEmployeeByRowguid, getEmployeeRowguid } = require('./employees');
const { getAllProjects, addProject, updateProject, deleteProject}= require('./projects');
const cors = require('cors');
const moment = require('moment'); // Add moment for date validation
const router= require('./managerEvents');
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
app.post('/tasks/:projectrowguid', async (req, res) => {
    const { title, description, start, deadline, type } = req.body;
    const { projectrowguid } = req.params;
    // Validate and parse start and deadline dates
    const { isValid: isValidStart, date: startDate } = validateAndParseDate(start);
    const { isValid: isValidDeadline, date: deadlineDate } = validateAndParseDate(deadline);

    if (!isValidStart || !isValidDeadline) {
        return res.status(400).json({ error: 'Invalid date format. Please use "DD-MM-YYYY" or a valid Date object.' });
    }

    try {
        // Assuming addTaskForEmployee now expects Date objects or null for start and deadline
        const newTask = await addTask(projectrowguid, title, description, startDate, deadlineDate, type);
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

app.post('/getEmployeeRowguid', async (req, res) => {
    try {
        const { email } = req.body;
        const employee = await getEmployeeRowguid(email);
        if(employee) {
            res.json(employee.rowguid);
        } else {
            res.status(404).json({ message: 'Employee not found' });
        }
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
        const projects = await getAllProjects();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
  
  app.post('/projects', async (req, res) => {
    try {
        const project = await addProject(req.body);
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.put('/projects/:rowguid', async (req, res) => {
    const { rowguid } = req.params;
    try {
        const project = await updateProject(rowguid, req.body);
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.delete('/projects/:rowguid', async (req, res) => {
    const { rowguid } = req.params;
    try {
        const project = await deleteProject(rowguid);
        res.json({ message: 'Project deleted successfully', project });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/tasks/:rowguid', async (req, res) => {
    const { rowguid } = req.params;
    try {
        const task = await getProjectTask(rowguid);
        if(task) {
            res.json(task);
        } else {
            res.status(404).json({ message: 'Task not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/assignments', async (req, res) => {
    try {
        const project = await addAssignment(req.body);
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
  });
  app.delete('/assignments', async (req, res) => {
    try {
        const project = await deleteAssignment(req.body);
        res.json({ message: 'Project deleted successfully', project });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  app.use('/managerevents', router);
  


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
