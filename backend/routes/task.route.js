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
  duplicateTask,
  updateTask,
  getTaskEdit,
  editUserRole,
  fetchUserRoles,
} from "../controllers/task.controller.js";

const router = express.Router();

router.post("/create", verifyToken, verifyAdminOrTeamManager, createTask);

router.get("/get/:id", verifyToken, getTask);
router.get("/get-all-tasks", verifyToken, fetchAllTasks);
router.get("/get-all-completed-tasks", verifyToken, fetchAllCompletedTasks);
router.get("/get-all-in-progress-tasks", verifyToken, fetchAllInProgressTasks);
router.get("/get-all-to-do-tasks", verifyToken, fetchAllToDoTasks);
router.get(
  "/get-task-edit/:id",
  verifyToken,
  verifyAdminOrTeamManager,
  getTaskEdit
);
router.get(
  "/get-user-roles",
  verifyToken,
  verifyAdminOrTeamManager,
  fetchUserRoles
);

router.post(
  "/duplicate-task/:id",
  verifyToken,
  verifyAdminOrTeamManager,
  duplicateTask
);

router.put(
  "/edit-user-role-on-task",
  verifyToken,
  verifyAdminOrTeamManager,
  editUserRole
);
router.put("/add-activity/:id", verifyToken, addActivity);
router.put("/update/:id", verifyToken, verifyAdminOrTeamManager, updateTask);
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
