import express from "express";

import {
  signup,
  signin,
  signinTOTP,
  signout,
  signgoogle,
  signingoogleTOTP,
  resetpass,
  refresh,
} from "../controllers/auth.controller.js";

import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/signout/:id", signout);

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signin-totp", signinTOTP);
router.post("/signgoogle", signgoogle);
router.post("/signingoogle-totp", signingoogleTOTP);
router.post("/reset-password/:id", verifyToken, resetpass);
router.post("/refresh-token", refresh);

export default router;
