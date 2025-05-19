#!/bin/bash

# Ensure script is executable with: chmod +x run-innovate.sh

# Display startup message
echo "Starting Innovate application..."

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js to run this application."
    exit 1
fi

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the application
echo "Launching server..."
node server.js
