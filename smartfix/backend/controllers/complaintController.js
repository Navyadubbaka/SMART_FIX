const axios = require("axios");
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const { assignBestTechnician } = require("../services/assignmentService");
const { createNotification } = require("../services/notificationService");

const buildComplaintId = () => `CMP-${Date.now()}`;

const createComplaint = async (req, res, next) => {
  try {
    const { description, locationLabel, lat, lng } = req.body;
    if (!description || !req.file) {
      return res.status(400).json({ message: "Image and description are required" });
    }

    let category = "Hardware";
    let confidence = 0;
    try {
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL}/predict`, {
        image_path: req.file.path
      });
      category = aiResponse.data.predicted_category || category;
      confidence = aiResponse.data.confidence_score || 0;
    } catch (error) {
      // Continue with default category if AI is unavailable.
    }

    const complaint = await Complaint.create({
      complaintId: buildComplaintId(),
      user: req.user.userId,
      imageUrl: `/${req.file.path.replace(/\\/g, "/")}`,
      description,
      category,
      confidenceScore: confidence,
      location: {
        lat: Number(lat || 0),
        lng: Number(lng || 0),
        label: locationLabel || ""
      },
      statusLogs: [{ status: "Open", note: "Complaint created", updatedBy: req.user.userId }]
    });

    await createNotification(req.user.userId, "Complaint Submitted", `${complaint.complaintId} created`);

    const technician = await assignBestTechnician(complaint);
    if (technician) {
      complaint.assignedTechnician = technician._id;
      complaint.status = "Assigned";
      complaint.statusLogs.push({
        status: "Assigned",
        note: `Assigned to ${technician.name}`,
        updatedBy: technician._id
      });
      await complaint.save();
      await createNotification(technician._id, "New Task Assigned", `${complaint.complaintId} assigned to you`);
    }

    return res.status(201).json({ message: "Complaint submitted", complaint });
  } catch (error) {
    return next(error);
  }
};

const getUserComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ user: req.user.userId })
      .populate("assignedTechnician", "name email")
      .sort({ createdAt: -1 });
    return res.json(complaints);
  } catch (error) {
    return next(error);
  }
};

const getAllComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .populate("user", "name email")
      .populate("assignedTechnician", "name email")
      .sort({ createdAt: -1 });
    return res.json(complaints);
  } catch (error) {
    return next(error);
  }
};

const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("user", "name email")
      .populate("assignedTechnician", "name email");
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    return res.json(complaint);
  } catch (error) {
    return next(error);
  }
};

const updateComplaintStatus = async (req, res, next) => {
  try {
    const { complaintId, status, resolutionNotes } = req.body;
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status = status;
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
    complaint.statusLogs.push({
      status,
      note: resolutionNotes || `Status changed to ${status}`,
      updatedBy: req.user.userId
    });
    await complaint.save();

    await createNotification(complaint.user, "Complaint Status Updated", `${complaint.complaintId} is now ${status}`);
    if (complaint.assignedTechnician) {
      await createNotification(
        complaint.assignedTechnician,
        "Task Status Updated",
        `${complaint.complaintId} moved to ${status}`
      );
    }
    return res.json({ message: "Status updated", complaint });
  } catch (error) {
    return next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const totalComplaints = await Complaint.countDocuments();
    const byCategory = await Complaint.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
    const resolved = await Complaint.find({ status: "Resolved" });
    const avgResolutionMs =
      resolved.reduce((acc, c) => acc + (c.updatedAt.getTime() - c.createdAt.getTime()), 0) /
      (resolved.length || 1);

    const techPerformance = await User.aggregate([
      { $match: { role: "technician" } },
      {
        $lookup: {
          from: "complaints",
          localField: "_id",
          foreignField: "assignedTechnician",
          as: "tasks"
        }
      },
      {
        $project: {
          name: 1,
          completed: {
            $size: {
              $filter: { input: "$tasks", as: "t", cond: { $eq: ["$$t.status", "Resolved"] } }
            }
          },
          active: {
            $size: {
              $filter: {
                input: "$tasks",
                as: "t",
                cond: { $in: ["$$t.status", ["Assigned", "In Progress"]] }
              }
            }
          }
        }
      }
    ]);

    return res.json({
      totalComplaints,
      byCategory,
      avgResolutionHours: Number((avgResolutionMs / (1000 * 60 * 60)).toFixed(2)),
      techPerformance
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createComplaint,
  getUserComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaintStatus,
  getAnalytics
};
