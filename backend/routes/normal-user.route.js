import express from "express";

import { verifyToken } from "../utils/verifyUser.js";

import { fetchDashboardStatistics } from "../controllers/normal-user.controller.js";

const router = express.Router();

router.get("/get-dashboard-statistics", verifyToken, fetchDashboardStatistics);

export default router;
