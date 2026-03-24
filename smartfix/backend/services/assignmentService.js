const Complaint = require("../models/Complaint");
const User = require("../models/User");

const distance = (a, b) => {
  const dx = (a.lat || 0) - (b.lat || 0);
  const dy = (a.lng || 0) - (b.lng || 0);
  return Math.sqrt(dx * dx + dy * dy);
};

const assignBestTechnician = async (complaint) => {
  const technicians = await User.find({
    role: "technician",
    availabilityStatus: "Available",
    skills: complaint.category
  });

  if (!technicians.length) return null;

  let best = null;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const tech of technicians) {
    const activeCount = await Complaint.countDocuments({
      assignedTechnician: tech._id,
      status: { $in: ["Assigned", "In Progress"] }
    });

    // Weighted score: prioritize least workload, then nearest location.
    const score = activeCount * 10 + distance(complaint.location || {}, tech.location || {});
    if (score < bestScore) {
      best = tech;
      bestScore = score;
    }
  }

  return best;
};

module.exports = { assignBestTechnician };
