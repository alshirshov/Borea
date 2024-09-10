const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the 'public' directory (which now includes the 'images' folder)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  // Serve index.html from the 'public' directory
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Add the SVG listing endpoint
app.get('/api/get-svg-list', (req, res) => {
  const svgDirectory = path.join(__dirname, 'svg'); // No change needed here
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

app.listen(port, () => {
  console.log('Example app listening at http://localhost:' + port);
});