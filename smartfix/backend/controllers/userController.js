const User = require("../models/User");

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getAllUsers };
