const express = require("express");
const router  = express.Router();
const db      = require("../db");
const bcrypt  = require("bcrypt");

// ═══════════════════════════════════════════════════════════
//  REGISTER
//  - All roles go into `users`
//  - If role = technician → also inserted into `technicians`
//    with skills, category, availability, experience
// ═══════════════════════════════════════════════════════════
router.post("/register", async (req, res) => {

  const { name, email, phone, address, password, role, skills, experience } = req.body;

  // ── Basic validation ────────────────────────────────────
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Name, email, password and role are required." });
  }

  if (role === "technician" && (!skills || skills.trim() === "")) {
    return res.status(400).json({ message: "Please select at least one skill." });
  }

  try {
    const hashpass = await bcrypt.hash(password, 10);

    // ── Step 1: Insert into users ───────────────────────
    const userSql = `
      INSERT INTO users (name, email, phone, address, password, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      userSql,
      [name, email, phone || null, address || null, hashpass, role],
      (userErr, userResult) => {

        if (userErr) {
          if (userErr.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "This email is already registered." });
          }
          console.error("User insert error:", userErr);
          return res.status(500).json({ message: "Database error creating user." });
        }

        // ── Step 2: If technician → insert profile ──────
        if (role === "technician") {

          const userId          = userResult.insertId;
          const skillList       = String(skills).trim();
          const primaryCategory = skillList.split(",")[0].trim();

          // Column order matches DB: user_id,name,phone,category,status,address,skills,availability,experience
          const techSql = `
            INSERT INTO technicians
              (user_id, name, phone, category, status, address, skills, availability, experience)
            VALUES (?, ?, ?, ?, 'Available', ?, ?, 'Available', ?)
          `;

          db.query(
            techSql,
            [
              userId,
              name,
              phone           || null,
              primaryCategory,
              address         || null,
              skillList,
              experience      || null
            ],
            (techErr) => {
              if (techErr) {
                console.error("Technician insert error:", techErr);
                return res.status(500).json({
                  message: "Account created but technician profile failed: " + techErr.message
                });
              }

              console.log(`\u2705 Technician registered: ${name} | Skills: ${skillList} | Category: ${primaryCategory}`);
              return res.status(200).json({
                message: "Technician registered successfully! You can now log in."
              });
            }
          );

        } else {
          // Regular user or admin — done
          console.log(`✅ ${role} registered: ${name}`);
          return res.status(200).json({ message: "Account created successfully!" });
        }
    // db.query(sql, [name, email, phone, address, hashpass, role], (err, result) => {

    //   if (err) {

    //     if (err.code === "ER_DUP_ENTRY") {
    //       return res.status(400).json({
    //         message: "Email already exists"
    //       });
    //     }

    //     return res.status(500).json({
    //       message: "Database error"
    //     });
    //   }

    //   if (role === 'technician') {
    //     const techSql = `
    //       INSERT INTO technicians (name, phone, address, category, status)
    //       VALUES (?, ?, ?, 'General', 'Available')
    //     `;
    //     db.query(techSql, [name, phone, address], (techErr) => {
    //       if (techErr) {
    //         console.error("Error inserting into technicians:", techErr);
    //         // We can still return success for user registration, or a partial error
    //       }
    //       return res.json({
    //         message: "Technician registered successfully"
    //       });
    //     });
    //   } else {
    //     res.json({
    //       message: "User registered successfully"
    //     });
    //   }

    // });
    db.query(sql, [name, email, phone, address, hashpass, role], (err, result) => {

  if (err) {

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Email already exists" });
    }

    return res.status(500).json({ message: "Database error" });
  }

  const userId = result.insertId;

  
  if (role === 'technician') {

    const techSql = `
      INSERT INTO technicians (name, phone, address, category, status, user_id)
      VALUES (?, ?, ?, 'General', 'Available', ?)
    `;

    db.query(techSql, [name, phone, address, userId], (techErr) => {

      if (techErr) {
        console.error("Technician insert error:", techErr);
      }
    );

  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
      return res.json({
        message: "Technician registered successfully"
      });
    });

  } else {

    res.json({
      message: "User registered successfully"
    });

  }

});

  } catch (error) {

    res.status(500).json({
      message: "Error hashing password"
    });

  }

});


// ═══════════════════════════════════════════════════════════
//  LOGIN
//  - Technician login also fetches their skills + availability
//    from technicians table for complaint matching
// ═══════════════════════════════════════════════════════════
router.post("/login", (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {

    if (err) return res.status(500).json({ message: "Database error." });

    if (results.length === 0) {
      return res.json({ message: "Invalid Credentials" });
    }

    const user  = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.json({ message: "Invalid Credentials" });
    }

    // ── Technician: also fetch their skills profile ─────
    if (user.role === "technician") {

      db.query(
        `SELECT id, category, skills, status, availability, experience
         FROM technicians
         WHERE user_id = ?
         LIMIT 1`,
        [user.id],
        (techErr, techRows) => {

          if (techErr) console.error("Tech profile lookup error:", techErr);

          const tech = techRows && techRows.length > 0 ? techRows[0] : null;

          return res.json({
            id:            user.id,
            name:          user.name,
            phone:         user.phone,
            address:       user.address,
            role:          user.role,
            technician_id: tech ? tech.id : null,
            skills:        tech ? (tech.skills   || tech.category || null) : null,
            availability:  tech ? (tech.availability || tech.status || null) : null,
            experience:    tech ? (tech.experience || null) : null,
          });
        }
      );

    } else {
      return res.json({
        id:      user.id,
        name:    user.name,
        phone:   user.phone,
        address: user.address,
        role:    user.role,
      });
    }

  });

});


module.exports = router;