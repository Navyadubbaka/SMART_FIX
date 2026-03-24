const Notification = require("../models/Notification");

const createNotification = async (userId, title, message) => {
  if (!userId) return;
  await Notification.create({ user: userId, title, message });
};

module.exports = { createNotification };
