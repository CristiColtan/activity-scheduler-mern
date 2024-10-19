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
  deleteTask,
  restoreTask,
  deleteAllTasks,
  restoreAllTasks,
  fetchAllCompletedTasks,
  fetchAllInProgressTasks,
  fetchAllToDoTasks,
} from "../controllers/task.controller.js";

const router = express.Router();

router.post("/create", verifyToken, verifyAdminOrTeamManager, createTask);
router.get("/get/:id", verifyToken, getTask);
router.put("/add-activity/:id", verifyToken, addActivity);
router.get("/get-all-tasks", verifyToken, fetchAllTasks);
router.get("/get-all-completed-tasks", verifyToken, fetchAllCompletedTasks);
router.get("/get-all-in-progress-tasks", verifyToken, fetchAllInProgressTasks);
router.get("/get-all-to-do-tasks", verifyToken, fetchAllToDoTasks);
router.put(
  "/add-subtask/:id",
  verifyToken,
  verifyAdminOrTeamManager,
  addSubTask
);
router.put("/trash-task/:id", verifyToken, verifyAdminOrTeamManager, trashTask);
router.put(
  "/restore-task/:id",
  verifyToken,
  verifyAdminOrTeamManager,
  restoreTask
);
router.put(
  "/restore-all-tasks",
  verifyToken,
  verifyAdminOrTeamManager,
  restoreAllTasks
);
router.delete(
  "/delete-task/:id",
  verifyToken,
  verifyAdminOrTeamManager,
  deleteTask
);
router.delete(
  "/delete-all-tasks",
  verifyToken,
  verifyAdminOrTeamManager,
  deleteAllTasks
);

export default router;
