const db = require('./db.js');

db.query("DESCRIBE users", (err, results) => {
  if (err) {
    console.error(err);
  } else {
    console.log(JSON.stringify(results, null, 2));
  }
  process.exit();
});
