import express from "express";

import { verifyToken } from "../utils/verifyUser.js";

import { logClientEvent } from "../controllers/utils.controller.js";

const router = express.Router();

router.post("/log-client-event", verifyToken, logClientEvent);

export default router;
