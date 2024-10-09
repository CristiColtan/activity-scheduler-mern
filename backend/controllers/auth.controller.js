import User from "../models/user.model.js";

import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

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

export const signgoogle = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (user.is_active === "No")
        return next(errorHandler(401, "Your account has been deactivated!"));

      const token = jwt.sign(
        {
          id: user._id,
          is_admin: user.is_admin,
          is_team_manager: user.is_team_manager,
        },
        process.env.JWT_SECRET
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
