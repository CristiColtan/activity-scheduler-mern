import express from "express";

import { verifyToken } from "../utils/verifyUser.js";

import {
  fetchDashboardStatistics,
  updateProfile,
} from "../controllers/normal-user.controller.js";

const router = express.Router();

router.get("/get-dashboard-statistics", verifyToken, fetchDashboardStatistics);

router.put("/update-my-profile/:id", verifyToken, updateProfile);

export default router;
