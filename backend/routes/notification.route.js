import express from "express";

import { verifyToken } from "../utils/verifyUser.js";

import {
  fetchNotifications,
  markAllAsRead,
  markAsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/get", verifyToken, fetchNotifications);

router.put("/mark-as-read/:id", verifyToken, markAsRead);
router.put("/mark-all-as-read", verifyToken, markAllAsRead);

export default router;
