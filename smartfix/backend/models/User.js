const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "technician", "admin"],
      default: "user"
    },
    phone: { type: String, default: "" },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      label: { type: String, default: "" }
    },
    skills: [
      {
        type: String,
        enum: ["Electrical", "Plumbing", "Mechanical", "Appliance", "Hardware"]
      }
    ],
    availabilityStatus: {
      type: String,
      enum: ["Available", "Busy"],
      default: "Available"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
