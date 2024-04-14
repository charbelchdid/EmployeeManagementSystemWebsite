const express = require('express');
const router = express.Router();
const client = require('./db'); // Import the PostgreSQL client

// Helper function to format date in 'YYYY-MM-DD' format
function formatDate(dateStr) {
  const parts = dateStr.split('-');
  const formattedDate = new Date(parts[2], parts[1] - 1, parts[0]); // Month is 0-based
  return formattedDate.toISOString().split('T')[0]; // Extract YYYY-MM-DD part
}

// Route to get all events
router.get('/', async (req, res) => {
  try {
    const { rows } = await client.query('SELECT * FROM events');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'An error occurred while fetching events.' });
  }
});

// Route to add a new event
router.post('/', async (req, res) => {
  const { title, start, end } = req.body;
  const formattedStart = formatDate(start);
  const formattedEnd = formatDate(end);
  try {
    const { rows } = await client.query('INSERT INTO events (title, start, "end") VALUES ($1, $2, $3) RETURNING *', [title, formattedStart, formattedEnd]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({ error: 'An error occurred while adding the event.' });
  }
});

// Route to modify an existing event
router.put('/:id', async (req, res) => {
  const eventId = req.params.id;
  const { title, start, end } = req.body;
  const formattedStart = formatDate(start);
  const formattedEnd = formatDate(end);
  try {
    const { rowCount } = await client.query('UPDATE events SET title = $1, start = $2, "end" = $3 WHERE id = $4', [title, formattedStart, formattedEnd, eventId]);
    if (rowCount === 0) {
      res.status(404).json({ error: 'Event not found.' });
    } else {
      res.json({ message: 'Event updated successfully.' });
    }
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'An error occurred while updating the event.' });
  }
});

// Route to delete an event
router.delete('/:id', async (req, res) => {
  const eventId = req.params.id;
  try {
    const { rowCount } = await client.query('DELETE FROM events WHERE id = $1', [eventId]);
    if (rowCount === 0) {
      res.status(404).json({ error: 'Event not found.' });
    } else {
      res.json({ message: 'Event deleted successfully.' });
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'An error occurred while deleting the event.' });
  }
});

module.exports = router;
