const router = require("express").Router();
const db = require("../db");

// ─────────────────────────────────────────
//  GET ALL TECHNICIANS
// ─────────────────────────────────────────
router.get("/", (req, res) => {
  const sql = `
    SELECT
      t.id,
      t.user_id,
      t.name,
      t.phone,
      t.address,
      t.category,
      COALESCE(t.skills, t.category) AS skills,
      t.status,
      COALESCE(t.availability, t.status) AS availability,
      t.experience
    FROM technicians t
    ORDER BY t.id ASC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Technicians fetch error:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(results);
  });
});

// ─────────────────────────────────────────
//  GET TECHNICIAN COUNT (for admin stats)
// ─────────────────────────────────────────
router.get("/count", (req, res) => {
  db.query("SELECT COUNT(*) AS total FROM technicians", (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ total: results[0].total });
  });
});

module.exports = router;
