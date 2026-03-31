// const router = require("express").Router();
// const db = require("../db");

// router.get("/", (req, res) => {
//   db.query("SELECT * FROM technicians", (err, results) => {
//     if (err) throw err;
//     res.json(results);
//   });
// });

// module.exports = router;
const router = require("express").Router();
const db = require("../db");

router.get("/", (req, res) => {
  const query = `
    SELECT *
    FROM technicians
    WHERE id IN (
      SELECT MIN(id)
      FROM technicians
      GROUP BY category
    )
  `;

  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

module.exports = router;
