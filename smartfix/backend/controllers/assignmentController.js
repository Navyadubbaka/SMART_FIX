const Complaint = require("../models/Complaint");
const User = require("../models/User");
const { assignBestTechnician } = require("../services/assignmentService");

const assignComplaint = async (req, res, next) => {
  try {
    const { complaintId, technicianId } = req.body;
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    let technician = null;
    if (technicianId) {
      technician = await User.findOne({ _id: technicianId, role: "technician" });
      if (!technician) return res.status(404).json({ message: "Technician not found" });
    } else {
      technician = await assignBestTechnician(complaint);
    }

    if (!technician) return res.status(404).json({ message: "No available technician" });

    complaint.assignedTechnician = technician._id;
    complaint.status = "Assigned";
    complaint.statusLogs.push({
      status: "Assigned",
      note: `Manually assigned to ${technician.name}`,
      updatedBy: req.user.userId
    });
    await complaint.save();

    return res.json({ message: "Technician assigned", complaint, technician });
  } catch (error) {
    return next(error);
  }
};

module.exports = { assignComplaint };
