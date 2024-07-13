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
