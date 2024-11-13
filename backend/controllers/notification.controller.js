import { errorHandler } from "../utils/error.js";

import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

export const fetchNotifications = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    const notifs = await Notification.find({
      sent_to: userID,
      read_by: { $ne: userID },
    });

    res.status(200).json(notifs);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: {
          read_by: userID,
        },
      },
      { new: true }
    );

    if (!notif) return next(errorHandler(404, "Notification not found!"));

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    await Notification.updateMany(
      {
        sent_to: userID,
        read_by: {
          $ne: userID,
        },
      },
      { $addToSet: { read_by: userID } }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};
