const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));
const authRoutes = require("./routes/auth");
const complaintRoutes = require("./routes/complaints");
const technicianRoutes = require("./routes/technicians");
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/technicians", technicianRoutes);
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});