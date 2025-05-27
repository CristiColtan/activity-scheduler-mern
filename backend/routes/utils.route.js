import express from "express";

import { verifyToken } from "../utils/verifyUser.js";
import { verifyAdmin } from "../utils/verifyAdmin.js";

import {
  chatWithAi,
  deleteBackup,
  fetchBackups,
  fetchChatHistory,
  logClientEvent,
  restoreFromBackup,
} from "../controllers/utils.controller.js";

const router = express.Router();

router.get("/get-backups", verifyToken, verifyAdmin, fetchBackups);
router.get("/get-chat-history/:tid/:uid", verifyToken, fetchChatHistory);

router.post("/log-client-event", verifyToken, logClientEvent);
router.post("/restore-backup", verifyToken, verifyAdmin, restoreFromBackup);
router.post("/chat", verifyToken, chatWithAi);

router.delete("/delete-backup", verifyToken, verifyAdmin, deleteBackup);

export default router;
