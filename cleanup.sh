#!/bin/bash

# List of files to delete
files=(
  "/workspaces/innovate/public/html/connection-test.html"
  "/workspaces/innovate/public/html/create-post.html"
  "/workspaces/innovate/public/html/direct-post.html"
  "/workspaces/innovate/public/html/emergency-post.html"
  "/workspaces/innovate/public/html/emergency.html"
  "/workspaces/innovate/public/html/last-resort-post.html"
  "/workspaces/innovate/public/html/modern-home.html"
  "/workspaces/innovate/public/html/plain-post.html"
  "/workspaces/innovate/public/html/post-diagnostics.html"
  "/workspaces/innovate/public/html/posts.html"
  "/workspaces/innovate/public/html/simplified-home.html"
)

# Delete each file
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Deleting $file"
    rm "$file"
  else
    echo "File not found: $file"
  fi
done

echo "Cleanup completed"
