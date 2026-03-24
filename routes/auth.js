const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");


router.post("/register", async (req, res) => {

  const { name, email, phone, password, role } = req.body;

  try {

    const hashpass = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, email, phone, password, role)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, email, phone, hashpass, role], (err, result) => {

      if (err) {

        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({
            message: "Email already exists"
          });
        }

        return res.status(500).json({
          message: "Database error"
        });
      }

      res.json({
        message: "User registered successfully"
      });

    });

  } catch (error) {

    res.status(500).json({
      message: "Error hashing password"
    });

  }

});


router.post("/login", (req, res) => {

  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, results) => {

    if (err)
      return res.status(500).json({
        message: "Database error"
      });

    if (results.length === 0) {
      return res.json({
        message: "Invalid Credentials"
      });
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password);

    if (match) {

      res.json({
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role
      });

    } else {

      res.json({
        message: "Invalid Credentials"
      });

    }

  });

});


module.exports = router;