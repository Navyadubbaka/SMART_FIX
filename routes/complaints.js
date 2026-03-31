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

  const role         = req.query.role;
  const userId       = req.query.user_id;
  const technicianId = req.query.technician_id;

  let sql = `
    SELECT complaints.*,
           technicians.name    AS technician_name,
           technicians.phone   AS technician_phone,
           technicians.address AS technician_address,
           technicians.status  AS technician_status,
           users.name    AS user_name,
           users.phone   AS user_phone,
           users.address AS user_address
    FROM complaints
    LEFT JOIN technicians ON complaints.technician_id = technicians.id
    LEFT JOIN users       ON complaints.user_id       = users.id
  `;

  if (role === "user") {
    sql += ` WHERE complaints.user_id = ${db.escape(userId)}`;
  } else if (role === "technician" && technicianId) {
    // Technician sees only complaints assigned to them
    sql += ` WHERE complaints.technician_id = ${db.escape(technicianId)}`;
  }
  // admin: no filter — sees all complaints

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

      // ── AC ──────────────────────────────────────────────────────
      if (
        text.includes("ac") ||
        text.includes("air conditioner") ||
        text.includes("air conditioning") ||
        text.includes("cooling") ||
        text.includes("split unit") ||
        text.includes("hvac")
      ) {
        textCategory = "AC";
      }

      // ── Washing Machine ─────────────────────────────────────────
      else if (
        text.includes("washing machine") ||
        text.includes("washer") ||
        text.includes("laundry machine") ||
        text.includes("spin") ||
        text.includes("dryer")
      ) {
        textCategory = "Washing Machine";
      }

      // ── Refrigerator ────────────────────────────────────────────
      else if (
        text.includes("fridge") ||
        text.includes("refrigerator") ||
        text.includes("freezer") ||
        text.includes("not cooling") ||
        text.includes("ice maker")
      ) {
        textCategory = "Refrigerator";
      }

      // ── Microwave ───────────────────────────────────────────────
      else if (
        text.includes("microwave") ||
        text.includes("oven") ||
        text.includes("heating food")
      ) {
        textCategory = "Microwave";
      }

      // ── Geyser ──────────────────────────────────────────────────
      else if (
        text.includes("geyser") ||
        text.includes("water heater") ||
        text.includes("hot water") ||
        text.includes("geiser")
      ) {
        textCategory = "Geyser";
      }

      // ── Drainage ────────────────────────────────────────────────
      else if (
        text.includes("drain") ||
        text.includes("drainage") ||
        text.includes("clogged") ||
        text.includes("blocked drain") ||
        text.includes("sewer") ||
        text.includes("overflow")
      ) {
        textCategory = "Drainage";
      }

      // ── Leak ────────────────────────────────────────────────────
      else if (
        text.includes("leak") ||
        text.includes("leakage") ||
        text.includes("seepage") ||
        text.includes("dripping") ||
        text.includes("water coming")
      ) {
        textCategory = "Leak";
      }

      // ── Plumbing ────────────────────────────────────────────────
      else if (
        text.includes("pipe") ||
        text.includes("water") ||
        text.includes("tap") ||
        text.includes("plumbing") ||
        text.includes("faucet") ||
        text.includes("toilet") ||
        text.includes("shower") ||
        text.includes("flush")
      ) {
        textCategory = "Plumbing";
      }

      // ── Electrical ──────────────────────────────────────────────
      else if (
        text.includes("light") ||
        text.includes("wire") ||
        text.includes("electric") ||
        text.includes("switch") ||
        text.includes("power") ||
        text.includes("socket") ||
        text.includes("circuit") ||
        text.includes("fan") ||
        text.includes("bulb") ||
        text.includes("short circuit") ||
        text.includes("mcb") ||
        text.includes("fuse")
      ) {
        textCategory = "Electrical";
      }

      // ── Inverter ────────────────────────────────────────────────
      else if (
        text.includes("inverter") ||
        text.includes("ups") ||
        text.includes("battery backup") ||
        text.includes("power backup")
      ) {
        textCategory = "Inverter";
      }

      // ── Generator ───────────────────────────────────────────────
      else if (
        text.includes("generator") ||
        text.includes("genset") ||
        text.includes("diesel generator")
      ) {
        textCategory = "Generator";
      }

      // ── CCTV ────────────────────────────────────────────────────
      else if (
        text.includes("cctv") ||
        text.includes("camera") ||
        text.includes("surveillance") ||
        text.includes("security camera") ||
        text.includes("dvr") ||
        text.includes("nvr")
      ) {
        textCategory = "CCTV";
      }

      // ── Appliance (general) ─────────────────────────────────────
      else if (
        text.includes("appliance") ||
        text.includes("tv") ||
        text.includes("television") ||
        text.includes("mixer") ||
        text.includes("grinder") ||
        text.includes("iron") ||
        text.includes("electric kettle")
      ) {
        textCategory = "Appliance";
      }

      // ── Door ────────────────────────────────────────────────────
      else if (
        text.includes("door") ||
        text.includes("hinge") ||
        text.includes("door lock") ||
        text.includes("door knob") ||
        text.includes("door frame")
      ) {
        textCategory = "Door";
      }

      // ── Window ──────────────────────────────────────────────────
      else if (
        text.includes("window") ||
        text.includes("glass pane") ||
        text.includes("window frame") ||
        text.includes("mosquito net")
      ) {
        textCategory = "Window";
      }

      // ── Furniture ───────────────────────────────────────────────
      else if (
        text.includes("furniture") ||
        text.includes("sofa") ||
        text.includes("bed") ||
        text.includes("cupboard") ||
        text.includes("wardrobe") ||
        text.includes("shelf") ||
        text.includes("table") ||
        text.includes("chair")
      ) {
        textCategory = "Furniture";
      }

      // ── Carpentry ───────────────────────────────────────────────
      else if (
        text.includes("wood") ||
        text.includes("carpentry") ||
        text.includes("cabinet") ||
        text.includes("plywood") ||
        text.includes("wooden")
      ) {
        textCategory = "Carpentry";
      }

      // ── Painting ────────────────────────────────────────────────
      else if (
        text.includes("paint") ||
        text.includes("painting") ||
        text.includes("distemper") ||
        text.includes("wall color") ||
        text.includes("primer")
      ) {
        textCategory = "Painting";
      }

      // ── Wall Repair ─────────────────────────────────────────────
      else if (
        text.includes("wall crack") ||
        text.includes("wall repair") ||
        text.includes("plaster") ||
        text.includes("crack in wall") ||
        text.includes("wall damage")
      ) {
        textCategory = "Wall Repair";
      }

      // ── Waterproofing ───────────────────────────────────────────
      else if (
        text.includes("waterproof") ||
        text.includes("waterproofing") ||
        text.includes("damp wall") ||
        text.includes("seepage wall") ||
        text.includes("moisture")
      ) {
        textCategory = "Waterproofing";
      }

      // ── Roofing ─────────────────────────────────────────────────
      else if (
        text.includes("roof") ||
        text.includes("roofing") ||
        text.includes("ceiling crack") ||
        text.includes("terrace") ||
        text.includes("slab")
      ) {
        textCategory = "Roofing";
      }

      // ── Interior ────────────────────────────────────────────────
      else if (
        text.includes("interior") ||
        text.includes("false ceiling") ||
        text.includes("pop work") ||
        text.includes("gypsum") ||
        text.includes("partition")
      ) {
        textCategory = "Interior";
      }

      // ── Cleaning ────────────────────────────────────────────────
      else if (
        text.includes("clean") ||
        text.includes("cleaning") ||
        text.includes("housekeeping") ||
        text.includes("sweep") ||
        text.includes("mop") ||
        text.includes("sanitize")
      ) {
        textCategory = "Cleaning";
      }

      // ── Pest Control ────────────────────────────────────────────
      else if (
        text.includes("pest") ||
        text.includes("cockroach") ||
        text.includes("termite") ||
        text.includes("rat") ||
        text.includes("mice") ||
        text.includes("insect") ||
        text.includes("mosquito") ||
        text.includes("bedbug")
      ) {
        textCategory = "Pest Control";
      }

      // ── Gardening ───────────────────────────────────────────────
      else if (
        text.includes("garden") ||
        text.includes("plant") ||
        text.includes("tree") ||
        text.includes("lawn") ||
        text.includes("pruning") ||
        text.includes("grass cutting")
      ) {
        textCategory = "Gardening";
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
        // Supports BOTH legacy columns (category/status) and new columns (skills/availability)
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
          WHERE (category = ? OR skills LIKE ?)
            AND (status = 'Available' OR availability = 'Available')
          ORDER BY address_match_score DESC, RAND()
          LIMIT 1
        `;

        const skillPattern = `%${predictedCategory}%`;
        const params = [
          ...addressWords.map(w => `%${w}%`),
          predictedCategory,
          skillPattern
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
                  "UPDATE technicians SET status='Busy', availability='Busy' WHERE id=?",
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
              "UPDATE technicians SET status='Available', availability='Available' WHERE id=?",
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