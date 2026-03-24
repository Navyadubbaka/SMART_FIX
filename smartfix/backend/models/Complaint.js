const mongoose = require("mongoose");

const statusLogSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Open", "Assigned", "In Progress", "Resolved"],
      required: true
    },
    note: { type: String, default: "" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      label: { type: String, default: "" }
    },
    category: {
      type: String,
      enum: ["Electrical", "Plumbing", "Mechanical", "Appliance", "Hardware"],
      default: "Hardware"
    },
    confidenceScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Open", "Assigned", "In Progress", "Resolved"],
      default: "Open"
    },
    assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolutionNotes: { type: String, default: "" },
    statusLogs: [statusLogSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
