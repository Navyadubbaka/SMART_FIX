const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { getAllUsers } = require("../controllers/userController");

router.get("/", authenticate, authorize("admin"), getAllUsers);

module.exports = router;
