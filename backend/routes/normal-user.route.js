import express from "express";

import { verifyToken } from "../utils/verifyUser.js";

import {
  assignHoursToTask,
  fetchDashboardStatistics,
  fetchHours,
  updateProfile,
} from "../controllers/normal-user.controller.js";

const router = express.Router();

router.get("/get-dashboard-statistics", verifyToken, fetchDashboardStatistics);
router.get("/get-hours/:taskId", verifyToken, fetchHours);

router.put("/update-my-profile/:id", verifyToken, updateProfile);

router.put("/assign-hours", verifyToken, assignHoursToTask);

export default router;
