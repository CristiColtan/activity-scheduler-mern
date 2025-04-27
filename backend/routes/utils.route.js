import express from "express";

import { verifyToken } from "../utils/verifyUser.js";
import { verifyAdmin } from "../utils/verifyAdmin.js";

import {
  deleteBackup,
  fetchBackups,
  logClientEvent,
  restoreFromBackup,
} from "../controllers/utils.controller.js";

const router = express.Router();

router.get("/get-backups", verifyToken, verifyAdmin, fetchBackups);

router.post("/log-client-event", verifyToken, logClientEvent);
router.post("/restore-backup", verifyToken, verifyAdmin, restoreFromBackup);

router.delete("/delete-backup", verifyToken, verifyAdmin, deleteBackup);

export default router;
