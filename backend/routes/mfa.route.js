import express from "express";

import {
  generateQR,
  verifyMFA,
  firstVerifyMFA,
  disableMFA,
} from "../controllers/mfa.controller.js";

import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/generate-qr/:id", verifyToken, generateQR);
router.post("/first-verify-totp/:id", verifyToken, firstVerifyMFA);
router.post("/verify-totp/:id", verifyToken, verifyMFA);
router.post("/disable-totp/:id", verifyToken, disableMFA);

export default router;
