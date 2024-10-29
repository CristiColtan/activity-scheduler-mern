import express from "express";

import {
  signup,
  signin,
  signout,
  signgoogle,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/signout", signout);

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signgoogle", signgoogle);

export default router;
