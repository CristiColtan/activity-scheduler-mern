import { errorHandler } from "../utils/error.js";

import User from "../models/user.model.js";

import { exec } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import archiver from "archiver";
import unzipper from "unzipper";
import apm from "elastic-apm-node";
import dotenv from "dotenv";
import {
  userLogger,
  clientLogger,
  systemLogger,
  tmadminLogger,
} from "../utils/logger.js";

dotenv.config();

export const logClientEvent = async (req, res, next) => {
  const { level = "info", message } = req.body;

  const transaction = apm.startTransaction("Frontend-[log]", "frontend");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  const logPayload = {
    traceId,
    transactionId: transaction?.id,
    userID: req.user.id,
  };

  transaction?.addLabels({
    userID: req.user.id,
    endpoint: "/backend/utils/log-client-event",
    method: "POST",
  });

  switch (level) {
    case "info":
      clientLogger.info(message, logPayload);
      break;
    case "warn":
      clientLogger.warn(message, logPayload);
      break;
    case "error":
      clientLogger.error(message, logPayload);
      break;
    default:
      clientLogger.info(message, logPayload);
  }

  if (transaction) transaction.end();

  res.status(200).json("Logged frontend successfully!");
};

export const restoreFromBackup = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction(
    "Admin-[restoreFromBackup]",
    "admin"
  );
  const traceId = apm?.currentTraceIds?.["trace.id"];

  const { filename } = req.body;

  try {
    tmadminLogger.info("Restoring from backup", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      data_message: `Restoring from ${filename.toString()}`,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/utils/restore-backup",
      method: "POST",
    });

    if (!filename || !filename.endsWith(".zip")) {
      tmadminLogger.error("Backup filename missing!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(400, "Backup filename missing!"));
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const zipPath = path.join(__dirname, "..", "backups", filename);
    const extractPath = path.join(__dirname, "..", "backups", "tmp-restore");
    const dbName = "booking";
    const uri = process.env.MONGOB;

    if (!fs.existsSync(zipPath)) {
      tmadminLogger.error("Backup filename doesn't exist!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(400, "Backup filename doesn't exist!"));
    }

    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath, { recursive: true });
    }

    fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractPath }))
      .on("close", () => {
        const restoreFolder = path.join(extractPath, dbName);
        console.log("Restoring...");

        const cmd = `mongorestore --uri=${uri} --drop --nsInclude="${dbName}.*" "${restoreFolder}"`;
        console.log("Command used: ", cmd);

        exec(cmd, (err, stdout, stderr) => {
          if (err) {
            console.log(`Restore error: ${err.message}`);
            tmadminLogger.error(`Restore error: ${err.message}`, {
              traceId,
              transactionId: transaction?.id,
              userID: req.user.id,
            });
            return next(errorHandler(500, `Restore error: ${err.message}`));
          }

          console.log("Restored!");

          fs.rmSync(extractPath, { recursive: true, force: true });
          console.log("Deleted temporary restore folder!");

          const duration = Date.now() - start;
          tmadminLogger.info("Admin restored from backup successfully!", {
            traceId,
            transactionId: transaction?.id,
            userID: req.user.id,
            data_message: `Restored from ${filename.toString()}`,
            is_admin: req.user.is_admin,
            is_team_manager: req.user.is_team_manager,
            duration,
          });
          if (transaction) transaction.end();

          return res
            .status(200)
            .json("Restore process completed successfully!");
        });
      });
  } catch (error) {
    tmadminLogger.error("Error restoring from backup!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
  }
};

export const fetchBackups = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[getBackups]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    tmadminLogger.info("Fetching backups", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/utils/get-backups",
      method: "GET",
    });

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const backupDir = path.join(__dirname, "..", "backups");
    fs.readdir(backupDir, (err, files) => {
      if (err) {
        tmadminLogger.error("Cannot read backups directory!", {
          traceId,
          transactionId: transaction?.id,
          userID: req.user.id,
        });
        return next(errorHandler(500, "Cannot read backups directory!"));
      }
      const zipFiles = files.filter((file) => file.endsWith(".zip"));

      const duration = Date.now() - start;
      tmadminLogger.info("Admin fetch backups successfully!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
        is_admin: req.user.is_admin,
        is_team_manager: req.user.is_team_manager,
        duration,
      });
      if (transaction) transaction.end();

      return res.status(200).json(zipFiles);
    });
  } catch (error) {
    tmadminLogger.error("Error fetching backups!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const deleteBackup = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[deleteBackup]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  const { filename } = req.body;

  try {
    tmadminLogger.info("Deleting backup", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      data_message: `Deleting ${filename.toString()}`,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/utils/delete-backup",
      method: "DELETE",
    });

    if (!filename || !filename.endsWith(".zip")) {
      tmadminLogger.error("Backup filename missing!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(400, "Backup filename missing!"));
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const backupDir = path.join(__dirname, "..", "backups", filename);

    fs.unlink(backupDir, (err) => {
      if (err) {
        tmadminLogger.error("Error deleting backup!", {
          traceId,
          transactionId: transaction?.id,
          userID: req.user.id,
        });
        return next(errorHandler(500, "Error deleting backup!"));
      }

      const duration = Date.now() - start;
      tmadminLogger.info("Admin deleted backup successfully!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
        data_message: `Deleted ${filename.toString()}`,
        is_admin: req.user.is_admin,
        is_team_manager: req.user.is_team_manager,
        duration,
      });
      if (transaction) transaction.end();

      return res.status(200).json("Backup deleted successfully");
    });
  } catch (error) {
    tmadminLogger.error("Error deleting backup!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};
