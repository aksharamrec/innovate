#!/bin/bash

# Stop the server (this will break any active connections)
echo "Stopping all Node.js processes..."
pkill -f node

# Create a temporary emergency HTML file
cat > public/emergency.html << 'EOL'
<!DOCTYPE html>
<html>
<head>
  <title>Loop Recovery</title>
  <style>
    body { font-family: Arial; text-align: center; margin: 40px; }
    button { background: #4CAF50; color: white; border: none; padding: 10px 20px; font-size: 16px; cursor: pointer; margin: 10px; }
  </style>
</head>
<body>
  <h1>Loop Recovery</h1>
  <p>This page will help recover from a redirect loop.</p>
  <button onclick="localStorage.clear(); sessionStorage.clear(); alert('Storage cleared!');">Clear All Storage</button>
  <a href="home.html" style="display:inline-block; background:#4338ca; color:white; padding:10px 20px; text-decoration:none; border-radius:4px;">Go to Home</a>
</body>
</html>
EOL

echo "Created emergency.html"

# Start the server again
echo "Restarting server..."
npm start
