const client = require('./db'); // Import the database connection
// Assuming you're adding this to a new file, employees.js
async function getAllProjects() {
    try {
        const result = await client.query('SELECT * FROM projects');
        return result.rows;
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
    }
}
async function addProject(project) {
    const { name, deadline } = project;
    try {
      const result = await client.query('INSERT INTO projects (name, deadline) VALUES ($1, TO_DATE($2, \'YYYY-MM-DD\')) RETURNING *', [name, deadline]);
      return result.rows[0];
    } catch (error) {
        console.error('Error adding new project:', error);
        throw error;
    }
}

async function updateProject(rowguid, updatedProject) {
    const { name, deadline } = updatedProject;
    try {
      const result = await client.query('UPDATE projects SET name = $1, deadline = TO_DATE($2, \'DD-MM-YYYY\') WHERE rowguid = $3 RETURNING *', [name, deadline, rowguid]);
      return result.rows[0];
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
}

async function deleteProject(rowguid) {
    try {
        await client.query('DELETE FROM tasks WHERE project_rowguid = $1',[rowguid]);
        const result = await client.query('DELETE FROM projects WHERE rowguid = $1 RETURNING *', [rowguid]);
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting project:', error);
        throw error;
    }
}


module.exports = { getAllProjects, addProject, updateProject, deleteProject};
