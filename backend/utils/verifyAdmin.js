import { errorHandler } from "./error.js";

export const verifyAdmin = (req, res, next) => {
  //console.log("verify admin", req.user);
  if (req.user && req.user.is_admin === "Yes") {
    next();
  } else {
    return next(errorHandler(401, "Unauthorized! You're not admin!"));
  }
};
