import { errorHandler } from "./error.js";

export const verifyTeamManager = (req, res, next) => {
  console.log("verify tm", req.user);
  if (req.user && req.user.is_team_manager === "Yes") {
    next();
  } else {
    return next(errorHandler(401, "Unauthorized! You're not team manager!"));
  }
};
