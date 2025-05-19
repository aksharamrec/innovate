#!/bin/bash

# Create the sounds directory if it doesn't exist
mkdir -p /workspaces/innovate/public/sounds

# Create a minimal notification sound file
# This is a placeholder - in a production environment, 
# you would use a proper sound file
dd if=/dev/zero of=/workspaces/innovate/public/sounds/notification.mp3 bs=1k count=1

# Make sure the file permissions are correct
chmod 644 /workspaces/innovate/public/sounds/notification.mp3

echo "Sound file created successfully"
