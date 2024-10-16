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
} from "../controllers/admin.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
import { verifyAdmin } from "../utils/verifyAdmin.js";

const router = express.Router();

router.get("/get/team-managers", verifyToken, verifyAdmin, getTeamManagers);
router.get("/get/normal-users", verifyToken, verifyAdmin, getNormalUsers);
router.get("/get/all-users", verifyToken, verifyAdmin, getAllUsers);
router.get(
  "/get/all-trashed-tasks",
  verifyToken,
  verifyAdmin,
  fetchAllTrashedTasks
);
router.post("/add/team-manager", verifyToken, verifyAdmin, addTeamManager);
router.post(
  "/remove/team-manager",
  verifyToken,
  verifyAdmin,
  removeTeamManager
);
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
export default router;
