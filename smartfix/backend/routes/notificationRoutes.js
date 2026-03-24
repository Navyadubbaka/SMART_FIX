const router = require("express").Router();
const { authenticate } = require("../middleware/authMiddleware");
const { getMyNotifications } = require("../controllers/notificationController");

router.get("/my", authenticate, getMyNotifications);

module.exports = router;
