import User from "../models/user.model.js";

import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";

import { errorHandler } from "../utils/error.js";

import apm from "elastic-apm-node";
import { userLogger, authLogger } from "../utils/logger.js";

export const signup = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Auth-[Signup]", "auth");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  const { username, email, password, first_name, last_name } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    first_name,
    last_name,
  });

  authLogger.info("Signing up", {
    traceId,
    transactionId: transaction?.id,
    username,
    email,
    first_name,
    last_name,
  });

  transaction?.addLabels({
    userID: username.toString(),
    endpoint: "/backend/auth/signup",
    method: "POST",
  });

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    authLogger.error("User already exists! (email)", {
      traceId,
      transactionId: transaction?.id,
      username,
      email,
    });
    return next(errorHandler(400, "User already exists! (email)"));
  }

  const existingUser2 = await User.findOne({ username });
  if (existingUser2) {
    authLogger.error("User already exists! (username)", {
      traceId,
      transactionId: transaction?.id,
      username,
      email,
    });
    return next(errorHandler(400, "User already exists! (username)"));
  }

  try {
    await newUser.save();

    const duration = Date.now() - start;
    authLogger.info("Signed up successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: newUser._id.toString(),
      username,
      email,
      first_name,
      last_name,
      duration,
    });
    if (transaction) transaction.end();

    res.status(201).json("User created successfully!");
  } catch (error) {
    authLogger.error("Error signing up!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Auth-[Signin]", "auth");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  const { username, password } = req.body;

  try {
    authLogger.info("Signing in", {
      traceId,
      transactionId: transaction?.id,
      username,
    });

    transaction?.addLabels({
      userID: username.toString(),
      endpoint: "/backend/auth/signin",
      method: "POST",
    });

    const validUser = await User.findOne({ username });
    if (!validUser) {
      authLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        username,
      });
      return next(errorHandler(400, "User not found!"));
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      authLogger.error("Wrong credentials!", {
        traceId,
        transactionId: transaction?.id,
        username,
        userID: validUser._id.toString(),
      });
      return next(errorHandler(401, "Wrong credentials!"));
    }

    if (validUser.is_active === "No") {
      authLogger.error("Account deactivated!", {
        traceId,
        transactionId: transaction?.id,
        username,
        userID: validUser._id.toString(),
      });
      return next(errorHandler(401, "Your account has been deactivated!"));
    }

    if (validUser.mfa_enabled === "Yes") {
      authLogger.info("Requesting TOTP!", {
        traceId,
        transactionId: transaction?.id,
        username,
        userID: validUser._id.toString(),
      });
      return res.status(200).json({
        mfa_required: true,
        message: "Two-factor authentication code required!",
      });
    }

    const access_token = jwt.sign(
      {
        id: validUser._id,
        is_admin: validUser.is_admin,
        is_team_manager: validUser.is_team_manager,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    const refresh_token = jwt.sign(
      {
        id: validUser._id,
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );

    validUser.refresh_token = refresh_token;
    await validUser.save();

    const { password: pass, ...rest } = validUser._doc; //ascundem parola din json

    const duration = Date.now() - start;
    authLogger.info("Signed in successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: validUser._id.toString(),
      username: validUser.username,
      email: validUser.email,
      first_name: validUser.first_name,
      last_name: validUser.last_name,
      duration,
    });
    if (transaction) transaction.end();

    res
      .cookie("access_token", access_token, {
        httpOnly: true,
        domain: "localhost",
        path: "/",
      })
      .cookie("refresh_token", refresh_token, {
        httpOnly: true,
        domain: "localhost",
        path: "/",
      })
      .status(200)
      .json(rest);
  } catch (error) {
    authLogger.error("Error signing in!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const signinTOTP = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Auth-[SigninTOTP]", "auth");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  const { username, code } = req.body;
  console.log("TOTP:", username, code);

  try {
    authLogger.info("TOTP requested!", {
      traceId,
      transactionId: transaction?.id,
      username,
      code,
    });

    transaction?.addLabels({
      userID: username.toString(),
      endpoint: "/backend/auth/signin-totp",
      method: "POST",
    });

    const validUser = await User.findOne({ username });
    if (!validUser) {
      authLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        username,
      });
      return next(errorHandler(400, "User not found!"));
    }

    if (!code) {
      authLogger.error("2FA code missing!", {
        traceId,
        transactionId: transaction?.id,
        username,
        userID: validUser._id.toString(),
      });
      return next(
        errorHandler(401, "Two-factor authentication code required!")
      );
    }

    if (validUser.mfa_enabled !== "Yes") {
      authLogger.error("2FA not enabled!", {
        traceId,
        transactionId: transaction?.id,
        username,
        userID: validUser._id.toString(),
      });
      return next(errorHandler(400, "Two-factor authentication not enabled!"));
    }
    const now = Date.now();
    if (validUser.totp_cooldown && now < validUser.totp_cooldown) {
      authLogger.error(
        `Too many failed attempts! Try again in
        ${Math.ceil((validUser.totp_cooldown - now) / 1000)} seconds.`,
        {
          traceId,
          transactionId: transaction?.id,
          username,
          userID: validUser._id.toString(),
        }
      );
      return next(
        errorHandler(
          429,
          `Too many failed attempts! Try again in
        ${Math.ceil((validUser.totp_cooldown - now) / 1000)} seconds.`
        )
      );
    }

    const verified = speakeasy.totp.verify({
      secret: validUser.mfa_secret,
      encoding: "base32",
      token: code,
    });

    if (!verified) {
      validUser.totp_attempts = (validUser.totp_attempts || 0) + 1;

      if (validUser.totp_attempts >= 3) {
        validUser.totp_cooldown = now + 30 * 1000;
        validUser.totp_attempts = 0;
      }

      await validUser.save();

      authLogger.error("Invalid token! Please try again!", {
        traceId,
        transactionId: transaction?.id,
        username,
        userID: validUser._id.toString(),
      });
      return next(errorHandler(401, "Invalid token! Please try again!"));
    }

    validUser.totp_attempts = 0;
    validUser.totp_cooldown = null;
    await validUser.save();

    const access_token = jwt.sign(
      {
        id: validUser._id,
        is_admin: validUser.is_admin,
        is_team_manager: validUser.is_team_manager,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    const refresh_token = jwt.sign(
      {
        id: validUser._id,
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );

    validUser.refresh_token = refresh_token;
    await validUser.save();

    const { password: pass, ...rest } = validUser._doc; //ascundem parola din json

    const duration = Date.now() - start;
    authLogger.info("Signed in successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: validUser._id.toString(),
      username: validUser.username,
      email: validUser.email,
      first_name: validUser.first_name,
      last_name: validUser.last_name,
      duration,
      code,
    });
    if (transaction) transaction.end();

    res
      .cookie("access_token", access_token, {
        httpOnly: true,
        domain: "localhost",
        path: "/",
      })
      .cookie("refresh_token", refresh_token, {
        httpOnly: true,
        domain: "localhost",
        path: "/",
      })
      .status(200)
      .json(rest);
  } catch (error) {
    authLogger.error("Error signing in!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const signout = async (req, res, next) => {
  console.log("SIGN OUT:", req.params);

  const start = Date.now();
  const transaction = apm.startTransaction("Auth-[Signout]", "auth");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    authLogger.info("Signing out", {
      transactionId: transaction?.id,
      traceId,
      userID: req.params.id || "unknown",
    });

    transaction?.addLabels({
      userID: req.params.id || "unknown",
      endpoint: "/backend/auth/signout/:id",
      method: "GET",
    });

    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    const duration = Date.now() - start;
    authLogger.info("Signed out successfully!", {
      transactionId: transaction?.id,
      traceId,
      userID: req.params.id || "unknown",
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json("User has logged out!");
  } catch (error) {
    authLogger.error("Error signing out!", {
      transactionId: transaction?.id,
      traceId,
      error: error.message,
    });
    if (transaction) transaction.end();

    next(error);
  }
};

export const signingoogleTOTP = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Auth-[SigninGoogleTOTP]", "auth");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  const { email, code } = req.body;
  console.log("GOOGLE TOTP:", email, code);

  try {
    authLogger.info("TOTP requested!", {
      traceId,
      transactionId: transaction?.id,
      email,
      code,
    });

    transaction?.addLabels({
      userID: email.toString(),
      endpoint: "/backend/auth/signingoogle-totp",
      method: "POST",
    });

    const validUser = await User.findOne({ email });

    if (!validUser) {
      authLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        email,
      });
      return next(errorHandler(400, "User not found!"));
    }

    if (!code) {
      authLogger.error("2FA code missing!", {
        traceId,
        transactionId: transaction?.id,
        email,
        username: validUser.username,
        userID: validUser._id.toString(),
      });
      return next(
        errorHandler(401, "Two-factor authentication code required!")
      );
    }

    if (validUser.mfa_enabled !== "Yes") {
      authLogger.error("2FA not enabled!", {
        traceId,
        transactionId: transaction?.id,
        email,
        username: validUser.username,
        userID: validUser._id.toString(),
      });
      return next(errorHandler(400, "Two-factor authentication not enabled!"));
    }

    const now = Date.now();
    if (validUser.totp_cooldown && now < validUser.totp_cooldown) {
      authLogger.error(
        `Too many failed attempts! Try again in
        ${Math.ceil((validUser.totp_cooldown - now) / 1000)} seconds.`,
        {
          traceId,
          transactionId: transaction?.id,
          email,
          username: validUser.username,
          userID: validUser._id.toString(),
        }
      );
      return next(
        errorHandler(
          429,
          `Too many failed attempts! Try again in
        ${Math.ceil((validUser.totp_cooldown - now) / 1000)} seconds.`
        )
      );
    }

    const verified = speakeasy.totp.verify({
      secret: validUser.mfa_secret,
      encoding: "base32",
      token: code,
    });

    if (!verified) {
      validUser.totp_attempts = (validUser.totp_attempts || 0) + 1;

      if (validUser.totp_attempts >= 3) {
        validUser.totp_cooldown = now + 30 * 1000;
        validUser.totp_attempts = 0;
      }

      await validUser.save();

      authLogger.error("Invalid token! Please try again!", {
        traceId,
        transactionId: transaction?.id,
        email,
        username: validUser.username,
        userID: validUser._id.toString(),
      });

      return next(errorHandler(401, "Invalid token! Please try again!"));
    }

    validUser.totp_attempts = 0;
    validUser.totp_cooldown = null;
    await validUser.save();

    const access_token = jwt.sign(
      {
        id: validUser._id,
        is_admin: validUser.is_admin,
        is_team_manager: validUser.is_team_manager,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    const refresh_token = jwt.sign(
      {
        id: validUser._id,
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );

    validUser.refresh_token = refresh_token;
    await validUser.save();

    const { password: pass, ...rest } = validUser._doc; //ascundem parola din json

    const duration = Date.now() - start;
    authLogger.info("Signed in successfully! (OAuth)", {
      traceId,
      transactionId: transaction?.id,
      userID: validUser._id.toString(),
      username: validUser.username,
      email: validUser.email,
      first_name: validUser.first_name,
      last_name: validUser.last_name,
      duration,
      code,
    });
    if (transaction) transaction.end();

    res
      .cookie("access_token", access_token, {
        httpOnly: true,
        domain: "localhost",
        path: "/",
      })
      .cookie("refresh_token", refresh_token, {
        httpOnly: true,
        domain: "localhost",
        path: "/",
      })
      .status(200)
      .json(rest);
  } catch (error) {
    authLogger.error("Error signing in! (OAuth)", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const signgoogle = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Auth-[SigninGoogle]", "auth");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    authLogger.info("Signing in (OAuth)", {
      traceId,
      transactionId: transaction?.id,
      email: req.body.email,
    });

    transaction?.addLabels({
      userID: req.body.email.toString(),
      endpoint: "/backend/auth/signgoogle",
      method: "POST",
    });

    const user = await User.findOne({ email: req.body.email });

    if (user) {
      if (user.is_active === "No") {
        authLogger.error("Account deactivated!", {
          traceId,
          transactionId: transaction?.id,
          email: req.body.email,
          username: user.username,
          userID: validUser._id.toString(),
        });
        return next(errorHandler(401, "Your account has been deactivated!"));
      }

      if (user.mfa_enabled === "Yes") {
        return res.status(200).json({
          mfa_required: true,
          message: "Two-factor authentication code required!",
        });
      }

      const access_token = jwt.sign(
        {
          id: user._id,
          is_admin: user.is_admin,
          is_team_manager: user.is_team_manager,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "15m",
        }
      );

      const refresh_token = jwt.sign(
        {
          id: user._id,
        },
        process.env.JWT_REFRESH_SECRET,
        {
          expiresIn: "7d",
        }
      );

      user.refresh_token = refresh_token;
      await user.save();

      const { password: pass, ...rest } = user._doc; //ascundem parola din json

      const duration = Date.now() - start;
      authLogger.info("Signed in successfully! (OAuth)", {
        traceId,
        transactionId: transaction?.id,
        userID: user._id.toString(),
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        duration,
      });
      if (transaction) transaction.end();

      res
        .cookie("access_token", access_token, {
          httpOnly: true,
          domain: "localhost",
          path: "/",
        })
        .cookie("refresh_token", refresh_token, {
          httpOnly: true,
          domain: "localhost",
          path: "/",
        })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);

      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          req.body.name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-8),
        email: req.body.email,
        password: hashedPassword,
        first_name: req.body.name,
        last_name: req.body.name,
      });

      await newUser.save();
      const access_token = jwt.sign(
        {
          id: newUser._id,
          is_admin: newUser.is_admin,
          is_team_manager: newUser.is_team_manager,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "15m",
        }
      );

      const refresh_token = jwt.sign(
        {
          id: newUser._id,
        },
        process.env.JWT_REFRESH_SECRET,
        {
          expiresIn: "7d",
        }
      );

      newUser.refresh_token = refresh_token;
      await newUser.save();

      const { password: pass, ...rest } = newUser._doc;

      const duration = Date.now() - start;
      authLogger.info("Signed in successfully! (OAuth)", {
        traceId,
        transactionId: transaction?.id,
        userID: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        duration,
      });
      if (transaction) transaction.end();

      res
        .cookie("access_token", access_token, {
          httpOnly: true,
          domain: "localhost",
          path: "/",
        })
        .cookie("refresh_token", refresh_token, {
          httpOnly: true,
          domain: "localhost",
          path: "/",
        })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    authLogger.error("Error signing in! (OAuth)", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const resetpass = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction("User-[ResetPassword]", "users");
    const traceId = apm?.currentTraceIds?.["trace.id"];

    const userID = req.user.id;

    userLogger.info("Resetting password", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/auth/reset-password/:id",
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
      userLogger.error("You can only reset your own account password!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(
        errorHandler(401, "You can only reset your own account password!")
      );
    }

    console.log("BODY:", req.body);
    const { oldPassword, newPassword, confirmPassword } = req.body;
    console.log(oldPassword, newPassword, confirmPassword);

    if (currentUser.mfa_enabled === "Yes") {
      const { token } = req.body;
      console.log("Token:", token);

      if (!token) {
        userLogger.error("2FA code missing!", {
          traceId,
          transactionId: transaction?.id,
          userID,
        });
        return next(
          errorHandler(401, "Two-factor authentication code required!")
        );
      }

      const verified = speakeasy.totp.verify({
        secret: currentUser.mfa_secret,
        encoding: "base32",
        token: token,
      });

      if (!verified) {
        userLogger.error("Invalid token! Please try again!", {
          traceId,
          transactionId: transaction?.id,
          userID,
          data: token,
        });
        return next(errorHandler(401, "Invalid token! Please try again!"));
      }
    }

    const validPassword = bcryptjs.compareSync(
      oldPassword,
      currentUser.password
    );
    if (!validPassword) {
      userLogger.error("Wrong old password!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(401, "Your old password is wrong!"));
    }

    const isSamePassword = bcryptjs.compareSync(
      newPassword,
      currentUser.password
    );
    if (isSamePassword) {
      userLogger.error("New password must be different!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(400, "New password must be different!"));
    }

    const newHashedPassword = bcryptjs.hashSync(newPassword, 10);
    await User.findByIdAndUpdate(userID, { password: newHashedPassword });

    const duration = Date.now() - start;
    userLogger.info("User reset his password successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json("Password updated successfully!");
  } catch (error) {
    userLogger.error("Error resetting password!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Auth-[Refresh]", "auth");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  const refresh_token = req.cookies.refresh_token;

  authLogger.info(`Refreshing access token for ${req.ip}`, {
    traceId,
    transactionId: transaction?.id,
  });

  if (!refresh_token) {
    authLogger.error(`Refresh Token missing for ${req.ip}!`, {
      traceId,
      transactionId: transaction?.id,
    });
    return next(
      errorHandler(403, "Refresh Token missing! Please log in again!")
    );
  }

  try {
    jwt.verify(
      refresh_token,
      process.env.JWT_REFRESH_SECRET,
      async (err, user) => {
        if (err) {
          authLogger.error(`Refresh Token expired for ${req.ip}!`, {
            traceId,
            transactionId: transaction?.id,
          });
          return next(
            errorHandler(403, "Refresh Token expired! Please log in again!")
          );
        }

        const currentUser = await User.findById(user.id);

        transaction?.addLabels({
          userID: user.id,
          endpoint: "/backend/auth/refresh-token",
          method: "POST",
        });

        if (!currentUser) {
          authLogger.error(`User not found!`, {
            userID: user.id,
            traceId,
            transactionId: transaction?.id,
          });
          return next(errorHandler(404, "User not found!"));
        }

        if (!currentUser.refresh_token) {
          authLogger.error(`Refresh Token missing!`, {
            userID: currentUser._id.toString(),
            traceId,
            transactionId: transaction?.id,
          });
          return next(
            errorHandler(403, "No Refresh Token found! Please log in again!")
          );
        }

        if (currentUser.refresh_token !== refresh_token) {
          authLogger.error(`Refresh Tokens not matching`, {
            userID: currentUser._id.toString(),
            traceId,
            transactionId: transaction?.id,
          });
          return next(
            errorHandler(
              403,
              "Refresh Tokens not matching! Please log in again!"
            )
          );
        }

        const new_access_token = jwt.sign(
          {
            id: currentUser._id,
            is_admin: currentUser.is_admin,
            is_team_manager: currentUser.is_team_manager,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "15m",
          }
        );

        const duration = Date.now() - start;
        authLogger.info("Access Token refreshed successfully!", {
          traceId,
          transactionId: transaction?.id,
          userID: currentUser._id.toString(),
          username: currentUser.username,
          email: currentUser.email,
          first_name: currentUser.first_name,
          last_name: currentUser.last_name,
          duration,
        });
        if (transaction) transaction.end();

        res
          .cookie("access_token", new_access_token, {
            httpOnly: true,
            domain: "localhost",
            path: "/",
          })
          .status(200)
          .json("Access token refreshed successfully!");
      }
    );
  } catch (error) {
    authLogger.error("Error refreshing access token!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};
