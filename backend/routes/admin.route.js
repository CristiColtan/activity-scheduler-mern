import express from "express";

import {
  getTeamManagers,
  getNormalUsers,
  addTeamManager,
  removeTeamManager,
  editTeamManager,
  makeAccountActiveOrInactive,
  getAllUsers,
  fetchAllTrashedTasks,
  fetchDashboardStatistics,
  switchStatusFetchUsers,
  editUser,
  fetchAllTasksPopulated,
  deleteAsset,
  deleteActivity,
  editActivity,
} from "../controllers/admin.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
import { verifyAdmin } from "../utils/verifyAdmin.js";

const router = express.Router();

router.get("/get/team-managers", verifyToken, verifyAdmin, getTeamManagers);
router.get("/get/normal-users", verifyToken, verifyAdmin, getNormalUsers);
router.get("/get/all-users", verifyToken, verifyAdmin, getAllUsers);
router.get(
  "/get-dashboard-statistics",
  verifyToken,
  verifyAdmin,
  fetchDashboardStatistics
);
router.get(
  "/get/all-trashed-tasks",
  verifyToken,
  verifyAdmin,
  fetchAllTrashedTasks
);
router.get(
  "/get/all-tasks-populated",
  verifyToken,
  verifyAdmin,
  fetchAllTasksPopulated
);

router.post("/add/team-manager", verifyToken, verifyAdmin, addTeamManager);
router.post(
  "/remove/team-manager",
  verifyToken,
  verifyAdmin,
  removeTeamManager
);

router.put("/delete/asset", verifyToken, verifyAdmin, deleteAsset);
router.put("/delete/activity", verifyToken, verifyAdmin, deleteActivity);
router.put("/edit/activity", verifyToken, verifyAdmin, editActivity);
router.put("/edit/user-fetch-users/:id", verifyToken, verifyAdmin, editUser);
router.put(
  "/edit/team-manager/:memberID",
  verifyToken,
  verifyAdmin,
  editTeamManager
);
router.put(
  "/switch-status",
  verifyToken,
  verifyAdmin,
  makeAccountActiveOrInactive
);
router.put(
  "/switch-status-fetch-users",
  verifyToken,
  verifyAdmin,
  switchStatusFetchUsers
);

export default router;
