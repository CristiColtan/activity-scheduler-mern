import express from "express";

import { verifyToken } from "../utils/verifyUser.js";
import { verifyAdminOrTeamManager } from "../utils/verifyAdminOrTeamManager.js";

import {
  createTask,
  getTask,
  addActivity,
  fetchAllTasks,
  addSubTask,
  trashTask,
} from "../controllers/task.controller.js";

const router = express.Router();

router.post("/create", verifyToken, verifyAdminOrTeamManager, createTask);
router.get("/get/:id", verifyToken, getTask);
router.put("/add-activity/:id", verifyToken, addActivity);
router.get("/get-all-tasks", verifyToken, fetchAllTasks);
router.put(
  "/add-subtask/:id",
  verifyToken,
  verifyAdminOrTeamManager,
  addSubTask
);
router.put("/trash-task/:id", verifyToken, verifyAdminOrTeamManager, trashTask);

export default router;
