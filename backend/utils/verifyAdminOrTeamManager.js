import { errorHandler } from "./error.js";

export const verifyAdminOrTeamManager = (req, res, next) => {
  if (
    req.user &&
    (req.user.is_team_manager === "Yes" || req.user.is_admin === "Yes")
  ) {
    next();
  } else {
    return next(
      errorHandler(401, "Unauthorized! You're not team manager or admin!")
    );
  }
};
