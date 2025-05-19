const sqlite3 = require('sqlite3').verbose();

// Open the database connection
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    process.exit(1);
  }
  
  console.log('Connected to the SQLite database.');
  
  // Check tables
  db.all(`SELECT name FROM sqlite_master WHERE type='table'`, [], (err, tables) => {
    if (err) {
      console.error('Error querying tables:', err);
      closeDb();
      return;
    }
    
    console.log('Database tables:');
    tables.forEach(table => {
      console.log(`- ${table.name}`);
    });
    
    // Check posts count
    db.get('SELECT COUNT(*) as count FROM posts', [], (err, result) => {
      if (err) {
        console.error('Error counting posts:', err);
        closeDb();
        return;
      }
      
      console.log(`Total posts: ${result.count}`);
      
      // Check users count
      db.get('SELECT COUNT(*) as count FROM users', [], (err, result) => {
        if (err) {
          console.error('Error counting users:', err);
          closeDb();
          return;
        }
        
        console.log(`Total users: ${result.count}`);
        closeDb();
      });
    });
  });
});

function closeDb() {
  db.close((err) => {
    if (err) {
      console.error('Error closing database', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
}
