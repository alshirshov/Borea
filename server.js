const express = require('express');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Connect to the SQLite database located in the 'public' folder
const dbPath = path.join(__dirname, 'public', 'color_presets.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Serve the index.html file from the root directory
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Add the SVG listing endpoint
app.get('/api/get-svg-list', (req, res) => {
  const svgDirectory = path.join(__dirname, 'svg');
  fs.readdir(svgDirectory, (err, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading SVG directory');
      return;
    }
    const svgFiles = files.filter(file => file.endsWith('.svg'));
    console.log(svgFiles); // Log the list of SVG files
    res.json(svgFiles);
  });
});

// Serve individual SVG files from the 'svg' directory
app.get('/api/get-svg/:filename', (req, res) => {
  let { filename } = req.params;
  // Ensure the filename ends with '.svg'
  if (!filename.endsWith('.svg')) {
    filename += '.svg';
  }
  // Construct the full file path
  const filePath = path.join(__dirname, 'svg', filename);

  // Check if the file exists and serve it, otherwise return 404
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error(err);
      res.status(404).send('SVG file not found');
      return;
    }
    res.sendFile(filePath);
  });
});

// Endpoint to fetch color presets from the SQLite database
app.get('/api/get-color-presets', (req, res) => {
  const query = 'SELECT * FROM color_presets';
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Error fetching presets:', err.message);
      res.status(500).send('Error fetching presets');
    } else {
      res.json(rows); // Send the presets as a JSON response
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log('Server is running at http://localhost:' + port);
});