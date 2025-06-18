import { errorHandler } from "../utils/error.js";

import User from "../models/user.model.js";
import AssistantChat from "../models/assistant-chat.model.js";
import Task from "../models/task.model.js";

import { OpenAI } from "openai";
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

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const fetchChatHistory = async (req, res, next) => {
  const { tid, uid } = req.params;
  const userID = req.user.id;

  const start = Date.now();
  const transaction = apm.startTransaction("User-[fetchChatHistory]", "users");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    userLogger.info("Fetching chat history", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/utils/get-chat-history/:tid/:uid",
      method: "POST",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      userLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    if (userID !== req.params.uid) {
      userLogger.error("Tried to fetch chat history for another account!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(
        errorHandler(401, "You can only fetch your own chat history!")
      );
    }

    const chat = await AssistantChat.findOne({ taskId: tid, userId: uid });

    if (!chat) {
      console.log("Couldn't find any history!");
      return res.json({ messages: [] });
    }

    const duration = Date.now() - start;
    userLogger.info("User fetch chat history successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      duration,
    });
    if (transaction) transaction.end();

    res.json({ messages: chat.messages });
  } catch (error) {
    console.error("History fetch error:", error);
    userLogger.error("Error fetching chat history!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const chatWithAi = async (req, res, next) => {
  const { taskId, userId, messages } = req.body;
  const userID = req.user.id;

  const start = Date.now();
  const transaction = apm.startTransaction("User-[talkWithAI]", "users");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    userLogger.info("Chatting with AI", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/utils/chat",
      method: "POST",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      userLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    const currentTask = await Task.findById(taskId);
    if (!currentTask) {
      userLogger.error("Task not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
        taskID: taskId,
      });
      return next(errorHandler(404, "Task not found!"));
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content:
            "Ești un asistent AI care oferă ajutor legat de managementul sarcinilor. Oferă sugestii, clarificări și recomandări utile.",
        },
        ...messages,
      ],
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content;

    //save conv
    let chat = await AssistantChat.findOne({ taskId, userId });
    if (!chat) {
      chat = new AssistantChat({ taskId, userId, messages: [] });
    }
    chat.messages.push({ role: "user", content: messages.at(-1).content });
    chat.messages.push({ role: "assistant", content: reply });
    await chat.save();

    const duration = Date.now() - start;
    userLogger.info("Chat with AI successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      duration,
    });
    if (transaction) transaction.end();

    res.json({ reply });
  } catch (error) {
    console.error("OpenAI ERROR:", error);
    userLogger.error("Error chatting with AI!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

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
