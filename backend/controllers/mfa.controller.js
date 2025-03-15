import User from "../models/user.model.js";

import { errorHandler } from "../utils/error.js";

import speakeasy from "speakeasy";
import QRCode from "qrcode";

export const generateQR = async (req, res, next) => {
  try {
    console.log("USERID: ", req.user.id);
    console.log("PARAMS: ", req.params.id);

    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (userID !== req.params.id)
      return next(
        errorHandler(401, "You can only generate QR for your own account!")
      );

    if (currentUser.mfa_secret !== "" && currentUser.mfa_enabled === "Yes")
      return next(
        errorHandler(
          401,
          "MFA secret already enabled for this user! Please disable it first!"
        )
      );

    const secret = speakeasy.generateSecret({
      name: `CCTask(${currentUser.username})`,
    });

    await User.findByIdAndUpdate(userID, { mfa_secret: secret.base32 });
    console.log(secret);

    const updatedUser = await User.findById(userID).select("-password");

    QRCode.toDataURL(secret.otpauth_url, (err, QRData) => {
      if (err) return next(errorHandler(500, "Error generating QR code!"));

      res
        .status(200)
        .json({ qr_code: QRData, secret: secret.base32, user: updatedUser });
    });
  } catch (error) {
    next(error);
  }
};

export const firstVerifyMFA = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (userID !== req.params.id)
      return next(
        errorHandler(401, "You can only verify TOTP for your own account!")
      );

    if (!currentUser.mfa_secret || currentUser.mfa_secret === "")
      return next(errorHandler(401, "MFA secret not enabled for this user!"));

    if (currentUser.mfa_enabled === "Yes")
      return next(errorHandler(401, "MFA already enabled for this user!"));

    const verified = speakeasy.totp.verify({
      secret: currentUser.mfa_secret,
      encoding: "base32",
      token: req.body.token,
    });

    console.log("verified?:", verified);

    if (!verified)
      return next(errorHandler(401, "Invalid token! Please try again!"));

    await User.findByIdAndUpdate(userID, { mfa_enabled: "Yes" });

    const updatedUser = await User.findById(userID).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const verifyMFA = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (userID !== req.params.id)
      return next(
        errorHandler(401, "You can only verify TOTP for your own account!")
      );

    if (
      !currentUser.mfa_secret ||
      currentUser.mfa_secret === "" ||
      currentUser.mfa_enabled === "No" ||
      !currentUser.mfa_enabled
    )
      return next(errorHandler(401, "MFA not enabled for this user!"));

    const verified = speakeasy.totp.verify({
      secret: currentUser.mfa_secret,
      encoding: "base32",
      token: req.body.token,
    });

    if (!verified)
      return next(errorHandler(401, "Invalid token! Please try again!"));

    res.status(200).json("MFA verified successfully!");
  } catch (error) {
    next(error);
  }
};

export const disableMFA = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (userID !== req.params.id)
      return next(
        errorHandler(401, "You can only disable 2FA for your own account!")
      );

    if (
      !currentUser.mfa_secret ||
      currentUser.mfa_secret === "" ||
      currentUser.mfa_enabled === "No" ||
      !currentUser.mfa_enabled
    )
      return next(errorHandler(401, "MFA not enabled for this user!"));

    const verified = speakeasy.totp.verify({
      secret: currentUser.mfa_secret,
      encoding: "base32",
      token: req.body.token,
    });

    if (!verified)
      return next(errorHandler(401, "Invalid token! Please try again!"));

    const updatedUser = await User.findByIdAndUpdate(
      userID,
      {
        mfa_secret: "",
        mfa_enabled: "No",
      },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};
