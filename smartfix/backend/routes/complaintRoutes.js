const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const {
  createComplaint,
  getUserComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  getAnalytics
} = require("../controllers/complaintController");

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

router.post("/", authenticate, authorize("user", "admin"), upload.single("image"), createComplaint);
router.get("/user", authenticate, authorize("user"), getUserComplaints);
router.get("/all", authenticate, authorize("admin"), getAllComplaints);
router.get("/analytics/summary", authenticate, authorize("admin"), getAnalytics);
router.get("/:id", authenticate, getComplaintById);
router.put("/status", authenticate, authorize("technician", "admin"), updateComplaintStatus);

module.exports = router;
