#!/bin/bash

echo "========================================"
echo "  EMERGENCY REDIRECT LOOP FIX"
echo "========================================"

# Kill any running node processes
echo "Stopping current server..."
pkill -f node || true

# Wait a moment for processes to terminate
sleep 2

# Start the emergency server
echo "Starting emergency server..."
node emergency-server.js

