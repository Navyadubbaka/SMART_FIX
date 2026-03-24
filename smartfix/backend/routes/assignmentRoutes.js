const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { assignComplaint } = require("../controllers/assignmentController");

router.post("/", authenticate, authorize("admin"), assignComplaint);

module.exports = router;
