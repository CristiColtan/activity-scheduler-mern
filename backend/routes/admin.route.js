import express from "express";

import { getTeamManagers } from "../controllers/admin.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
import { verifyAdmin } from "../utils/verifyAdmin.js";

const router = express.Router();

router.get("/get/team-managers", verifyToken, verifyAdmin, getTeamManagers);

export default router;
