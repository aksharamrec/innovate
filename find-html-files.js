const fs = require('fs');
const path = require('path');

// Function to recursively search for files
function findFiles(dir, extension, excludeDirs = []) {
  let results = [];
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    
    // Skip excluded directories
    if (fs.statSync(itemPath).isDirectory()) {
      if (!excludeDirs.includes(item)) {
        results = results.concat(findFiles(itemPath, extension, excludeDirs));
      }
      continue;
    }
    
    // Check file extension
    if (path.extname(item) === extension) {
      results.push(itemPath);
    }
  }
  
  return results;
}

// Find all HTML files in the project, excluding node_modules
const htmlFiles = findFiles('/workspaces/innovate', '.html', ['node_modules']);

// Group files by name
const filesByName = {};
htmlFiles.forEach(file => {
  const filename = path.basename(file);
  if (!filesByName[filename]) {
    filesByName[filename] = [];
  }
  filesByName[filename].push(file);
});

// Print all HTML files found
console.log('All HTML files found:');
htmlFiles.forEach(file => {
  console.log(`- ${file}`);
});

// Print files with duplicates
console.log('\nFiles with multiple copies:');
for (const [filename, files] of Object.entries(filesByName)) {
  if (files.length > 1) {
    console.log(`\n${filename} found in ${files.length} locations:`);
    files.forEach(file => {
      console.log(`  - ${file}`);
    });
  }
}

console.log('\nRecommendation: Keep only the files in the /public directory and remove duplicates from other locations.');
