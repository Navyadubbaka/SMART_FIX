const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/authMiddleware");
const {
  getTechnicians,
  updateTechnicianStatus,
  getTechnicianTasks,
  technicianPerformance,
  respondTask,
  addTechnician,
  updateTechnician,
  deleteTechnician
} = require("../controllers/technicianController");

router.get("/", authenticate, authorize("admin"), getTechnicians);
router.post("/", authenticate, authorize("admin"), addTechnician);
router.put("/:id", authenticate, authorize("admin"), updateTechnician);
router.delete("/:id", authenticate, authorize("admin"), deleteTechnician);
router.put("/status", authenticate, authorize("technician"), updateTechnicianStatus);
router.get("/tasks", authenticate, authorize("technician"), getTechnicianTasks);
router.post("/tasks/:id/respond", authenticate, authorize("technician"), respondTask);
router.get("/performance", authenticate, authorize("technician"), technicianPerformance);

module.exports = router;
