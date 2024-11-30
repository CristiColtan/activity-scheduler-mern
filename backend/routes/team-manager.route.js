import express from "express";

import { verifyToken } from "../utils/verifyUser.js";
import { verifyTeamManager } from "../utils/verifyTeamManager.js";
import {
  getNormalUsers,
  getMyTeam,
  addToTeam,
  removeFromTeam,
  editTeamMember,
  fetchAllTrashedTasks,
  fetchDashboardStatistics,
  fetchTeamMemberReport1,
  fetchTeamMemberReport2,
} from "../controllers/team-manager.controller.js";

const router = express.Router();

router.get("/get/normal-users", verifyToken, verifyTeamManager, getNormalUsers);
router.get("/get/my-team", verifyToken, verifyTeamManager, getMyTeam);
router.get(
  "/get/all-trashed-tasks",
  verifyToken,
  verifyTeamManager,
  fetchAllTrashedTasks
);
router.get(
  "/get/dashboard-statistics",
  verifyToken,
  verifyTeamManager,
  fetchDashboardStatistics
);

router.post("/add/team-member", verifyToken, verifyTeamManager, addToTeam);

router.delete(
  "/remove/team-member/:memberID",
  verifyToken,
  verifyTeamManager,
  removeFromTeam
);

router.put(
  "/edit/team-member/:memberID",
  verifyToken,
  verifyTeamManager,
  editTeamMember
);
router.put(
  "/get/report-1/:id",
  verifyToken,
  verifyTeamManager,
  fetchTeamMemberReport1
);
router.put(
  "/get/report-2/:id",
  verifyToken,
  verifyTeamManager,
  fetchTeamMemberReport2
);

export default router;
