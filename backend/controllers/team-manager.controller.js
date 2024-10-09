import { errorHandler } from "../utils/error.js";

import User from "../models/user.model.js";

export const getMyTeam = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("team");

    if (!user) return next(errorHandler(404, "User not found!"));

    res.status(200).json(user.team); //return user team
  } catch (error) {
    next(error);
  }
};

export const getNormalUsers = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const currentUser = await User.findById(userID).populate("team");
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    const users = await User.find({ is_admin: "No", is_team_manager: "No" });

    const filteredUsers = users.filter(
      (user) =>
        !currentUser.team.some((teamMember) => teamMember._id.equals(user._id))
    );

    console.log(filteredUsers);

    res.status(200).json(filteredUsers);
  } catch (error) {
    next(error);
  }
};

export const addToTeam = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const { membersID } = req.body;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    let newMembers = [];
    for (let memberID of membersID) {
      const newMember = await User.findById(memberID);
      if (!newMember)
        return next(errorHandler(404, `Member with ID ${memberID} not found!`));

      if (currentUser.team.includes(memberID))
        return next(
          errorHandler(
            400,
            `Member with ID ${memberID} is already in your team!`
          )
        );

      newMembers.push(memberID);
    }

    currentUser.team.push(...newMembers);
    await currentUser.save();

    const updatedUser = await User.findById(userID).populate("team");
    res.status(200).json(updatedUser.team);
  } catch (error) {
    next(error);
  }
};

export const removeFromTeam = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const { memberID } = req.params;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (!currentUser.team.includes(memberID))
      return next(
        errorHandler(400, `Member with ID ${memberID} is not in your team!`)
      );

    currentUser.team = currentUser.team.filter(
      (user) => user.toString() !== memberID
    );

    await currentUser.save();

    const updatedUser = await User.findById(userID).populate("team");
    res.status(200).json(updatedUser.team);
  } catch (error) {
    next(error);
  }
};

export const editTeamMember = async (req, res, next) => {
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
