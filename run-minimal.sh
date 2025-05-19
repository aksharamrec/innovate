#!/bin/bash

echo "===================================="
echo "  MINIMAL SERVER EMERGENCY START    "
echo "===================================="

# Stop any running Node processes
echo "Stopping current server..."
pkill -f node || true

# Wait a moment
sleep 2

# Start minimal server
echo "Starting minimal emergency server..."
node minimal-server.js
