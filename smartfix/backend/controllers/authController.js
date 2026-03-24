const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const normalizeSkill = (skill = "") => {
  const normalized = skill.trim().toLowerCase();
  const map = {
    electrical: "Electrical",
    plumbing: "Plumbing",
    mechanical: "Mechanical",
    appliance: "Appliance",
    hardware: "Hardware"
  };
  return map[normalized] || null;
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, location, skills } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, password are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered" });

    const normalizedSkills = Array.isArray(skills)
      ? skills.map(normalizeSkill).filter(Boolean)
      : [];

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || "user",
      phone: phone || "",
      location: location || undefined,
      skills: normalizedSkills
    });
    return res.status(201).json({ message: "Registration successful", userId: user._id });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    return next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    return res.json(user);
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updated = await User.findByIdAndUpdate(req.user.userId, req.body, { new: true }).select("-password");
    return res.json(updated);
  } catch (error) {
    return next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile };
