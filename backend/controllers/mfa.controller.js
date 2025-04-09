import User from "../models/user.model.js";

import { errorHandler } from "../utils/error.js";

import speakeasy from "speakeasy";
import QRCode from "qrcode";

import apm from "elastic-apm-node";
import { userLogger, authLogger } from "../utils/logger.js";

export const generateQR = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("User-[GenerateQR]", "users");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const userID = req.user.id;

    userLogger.info("Generating QR", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/mfa/generate-qr/:id",
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

    if (userID !== req.params.id) {
      userLogger.error("Tried to generate QR for another account!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(
        errorHandler(401, "You can only generate QR for your own account!")
      );
    }

    if (currentUser.mfa_secret !== "" && currentUser.mfa_enabled === "Yes") {
      userLogger.error("MFA already enabled!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(
        errorHandler(
          401,
          "MFA secret already enabled for this user! Please disable it first!"
        )
      );
    }

    const secret = speakeasy.generateSecret({
      name: `CCTask(${currentUser.username})`,
    });

    await User.findByIdAndUpdate(userID, { mfa_secret: secret.base32 });
    console.log(secret);

    const updatedUser = await User.findById(userID).select("-password");

    QRCode.toDataURL(secret.otpauth_url, (err, QRData) => {
      if (err) {
        userLogger.error("Error generating QR code!", {
          traceId,
          transactionId: transaction?.id,
          userID,
        });
        return next(errorHandler(500, "Error generating QR code!"));
      }

      const duration = Date.now() - start;
      userLogger.info("User generated QR code successfully!", {
        traceId,
        transactionId: transaction?.id,
        userID,
        duration,
      });
      if (transaction) transaction.end();

      res
        .status(200)
        .json({ qr_code: QRData, secret: secret.base32, user: updatedUser });
    });
  } catch (error) {
    userLogger.error("Error generating QR code!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const firstVerifyMFA = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("User-[FirstVerifyMFA]", "users");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const userID = req.user.id;

    userLogger.info("First time verifying MFA", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/mfa/first-verify-totp/:id",
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

    if (userID !== req.params.id) {
      userLogger.error("Tried to verify TOTP for another account!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(
        errorHandler(401, "You can only verify TOTP for your own account!")
      );
    }

    if (!currentUser.mfa_secret || currentUser.mfa_secret === "") {
      userLogger.error("Secret not enabled!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(401, "MFA secret not enabled for this user!"));
    }

    if (currentUser.mfa_enabled === "Yes") {
      userLogger.error("MFA already enabled!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(401, "MFA already enabled for this user!"));
    }

    const verified = speakeasy.totp.verify({
      secret: currentUser.mfa_secret,
      encoding: "base32",
      token: req.body.token,
    });

    console.log("verified?:", verified);

    if (!verified) {
      userLogger.error("Invalid token! Please try again!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(401, "Invalid token! Please try again!"));
    }

    await User.findByIdAndUpdate(userID, { mfa_enabled: "Yes" });

    const updatedUser = await User.findById(userID).select("-password");

    const duration = Date.now() - start;
    userLogger.info("User verified first time MFA successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(updatedUser);
  } catch (error) {
    userLogger.error("Error verifying first time MFA!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const verifyMFA = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("User-[VerifyTOTP]", "users");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const userID = req.user.id;

    userLogger.info("Verifying TOTP", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/mfa/verify-totp/:id",
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

    if (userID !== req.params.id) {
      userLogger.error("Tried to verify TOTP for another account!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(
        errorHandler(401, "You can only verify TOTP for your own account!")
      );
    }

    if (
      !currentUser.mfa_secret ||
      currentUser.mfa_secret === "" ||
      currentUser.mfa_enabled === "No" ||
      !currentUser.mfa_enabled
    ) {
      userLogger.error("MFA not enabled!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(401, "MFA not enabled for this user!"));
    }

    const verified = speakeasy.totp.verify({
      secret: currentUser.mfa_secret,
      encoding: "base32",
      token: req.body.token,
    });

    if (!verified) {
      userLogger.error("Invalid token! Please try again!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(401, "Invalid token! Please try again!"));
    }

    const duration = Date.now() - start;
    userLogger.info("User verified TOTP successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json("MFA verified successfully!");
  } catch (error) {
    userLogger.error("Error verifying TOTP!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const disableMFA = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("User-[DisableMFA]", "users");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const userID = req.user.id;

    userLogger.info("Disabling MFA", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/mfa/disable-totp/:id",
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

    if (userID !== req.params.id) {
      userLogger.error("Tried to disable MFA for another account!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(
        errorHandler(401, "You can only disable 2FA for your own account!")
      );
    }

    if (
      !currentUser.mfa_secret ||
      currentUser.mfa_secret === "" ||
      currentUser.mfa_enabled === "No" ||
      !currentUser.mfa_enabled
    ) {
      userLogger.error("MFA not enabled!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(401, "MFA not enabled for this user!"));
    }

    const verified = speakeasy.totp.verify({
      secret: currentUser.mfa_secret,
      encoding: "base32",
      token: req.body.token,
    });

    if (!verified) {
      userLogger.error("Invalid token! Please try again!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(401, "Invalid token! Please try again!"));
    }

    const updatedUser = await User.findByIdAndUpdate(
      userID,
      {
        mfa_secret: "",
        mfa_enabled: "No",
      },
      { new: true }
    ).select("-password");

    const duration = Date.now() - start;
    userLogger.info("User disabled MFA successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(updatedUser);
  } catch (error) {
    userLogger.error("Error disabling MFA!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};
