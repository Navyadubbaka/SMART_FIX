const Complaint = require("../models/Complaint");
const User = require("../models/User");

const getTechnicians = async (req, res, next) => {
  try {
    const techs = await User.find({ role: "technician" }).select("-password").sort({ createdAt: -1 });
    return res.json(techs);
  } catch (error) {
    return next(error);
  }
};

const updateTechnicianStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["Available", "Busy"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { availabilityStatus: status },
      { new: true }
    ).select("-password");
    return res.json({ message: "Availability updated", user });
  } catch (error) {
    return next(error);
  }
};

const getTechnicianTasks = async (req, res, next) => {
  try {
    const tasks = await Complaint.find({ assignedTechnician: req.user.userId })
      .populate("user", "name email")
      .sort({ updatedAt: -1 });
    return res.json(tasks);
  } catch (error) {
    return next(error);
  }
};

const technicianPerformance = async (req, res, next) => {
  try {
    const resolved = await Complaint.countDocuments({
      assignedTechnician: req.user.userId,
      status: "Resolved"
    });
    const active = await Complaint.countDocuments({
      assignedTechnician: req.user.userId,
      status: { $in: ["Assigned", "In Progress"] }
    });
    return res.json({ resolved, active });
  } catch (error) {
    return next(error);
  }
};

const respondTask = async (req, res, next) => {
  try {
    const { action } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Task not found" });
    if (String(complaint.assignedTechnician) !== req.user.userId) {
      return res.status(403).json({ message: "Not your assigned task" });
    }
    if (action === "accept") {
      complaint.status = "In Progress";
      complaint.statusLogs.push({
        status: "In Progress",
        note: "Technician accepted task",
        updatedBy: req.user.userId
      });
    } else if (action === "reject") {
      complaint.status = "Open";
      complaint.assignedTechnician = null;
      complaint.statusLogs.push({
        status: "Open",
        note: "Technician rejected task; returned for reassignment",
        updatedBy: req.user.userId
      });
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }
    await complaint.save();
    return res.json({ message: `Task ${action}ed`, complaint });
  } catch (error) {
    return next(error);
  }
};

const addTechnician = async (req, res, next) => {
  try {
    const tech = await User.create({ ...req.body, role: "technician" });
    return res.status(201).json(tech);
  } catch (error) {
    return next(error);
  }
};

const updateTechnician = async (req, res, next) => {
  try {
    const tech = await User.findOneAndUpdate(
      { _id: req.params.id, role: "technician" },
      req.body,
      { new: true }
    ).select("-password");
    return res.json(tech);
  } catch (error) {
    return next(error);
  }
};

const deleteTechnician = async (req, res, next) => {
  try {
    await User.findOneAndDelete({ _id: req.params.id, role: "technician" });
    return res.json({ message: "Technician deleted" });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getTechnicians,
  updateTechnicianStatus,
  getTechnicianTasks,
  technicianPerformance,
  respondTask,
  addTechnician,
  updateTechnician,
  deleteTechnician
};
