// This is an extremely minimal server that only serves home.html for all routes

const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

console.log('Starting minimal emergency server');

// Prepare a pre-authenticated home.html file
const homeFilePath = path.join(__dirname, 'public', 'home.html');
const loginFilePath = path.join(__dirname, 'public', 'login.html');

// Serve CSS and JS files
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));

// Serve ONLY home.html for ALL routes that would lead to HTML pages
app.get('*.html', (req, res) => {
  console.log('HTML requested:', req.path);
  console.log('SERVING HOME.HTML INSTEAD');
  res.sendFile(homeFilePath);
});

// Root path also goes to home.html
app.get('/', (req, res) => {
  console.log('Root path requested - serving home.html');
  res.sendFile(homeFilePath);
});

// General static file handling for other assets
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(PORT, () => {
  console.log('=======================================');
  console.log('  MINIMAL EMERGENCY SERVER RUNNING     ');
  console.log('=======================================');
  console.log(`Server running on port ${PORT}`);
  console.log('ALL routes now serve home.html');
  console.log(`Go to: http://localhost:${PORT}/`);
});
