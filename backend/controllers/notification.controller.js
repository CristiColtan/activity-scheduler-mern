import { errorHandler } from "../utils/error.js";

import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

import apm from "elastic-apm-node";
import { userLogger, notifsLogger } from "../utils/logger.js";

export const fetchNotifications = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction(
    "User-[fetchNotifications]",
    "users"
  );
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const userID = req.user.id;

    userLogger.info("Fetching notifications", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/notif/get",
      method: "POST",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      userLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    const notifs = await Notification.find({
      sent_to: userID,
      read_by: { $ne: userID },
    });

    const duration = Date.now() - start;
    userLogger.info("User fetch notifications successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(notifs);
  } catch (error) {
    userLogger.error("Error fetching notifications!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("User-[MarkAsReadNotif]", "users");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const userID = req.user.id;

    userLogger.info("Marking as read notification", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/notif/mark-as-read/:id",
      method: "PUT",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      userLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: {
          read_by: userID,
        },
      },
      { new: true }
    );

    if (!notif) {
      notifsLogger.error("Notification not found!", {
        traceId,
        transactionId: transaction?.id,
        notifID: req.params.id,
      });
      return next(errorHandler(404, "Notification not found!"));
    }

    const duration = Date.now() - start;
    userLogger.info("User marked as read notification successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      data_message: `Notifification: ${notif.text}`,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    userLogger.error("Error marking as read notification!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction(
    "User-[MarkAsReadAllNotif]",
    "users"
  );
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const userID = req.user.id;

    userLogger.info("Marking as read all notifications", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/notif/mark-all-as-read",
      method: "PUT",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      userLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    await Notification.updateMany(
      {
        sent_to: userID,
        read_by: {
          $ne: userID,
        },
      },
      { $addToSet: { read_by: userID } }
    );

    const duration = Date.now() - start;
    userLogger.info("User marked as read all notifications successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    userLogger.error("Error marking as read all notifications!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const logClientEvent = async (req, res, next) => {
  const { level = "info", message } = req.body;

  const transaction = apm.startTransaction("Frontend-[log]", "frontend");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  const logPayload = {
    traceId,
    transactionId: transaction?.id,
    userID: req.user.id,
  };

  switch (level) {
    case "info":
      notifsLogger.info(message, logPayload);
      break;
    case "warn":
      notifsLogger.warn(message, logPayload);
      break;
    case "error":
      notifsLogger.error(message, logPayload);
      break;
    default:
      notifsLogger.info(message, logPayload);
  }

  if (transaction) transaction.end();

  res.status(200).json("Logged frontend successfully!");
};
