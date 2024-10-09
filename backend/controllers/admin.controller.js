import { errorHandler } from "../utils/error.js";

import User from "../models/user.model.js";

export const getTeamManagers = async (req, res, next) => {
  try {
    const users = await User.find({ is_team_manager: "Yes" });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getNormalUsers = async (req, res, next) => {
  try {
    const users = await User.find({ is_admin: "No", is_team_manager: "No" });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ is_admin: "No" });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const addTeamManager = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const { membersID } = req.body;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

    let newMembers = [];
    for (let memberID of membersID) {
      const member = await User.findById(memberID);
      if (!member)
        return next(errorHandler(404, `Member with ID ${member} not found!`));

      if (member.is_team_manager === "Yes")
        return next(
          errorHandler(400, `Member with ID ${member} is already team-manager!`)
        );

      member.is_team_manager = "Yes";
      await member.save();
    }

    res.status(200).json({ message: "Success!" });
  } catch (error) {
    next(error);
  }
};

export const removeTeamManager = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const { memberID } = req.body;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

    const member = await User.findById(memberID);
    if (!member)
      return next(errorHandler(404, `Member with ID ${member} not found!`));

    if (member.is_team_manager === "No")
      return next(
        errorHandler(400, `Member with ID ${member} is not a team-manager!`)
      );

    member.is_team_manager = "No";
    await member.save();

    res.status(200).json({ message: "Success!" });
  } catch (error) {
    next(error);
  }
};

export const editTeamManager = async (req, res, next) => {
  try {
    const { memberID } = req.params;
    const { title, role } = req.body;

    const user = await User.findById(memberID);
    if (!user) return next(errorHandler(404, "User not found!"));

    if (title) user.title = title;
    if (role) user.role = role;

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const makeAccountActiveOrInactive = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const { memberID } = req.body;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

    const member = await User.findById(memberID);
    if (!member)
      return next(errorHandler(404, `Member with ID ${member} not found!`));

    if (member.is_active === "Yes") member.is_active = "No";
    else if (member.is_active === "No") member.is_active = "Yes";

    await member.save();
    res.status(200).json({ message: "Success!" });
  } catch (error) {
    next(error);
  }
};
