import express from "express";

import { verifyToken } from "../utils/verifyUser.js";
import { verifyTeamManager } from "../utils/verifyTeamManager.js";

const router = express.Router();

export default router;
