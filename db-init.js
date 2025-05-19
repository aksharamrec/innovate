const sqlite3 = require('sqlite3').verbose();

// Open the database connection
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
    process.exit(1);
  }
  
  console.log('Connected to the SQLite database.');
  
  // Get a sample user to attach posts to
  db.get('SELECT id FROM users LIMIT 1', [], (err, user) => {
    if (err) {
      console.error('Error finding users:', err);
      closeDbAndExit();
      return;
    }
    
    if (!user) {
      console.log('No users found. Please register a user first.');
      closeDbAndExit();
      return;
    }
    
    // Sample posts
    const samplePosts = [
      { 
        content: "Just started a new project exploring sustainable energy solutions. Looking for collaborators with experience in solar panel efficiency optimization."
      },
      { 
        content: "Excited to share my latest research on AI-driven agriculture techniques. The results show a 30% increase in crop yield with 20% less water usage."
      },
      { 
        content: "Anyone interested in discussing blockchain applications for supply chain management? I've been developing a prototype that could revolutionize product tracking."
      }
    ];
    
    // Insert sample posts
    const stmt = db.prepare('INSERT INTO posts (user_id, content, interested_users) VALUES (?, ?, ?)');
    
    let inserted = 0;
    samplePosts.forEach(post => {
      stmt.run(user.id, post.content, '[]', function(err) {
        if (err) {
          console.error('Error inserting sample post:', err);
        } else {
          inserted++;
          console.log(`Inserted post #${this.lastID}`);
        }
        
        if (inserted === samplePosts.length) {
          console.log('All sample posts added successfully');
          closeDbAndExit();
        }
      });
    });
    
    stmt.finalize();
  });
});

function closeDbAndExit() {
  db.close((err) => {
    if (err) {
      console.error('Error closing database', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
}
