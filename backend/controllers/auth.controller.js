import User from "../models/user.model.js";

import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";

import { errorHandler } from "../utils/error.js";

export const signup = async (req, res, next) => {
  const { username, email, password, first_name, last_name } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    first_name,
    last_name,
  });

  const existingUser = await User.findOne({ email });
  if (existingUser) return next(errorHandler(400, "User already exists!"));

  try {
    await newUser.save();
    res.status(201).json("User created successfully!");
  } catch (error) {
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const validUser = await User.findOne({ username });
    if (!validUser) return next(errorHandler(400, "User not found!"));

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, "Wrong credentials!"));

    if (validUser.is_active === "No")
      return next(errorHandler(401, "Your account has been deactivated!"));

    if (validUser.mfa_enabled === "Yes") {
      return res.status(200).json({
        mfa_required: true,
        message: "Two-factor authentication code required!",
      });
    }

    const token = jwt.sign(
      {
        id: validUser._id,
        is_admin: validUser.is_admin,
        is_team_manager: validUser.is_team_manager,
      },
      process.env.JWT_SECRET
    );
    const { password: pass, ...rest } = validUser._doc; //ascundem parola din json

    res
      .cookie("access_token", token, {
        httpOnly: true,
        domain: "localhost",
        path: "/",
      })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const signinTOTP = async (req, res, next) => {
  const { username, code } = req.body;
  console.log("TOTP:", username, code);

  try {
    const validUser = await User.findOne({ username });
    if (!validUser) return next(errorHandler(400, "User not found!"));

    if (!code)
      return next(
        errorHandler(401, "Two-factor authentication code required!")
      );

    if (validUser.mfa_enabled !== "Yes")
      return next(errorHandler(400, "Two-factor authentication not enabled!"));

    const verified = speakeasy.totp.verify({
      secret: validUser.mfa_secret,
      encoding: "base32",
      token: code,
    });

    if (!verified)
      return next(errorHandler(401, "Invalid token! Please try again!"));

    const token = jwt.sign(
      {
        id: validUser._id,
        is_admin: validUser.is_admin,
        is_team_manager: validUser.is_team_manager,
      },
      process.env.JWT_SECRET
    );
    const { password: pass, ...rest } = validUser._doc; //ascundem parola din json

    res
      .cookie("access_token", token, {
        httpOnly: true,
        domain: "localhost",
        path: "/",
      })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const signout = async (req, res, next) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json("User has logged out!");
  } catch (error) {
    next(error);
  }
};

export const signingoogleTOTP = async (req, res, next) => {
  const { email, code } = req.body;
  console.log("GOOGLE TOTP:", email, code);

  try {
    const validUser = await User.findOne({ email });

    if (!validUser) return next(errorHandler(400, "User not found!"));

    if (!code)
      return next(
        errorHandler(401, "Two-factor authentication code required!")
      );

    if (validUser.mfa_enabled !== "Yes")
      return next(errorHandler(400, "Two-factor authentication not enabled!"));

    const verified = speakeasy.totp.verify({
      secret: validUser.mfa_secret,
      encoding: "base32",
      token: code,
    });

    if (!verified)
      return next(errorHandler(401, "Invalid token! Please try again!"));

    const token = jwt.sign(
      {
        id: validUser._id,
        is_admin: validUser.is_admin,
        is_team_manager: validUser.is_team_manager,
      },
      process.env.JWT_SECRET
    );
    const { password: pass, ...rest } = validUser._doc; //ascundem parola din json

    res
      .cookie("access_token", token, {
        httpOnly: true,
        domain: "localhost",
        path: "/",
      })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const signgoogle = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      if (user.is_active === "No")
        return next(errorHandler(401, "Your account has been deactivated!"));

      if (user.mfa_enabled === "Yes") {
        return res.status(200).json({
          mfa_required: true,
          message: "Two-factor authentication code required!",
        });
      }

      const token = jwt.sign(
        {
          id: user._id,
          is_admin: user.is_admin,
          is_team_manager: user.is_team_manager,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      const { password: pass, ...rest } = user._doc; //ascundem parola din json

      res
        .cookie("access_token", token, {
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
      const token = jwt.sign(
        {
          id: newUser._id,
          is_admin: newUser.is_admin,
          is_team_manager: newUser.is_team_manager,
        },
        process.env.JWT_SECRET
      );
      const { password: pass, ...rest } = newUser._doc;

      res
        .cookie("access_token", token, {
          httpOnly: true,
          domain: "localhost",
          path: "/",
        })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};

export const resetpass = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (userID !== req.params.id)
      return next(
        errorHandler(401, "You can only reset your own account password!")
      );

    console.log("BODY:", req.body);
    const { oldPassword, newPassword, confirmPassword } = req.body;
    console.log(oldPassword, newPassword, confirmPassword);

    if (currentUser.mfa_enabled === "Yes") {
      const { token } = req.body;
      console.log("Token:", token);

      if (!token)
        return next(
          errorHandler(401, "Two-factor authentication code required!")
        );

      const verified = speakeasy.totp.verify({
        secret: currentUser.mfa_secret,
        encoding: "base32",
        token: token,
      });

      if (!verified)
        return next(errorHandler(401, "Invalid token! Please try again!"));
    }

    const validPassword = bcryptjs.compareSync(
      oldPassword,
      currentUser.password
    );
    if (!validPassword)
      return next(errorHandler(401, "Your old password is wrong!"));

    const isSamePassword = bcryptjs.compareSync(
      newPassword,
      currentUser.password
    );
    if (isSamePassword)
      return next(errorHandler(400, "New password must be different!"));

    const newHashedPassword = bcryptjs.hashSync(newPassword, 10);
    await User.findByIdAndUpdate(userID, { password: newHashedPassword });

    res.status(200).json("Password updated successfully!");
  } catch (error) {
    next(error);
  }
};
