import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import AuthRouter from "./routes/auth.route.js";
import AdminRouter from "./routes/admin.route.js";
import TeamManagerRouter from "./routes/team-manager.route.js";
import TaskRouter from "./routes/task.route.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    console.log(err);
  });

const corsOptions = {
  origin: true,
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.listen(8081, () => {
  console.log("Listening on port 8081...");
});

app.use("/backend/auth", AuthRouter);
app.use("/backend/admin", AdminRouter);
app.use("/backend/team-manager", TeamManagerRouter);
app.use("/backend/task", TaskRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
