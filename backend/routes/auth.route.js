import express from "express";

import {
  signup,
  signin,
  signinTOTP,
  signout,
  signgoogle,
  resetpass,
} from "../controllers/auth.controller.js";

import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/signout", signout);

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signin-totp", signinTOTP);
router.post("/signgoogle", signgoogle);
router.post("/reset-password/:id", verifyToken, resetpass);

export default router;
