const router = require("express").Router();
const db = require("../db");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.get("/", (req, res) => {

  const role = req.query.role;
  const userId = req.query.user_id;

  // let sql = `
  //   SELECT complaints.*, 
  //          technicians.name AS technician_name,
  //          technicians.status AS technician_status
  //   FROM complaints
  //   LEFT JOIN technicians 
  //     ON complaints.technician_id = technicians.id
  // `;
  let sql =`SELECT complaints.*, 
       technicians.name AS technician_name,
       technicians.phone AS technician_phone,
       technicians.address AS technician_address,
       technicians.status AS technician_status,
       users.name AS user_name,
       users.phone AS user_phone,
       users.address AS user_address
FROM complaints
LEFT JOIN technicians 
ON complaints.technician_id = technicians.id
LEFT JOIN users
ON complaints.user_id = users.id`;

  if (role === "user") {
    sql += ` WHERE complaints.user_id = ${userId}`;
  }

  sql += " ORDER BY complaints.id DESC";

  db.query(sql, (err, results) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database Error" });
    }

    res.json(results);
  });
});

router.post("/", upload.single("image"), async (req, res) => {

  try {

    const issue = req.body.issue || null;
    const userId = req.body.user_id;
    const image = req.file ? req.file.filename : null;

    if (!issue && !image) {
      return res.status(400).json({
        message: "Provide issue text or upload image"
      });
    }

    let predictedCategory = "General";
    let textCategory = null;

    // Step 1: Always check text keywords first (if issue text is provided)
    if (issue) {
      const text = issue.toLowerCase();

      if (
        text.includes("pipe") ||
        text.includes("water") ||
        text.includes("leak") ||
        text.includes("tap") ||
        text.includes("plumbing") ||
        text.includes("drain") ||
        text.includes("faucet") ||
        text.includes("toilet") ||
        text.includes("shower")
      ) {
        textCategory = "Plumbing";
      }

      else if (
        text.includes("light") ||
        text.includes("wire") ||
        text.includes("electric") ||
        text.includes("switch") ||
        text.includes("power") ||
        text.includes("socket") ||
        text.includes("circuit") ||
        text.includes("fan")
      ) {
        textCategory = "Electrical";
      }

      else if (
        text.includes("door") ||
        text.includes("wood") ||
        text.includes("furniture") ||
        text.includes("cabinet") ||
        text.includes("shelf") ||
        text.includes("table") ||
        text.includes("chair")
      ) {
        textCategory = "Carpentry";
      }
    }

    // Step 2: If text gave a clear category, use it; otherwise use AI image prediction
    if (textCategory) {
      predictedCategory = textCategory;
      console.log("Text-based Category:", predictedCategory);
    } else if (image) {

      const imagePath = "uploads/" + image;

      const formData = new FormData();
      formData.append("image", fs.createReadStream(imagePath));

      const aiResponse = await axios.post(
        "http://localhost:5001/predict",
        formData,
        { headers: formData.getHeaders() }
      );

      predictedCategory = aiResponse.data.category;

      console.log("AI Predicted Category:", predictedCategory);

    }

    // Step 3: Get user's address for proximity matching
    db.query(
      "SELECT address FROM users WHERE id = ?",
      [userId],
      (err, userResult) => {

        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Database Error" });
        }

        const userAddress = userResult.length > 0 ? (userResult[0].address || "") : "";
        const addressWords = userAddress.toLowerCase().split(/[,\s]+/).filter(w => w.length > 2);

        // Build proximity SQL: prefer technicians whose address shares words with user's address
        let techSql = `
          SELECT *, (
        `;

        if (addressWords.length > 0) {
          const matchClauses = addressWords.map(() => 
            `(LOWER(address) LIKE ?)`
          );
          techSql += matchClauses.join(" + ");
        } else {
          techSql += `0`;
        }

        techSql += `
          ) AS address_match_score
          FROM technicians
          WHERE category = ?
          AND status = 'Available'
          ORDER BY address_match_score DESC, RAND()
          LIMIT 1
        `;

        const params = [
          ...addressWords.map(w => `%${w}%`),
          predictedCategory
        ];

        db.query(techSql, params, (err, tech) => {

          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Database Error" });
          }

          const techId = tech.length > 0 ? tech[0].id : null;
          const techName = tech.length > 0 ? tech[0].name : null;
          const matchScore = tech.length > 0 ? tech[0].address_match_score : 0;

          console.log(`Assigned Technician: ${techName}, Match Score: ${matchScore}`);

          db.query(
            `
            INSERT INTO complaints 
            (issue, category, image, technician_id, status, user_id)
            VALUES (?, ?, ?, ?, 'Pending', ?)
            `,
            [issue, predictedCategory, image, techId, userId],
            (err) => {

              if (err) {
                console.error(err);
                return res.status(500).json({ message: "Insert Error" });
              }

              if (techId) {
                db.query(
                  "UPDATE technicians SET status='Busy' WHERE id=?",
                  [techId]
                );
              }

              res.json({
                message: "Complaint Submitted Successfully",
                category: predictedCategory,
                assignedTo: techName || "No technician available",
                proximityMatch: matchScore > 0 ? "Nearby technician assigned!" : "Random assignment"
              });

            }
          );

        });

      }
    );

  } catch (error) {

    console.error("AI Prediction Error:", error);

    res.status(500).json({
      message: "AI classification failed"
    });

  }

});


router.put("/resolve/:id", (req, res) => {

  const complaintId = req.params.id;

  db.query(
    "SELECT technician_id FROM complaints WHERE id=?",
    [complaintId],
    (err, result) => {

      if (err || result.length === 0) {
        return res.status(404).json({ message: "Complaint not found" });
      }

      const techId = result[0].technician_id;

      db.query(
        "UPDATE complaints SET status='Resolved' WHERE id=?",
        [complaintId],
        (err) => {

          if (err) {
            return res.status(500).json({ message: "Update failed" });
          }

          if (techId) {

            db.query(
              "UPDATE technicians SET status='Available' WHERE id=?",
              [techId]
            );

          }

          res.json({
            message: "Complaint Resolved Successfully"
          });

        }
      );

    }
  );

});
router.delete("/:id", (req, res) => {

  const id = req.params.id;

  const sql = "DELETE FROM complaints WHERE id = ?";

  db.query(sql, [id], (err, result) => {

    if (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ message: "Complaint deleted successfully" });

  });

});

module.exports = router;