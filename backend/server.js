import dotenv from "dotenv";
dotenv.config();

import apm from "elastic-apm-node";

apm.start({
  serviceName: process.env.ELASTIC_APM_SERVICE_NAME,
  serverUrl: process.env.ELASTIC_APM_SERVER_URL,
  secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
  environment: "my-environment",
  frameworkName: "express",
  frameworkVersion: "4.21.0",
  transactionSampleRate: 1.0,
});

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import AuthRouter from "./routes/auth.route.js";
import AdminRouter from "./routes/admin.route.js";
import TeamManagerRouter from "./routes/team-manager.route.js";
import TaskRouter from "./routes/task.route.js";
import NormalUserRouter from "./routes/normal-user.route.js";
import NotificationRouter from "./routes/notification.route.js";
import MFARouter from "./routes/mfa.route.js";
import UtilsRouter from "./routes/utils.route.js";

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

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log("Listening on port 8081...");
});

app.use("/backend/auth", AuthRouter);
app.use("/backend/admin", AdminRouter);
app.use("/backend/team-manager", TeamManagerRouter);
app.use("/backend/task", TaskRouter);
app.use("/backend/normal-user", NormalUserRouter);
app.use("/backend/notif", NotificationRouter);
app.use("/backend/mfa", MFARouter);
app.use("/backend/utils", UtilsRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
