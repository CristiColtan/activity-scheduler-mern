import { errorHandler } from "../utils/error.js";

import User from "../models/user.model.js";

import apm from "elastic-apm-node";
import { userLogger, clientLogger, systemLogger } from "../utils/logger.js";

export const logClientEvent = async (req, res, next) => {
  const { level = "info", message } = req.body;

  const transaction = apm.startTransaction("Frontend-[log]", "frontend");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  const logPayload = {
    traceId,
    transactionId: transaction?.id,
    userID: req.user.id,
  };

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
