import express from "express";

import { verifyToken } from "../utils/verifyUser.js";

import {
  fetchNotifications,
  markAllAsRead,
  markAsRead,
  logClientEvent,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/get", verifyToken, fetchNotifications);

router.put("/mark-as-read/:id", verifyToken, markAsRead);
router.put("/mark-all-as-read", verifyToken, markAllAsRead);

router.post("/log-client-event", verifyToken, logClientEvent);

export default router;
