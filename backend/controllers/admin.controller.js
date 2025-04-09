import { errorHandler } from "../utils/error.js";

import User from "../models/user.model.js";
import Task from "../models/task.model.js";
import AppSettings from "../models/app-settings.model.js";
import Notification from "../models/notification.model.js";

import apm from "elastic-apm-node";
import { userLogger, notifsLogger, tmadminLogger } from "../utils/logger.js";

export const getTeamManagers = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[getTeamManagers]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    tmadminLogger.info("Fetching Team Managers", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/admin/get/team-managers",
      method: "GET",
    });

    const users = await User.find({ is_team_manager: "Yes" })
      .populate({
        path: "team",
        select: "-password",
      })
      .populate({
        path: "roles.task",
        select: "title stage priority is_trashed",
      })
      .select("-password");

    const duration = Date.now() - start;
    tmadminLogger.info("Admin fetch Team Managers successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(users);
  } catch (error) {
    tmadminLogger.error("Error fetching Team Managers!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const getNormalUsers = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[getNormalUsers]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    tmadminLogger.info("Fetching normal users", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/admin/get/normal-users",
      method: "GET",
    });

    const users = await User.find({
      is_admin: "No",
      is_team_manager: "No",
    }).select("-password");

    const duration = Date.now() - start;
    tmadminLogger.info("Admin fetch normal users successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(users);
  } catch (error) {
    tmadminLogger.error("Error fetching normal users!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[getAllUsers]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    tmadminLogger.info("Fetching all users", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/admin/get/all-users",
      method: "GET",
    });

    const users = await User.find({ is_admin: "No", is_team_manager: "No" })
      .select("-password")
      .populate({
        path: "roles.task",
        select: "title stage priority is_trashed",
      });

    const duration = Date.now() - start;
    tmadminLogger.info("Admin fetch all users successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(users);
  } catch (error) {
    tmadminLogger.error("Error fetching all users!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const deleteRole = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[deleteRole]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const { role } = req.body;
    const userID = req.user.id;

    console.log(req.body);

    tmadminLogger.info("Deleting role", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: `Role: ${role}`,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/admin/delete/role",
      method: "DELETE",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    if (currentUser.is_admin !== "Yes") {
      tmadminLogger.error("Not admin!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(403, "You are not an admin!"));
    }

    const appsettings = await AppSettings.findOne();

    if (!appsettings.roles.includes(role)) {
      tmadminLogger.error("User role not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(401, "User role doesn't exist!"));
    }

    if (role === "Task Coordinator") {
      tmadminLogger.error("Can't delete a crucial role!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(
        errorHandler(
          401,
          "The 'Task Coordinator' role is crucial! You can't delete it!"
        )
      );
    }

    appsettings.roles = appsettings.roles.filter((r) => r !== role);
    await appsettings.save();

    const duration = Date.now() - start;
    tmadminLogger.info("Deleted role successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: `Role: ${role}`,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(appsettings.roles);
  } catch (error) {
    tmadminLogger.error("Error deleting role!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const fetchRoles = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[fetchRoles]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];
  try {
    const userID = req.user.id;

    tmadminLogger.info("Fetching roles", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/admin/get/roles",
      method: "GET",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    if (currentUser.is_admin !== "Yes") {
      tmadminLogger.error("Not admin!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(403, "You are not an admin!"));
    }

    const appsettings = await AppSettings.findOne();
    if (!appsettings) {
      tmadminLogger.error("User roles not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "AppSettings not found!"));
    }

    const duration = Date.now() - start;
    tmadminLogger.info("Fetch roles successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      duration,
    });
    if (transaction) transaction.end();

    return res.status(200).json(appsettings.roles);
  } catch (error) {
    tmadminLogger.error("Error fetching roles!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const addRole = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[addRole]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];
  try {
    const { role } = req.body;
    const userID = req.user.id;

    tmadminLogger.info("Adding role", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: `Role: ${role}`,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/admin/add/role",
      method: "POST",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    if (currentUser.is_admin !== "Yes") {
      tmadminLogger.error("Not admin!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(403, "You are not an admin!"));
    }

    const appsettings = await AppSettings.findOne();

    if (appsettings.roles.includes(role)) {
      tmadminLogger.error("User role already exists!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(401, "User role already exists!"));
    }

    if (role === "" || !role) {
      tmadminLogger.error("User role not valid!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(401, "Enter a valid role!"));
    }

    appsettings.roles.push(role);
    await appsettings.save();

    const duration = Date.now() - start;
    tmadminLogger.info("Added role successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: `Role: ${role}`,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(appsettings.roles);
  } catch (error) {
    tmadminLogger.error("Error adding role!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const addTeamManager = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[addTeamManager]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];
  try {
    const userID = req.user.id;
    const { membersID } = req.body;

    tmadminLogger.info("Adding Team Manager(s)", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: membersID,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/admin/add/team-manager",
      method: "POST",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    if (currentUser.is_admin !== "Yes") {
      tmadminLogger.error("Not admin!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(403, "You are not an admin!"));
    }

    let newMembers = [];
    for (let memberID of membersID) {
      const member = await User.findById(memberID);
      if (!member) {
        tmadminLogger.error(`Member with ID: ${memberID} not found!`, {
          traceId,
          transactionId: transaction?.id,
          userID,
        });
        return next(errorHandler(404, `Member with ID ${memberID} not found!`));
      }

      if (member.is_team_manager === "Yes") {
        tmadminLogger.error(`Already Team Manager! ID: ${memberID}`, {
          traceId,
          transactionId: transaction?.id,
          userID,
        });
        return next(
          errorHandler(400, `Member with ID ${member} is already team-manager!`)
        );
      }

      member.is_team_manager = "Yes";
      if (member.title === "Normal User") member.title = "Team Manager";
      await member.save();

      //cautam task-urile create de el si ii atribuim in user.roles rolul de Task Coordinator
      const tasksCreatedByMember = await Task.find({ created_by: memberID });
      tasksCreatedByMember.forEach((task) => {
        member.roles.push({
          task: task._id,
          role: "Task Coordinator",
        });
      });
      await member.save();
    }

    const duration = Date.now() - start;
    tmadminLogger.info("Added Team Manager(s) successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: membersID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json({ message: "Success!" });
  } catch (error) {
    tmadminLogger.error("Error adding Team Manager(s)!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const removeTeamManager = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction(
    "Admin-[removeTeamManager]",
    "admin"
  );
  const traceId = apm?.currentTraceIds?.["trace.id"];
  try {
    const userID = req.user.id;
    const { memberID } = req.body;

    tmadminLogger.info("Removing Team Manager", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: memberID,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/admin/remove/team-manager",
      method: "POST",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      return next(errorHandler(404, "User not found!"));
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
    }

    if (currentUser.is_admin !== "Yes") {
      tmadminLogger.error("Not admin!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(403, "You are not an admin!"));
    }

    const member = await User.findById(memberID);
    if (!member) {
      tmadminLogger.error(`Member with ID: ${memberID} not found!`, {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, `Member with ID ${memberID} not found!`));
    }

    if (member.is_team_manager === "No") {
      tmadminLogger.error(`Member with ID: ${memberID} already Team Manager!`, {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(
        errorHandler(400, `Member with ID ${member} is not a team-manager!`)
      );
    }

    member.is_team_manager = "No";
    if (member.title === "Team Manager") member.title = "Normal User";
    await member.save();

    const tasksCreatedByMember = await Task.find({ created_by: memberID });
    //mai raman doar intrarile din user.roles in care nu se gasesc task-urile din tasksToUpdate (e cu negatie)
    if (tasksCreatedByMember.length > 0) {
      member.roles = member.roles.filter(
        (role) =>
          !tasksCreatedByMember.some((task) => task._id.equals(role.task))
      );
      await member.save();
    }

    const duration = Date.now() - start;
    tmadminLogger.info("Removed Team Manager successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: memberID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json({ message: "Success!" });
  } catch (error) {
    tmadminLogger.error("Error removing Team Manager!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const editUser = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[editUser]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const memberID = req.params.id;
    const userID = req.user.id;

    tmadminLogger.info("Editing user", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: memberID,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/admin/edit/user-fetch-users/:id",
      method: "POST",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    if (currentUser.is_admin !== "Yes") {
      tmadminLogger.error("Not admin!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(403, "You're not an admin!"));
    }

    const updatedUser = await User.findByIdAndUpdate(memberID, req.body, {
      new: true,
    })
      .populate({
        path: "roles.task",
        select: "title stage priority is_trashed",
      })
      .populate({
        path: "team",
        select: "-password",
      })
      .select("-password");

    const duration = Date.now() - start;
    tmadminLogger.info("Edited user successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: memberID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(updatedUser);
  } catch (error) {
    tmadminLogger.error("Error editing user!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

//not using anymore
export const editTeamManager = async (req, res, next) => {
  try {
    const { memberID } = req.params;
    const { title, role } = req.body;

    const user = await User.findById(memberID).select("-password");
    if (!user) return next(errorHandler(404, "User not found!"));

    if (title) user.title = title;
    if (role) user.role = role;

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const switchStatusFetchUsers = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[switchStatus]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const userID = req.user.id;
    const { memberID } = req.body;

    tmadminLogger.info("Switching status", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: memberID,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/admin/switch-status-fetch-users",
      method: "PUT",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    if (currentUser.is_admin !== "Yes") {
      tmadminLogger.error("Not admin!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(403, "You are not an admin!"));
    }

    const member = await User.findById(memberID)
      .populate({
        path: "roles.task",
        select: "title stage priority is_trashed",
      })
      .populate({
        path: "team",
        select: "-password",
      })
      .select("-password");

    if (!member) {
      tmadminLogger.error(`Member with ID: ${memberID} not found!`, {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, `Member with ID ${memberID} not found!`));
    }

    if (member.is_active === "Yes") {
      member.is_active = "No";
      member.title = "Inactive";
    } else if (member.is_active === "No") {
      member.is_active = "Yes";
      if (member.is_team_manager === "Yes") member.title = "Team Manager";
      else member.title = "Normal User";
    }

    await member.save();

    const duration = Date.now() - start;
    tmadminLogger.info("Switched status successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: memberID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(member);
  } catch (error) {
    tmadminLogger.error("Error switching status!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const makeAccountActiveOrInactive = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction(
    "Admin-[switchAccountStatus]",
    "admin"
  );
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const userID = req.user.id;
    const { memberID } = req.body;

    tmadminLogger.info("Switching account status", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: memberID,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/admin/switch-status",
      method: "POST",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    if (currentUser.is_admin !== "Yes") {
      tmadminLogger.error("Not admin!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(403, "You are not an admin!"));
    }

    const member = await User.findById(memberID)
      .populate({
        path: "roles.task",
        select: "title stage priority is_trashed",
      })
      .select("-password");

    if (!member) {
      tmadminLogger.error(`Member with ID: ${memberID} not found!`, {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, `Member with ID ${memberID} not found!`));
    }

    if (member.is_active === "Yes") {
      member.is_active = "No";
      member.title = "Inactive";
    } else if (member.is_active === "No") {
      member.is_active = "Yes";
      if (member.is_team_manager === "Yes") member.title = "Team Manager";
      else member.title = "Normal User";
    }

    await member.save();

    const duration = Date.now() - start;
    tmadminLogger.info("Switched account status successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: memberID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json({ message: "Success!" });
  } catch (error) {
    tmadminLogger.error("Error switching account status!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const fetchAllTasksPopulated = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[fetchTasks]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const userID = req.user.id;

    tmadminLogger.info("Fetching tasks", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/admin/get/all-tasks-populated",
      method: "GET",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    if (currentUser.is_admin !== "Yes") {
      tmadminLogger.error("Not admin!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(403, "You are not an admin!"));
    }

    const populateOptions = [
      { path: "team", select: "-password" },
      { path: "created_by", select: "-password" },
      { path: "activities.by", select: "-password" },
    ];

    const tasks = await Task.find().populate(populateOptions);

    const duration = Date.now() - start;
    tmadminLogger.info("Fetch tasks successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(tasks);
  } catch (error) {
    tmadminLogger.error("Error fetching tasks!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const fetchAllTrashedTasks = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction(
    "Admin-[fetchTrashedTasks]",
    "admin"
  );
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    tmadminLogger.info("Fetching trashed tasks", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/admin/get/all-trashed-tasks",
      method: "GET",
    });

    const tasks = await Task.find({ is_trashed: "Yes" });

    const duration = Date.now() - start;
    tmadminLogger.info("Fetch trashed tasks successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(tasks);
  } catch (error) {
    tmadminLogger.error("Error fetching trashed tasks!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const fetchDashboardStatistics = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[fetchDashboard]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const userID = req.user.id;

    tmadminLogger.info("Fetching dashboard statistics", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/admin/get-dashboard-statistics",
      method: "GET",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    if (currentUser.is_admin !== "Yes") {
      tmadminLogger.error("Not admin!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(403, "You are not an admin!"));
    }

    const allTasks = await Task.find({ is_trashed: "No" }).populate({
      path: "team",
      select: "-password",
    });
    const allUsers = await User.find({ is_active: "Yes" }).select("-password");

    const tasksData = allTasks.reduce((result, task) => {
      const stage = task.stage;

      if (!result[stage]) result[stage] = 1;
      else result[stage]++;

      return result;
    }, {});

    const tasksDataLastMonth = allTasks.reduce((result, task) => {
      const stage = task.stage;
      const taskDate = new Date(task.date);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1); //last month

      if (taskDate > oneMonthAgo) {
        if (!result[stage]) {
          result[stage] = 1;
        } else {
          result[stage]++;
        }
      }

      return result;
    }, {});

    const tasksChart = Object.entries(
      allTasks.reduce((result, task) => {
        const { priority } = task;

        result[priority] = (result[priority] || 0) + 1;

        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    const nrTotalTasks = allTasks?.length;

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const nrTotalTasksLastMonth = allTasks.filter((task) => {
      const taskDate = new Date(task.date);
      return taskDate >= oneMonthAgo;
    }).length;

    const summary = {
      nrTotalTasks,
      nrTotalTasksLastMonth,
      allTasks,
      allUsers,
      tasks: tasksData,
      graphData: tasksChart,
      tasksLastMonth: tasksDataLastMonth,
    };

    const duration = Date.now() - start;
    tmadminLogger.info("Fetch dashboard statistics successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(summary);
  } catch (error) {
    tmadminLogger.error("Error fetching dashboard statistics!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const fetchUserReport1 = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[fetchUserReport1]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    console.log(req.params);
    console.log(req.body);

    const memberID = req.params.id;
    const { date_from, date_until } = req.body;
    const userID = req.user.id;

    tmadminLogger.info("Fetching user report 1", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      data_message: `MemberID: ${memberID}, From: ${date_from} Until: ${date_until}`,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/team-manager/get/report-1/:id",
      method: "PUT",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(404, "User not found!"));
    }

    if (currentUser.is_admin !== "Yes") {
      tmadminLogger.error("Not admin!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(403, "You are not an admin!"));
    }

    if (!date_from || !date_until) {
      tmadminLogger.error("Both dates required!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(400, "Both dates are required!"));
    }

    const targetUser = await User.findById(memberID)
      .populate("work.task")
      .select("-password");

    if (!targetUser) {
      tmadminLogger.error("Member not found!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(404, "Member not found!"));
    }

    const fromDate = new Date(date_from);
    const untilDate = new Date(date_until);

    if (fromDate > untilDate) {
      tmadminLogger.error("Dates in chronological order required!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(
        errorHandler(400, "Please enter dates in cronological order!")
      );
    }

    const filteredWork = targetUser.work.filter(
      (entry) => entry.date >= fromDate && entry.date <= untilDate
    );

    const filteredTasks = [...new Set(filteredWork.map((entry) => entry.task))];

    const taskHours = Object.entries(
      filteredWork.reduce((result, { task, hours }) => {
        const taskName = task.title;
        result[taskName] = (result[taskName] || 0) + hours;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    const duration = Date.now() - start;
    tmadminLogger.info("Fetch user report 1 successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: `MemberID: ${memberID}, From: ${date_from} Until: ${date_until}`,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json({ taskHours, filteredTasks });
  } catch (error) {
    tmadminLogger.error("Error fetching user report 1!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const fetchUserReport2 = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[fetchUserReport2]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    console.log(req.params);
    console.log(req.body);

    const memberID = req.params.id;
    const { date_from, date_until } = req.body;
    const userID = req.user.id;

    tmadminLogger.info("Fetching user report 2", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      data_message: `MemberID: ${memberID}, From: ${date_from} Until: ${date_until}`,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/team-manager/get/report-2/:id",
      method: "PUT",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(404, "User not found!"));
    }

    if (currentUser.is_admin !== "Yes") {
      tmadminLogger.error("Not admin!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(403, "You are not an admin!"));
    }

    if (!date_from || !date_until) {
      tmadminLogger.error("Both dates required!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(400, "Both dates are required!"));
    }

    const targetUser = await User.findById(memberID).select("-password");

    if (!targetUser) {
      tmadminLogger.error("Member not found!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(404, "Member not found!"));
    }

    const fromDate = new Date(date_from);
    const untilDate = new Date(date_until);

    if (fromDate > untilDate) {
      tmadminLogger.error("Dates in chronological order required!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(
        errorHandler(400, "Please enter dates in cronological order!")
      );
    }

    const filteredWork = targetUser.work.filter(
      (entry) => entry.date >= fromDate && entry.date <= untilDate
    );

    const roleHours = Object.entries(
      filteredWork.reduce((result, { task, hours }) => {
        //find role
        const roleEntry = targetUser.roles.find(
          (role) => role.task.toString() === task._id.toString()
        );
        const roleName = roleEntry.role;
        result[roleName] = (result[roleName] || 0) + hours;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    const duration = Date.now() - start;
    tmadminLogger.info("Fetch user report 2 successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: `MemberID: ${memberID}, From: ${date_from} Until: ${date_until}`,
      duration,
    });
    if (transaction) transaction.end();

    return res.status(200).json(roleHours);
  } catch (error) {
    tmadminLogger.error("Error fetching user report 2!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const fetchTeamManagerReports = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction(
    "Admin-[fetchTeamManagerReports]",
    "admin"
  );
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const teamManagerID = req.params.id;
    const userID = req.user.id;

    tmadminLogger.info("Fetching Team Manager reports", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      data_message: `Team Manager ID: ${teamManagerID}`,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/team-manager/get/reports-TM/:id",
      method: "PUT",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(404, "User not found!"));
    }

    if (currentUser.is_admin !== "Yes") {
      tmadminLogger.error("Not admin!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(403, "You are not an admin!"));
    }

    const teamManager = await User.findById(teamManagerID);
    if (!teamManager) {
      tmadminLogger.error("Team Manager not found!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(404, "Team Manager not found!"));
    }

    const tasks = await Task.find({ created_by: teamManagerID }).populate({
      path: "team",
      select: "-password",
    });

    //task-uri in functie de stage
    //ex: to do - 10
    const taskStatusDistribution = Object.entries(
      tasks.reduce((result, task) => {
        result[task.stage] = (result[task.stage] || 0) + 1;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    const teamManagerTeamIDs = teamManager.team.map((member) =>
      member._id.toString()
    );

    //ore lucrate per membru al echipei team manager-ului
    //ex: user normal 1 - 53
    const teamMemberIDs = [
      ...new Set(
        tasks.flatMap((task) => task.team.map((member) => member._id))
      ),
    ];

    const teamMembers = await User.find({ _id: { $in: teamMemberIDs } }).then(
      (members) =>
        members.filter((member) =>
          teamManagerTeamIDs.includes(member._id.toString())
        )
    );

    const taskIDs = tasks.map((task) => task._id.toString());

    const teamEfficency = teamMembers.map((member) => {
      const totalHours = member.work
        .filter((entry) => taskIDs.includes(entry.task.toString()))
        .reduce((sum, entry) => sum + entry.hours, 0);
      return {
        name: `${member.first_name} ${member.last_name}`,
        hours: totalHours,
      };
    });

    const duration = Date.now() - start;
    tmadminLogger.info("Fetch Team Manager reports successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: `MemberID: ${teamManagerID}`,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json({ taskStatusDistribution, teamEfficency });
  } catch (error) {
    tmadminLogger.error("Error fetching Team Manager reports!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const deleteAsset = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[deleteAsset]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    console.log(req.body);
    const { taskID, assetIndex } = req.body;

    tmadminLogger.info("Deleting asset", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      data_message: `TaskID: ${taskID}, Asset index: ${assetIndex}`,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/team-manager/delete/asset",
      method: "PUT",
    });

    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) {
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(404, "User not found!"));
    }

    if (currentUser.is_admin !== "Yes") {
      tmadminLogger.error("Not admin!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(403, "You are not an admin!"));
    }

    const task = await Task.findById(taskID);
    if (!task) {
      tmadminLogger.error("Task not found!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(404, "Task not found!"));
    }
    if (assetIndex < 0 || assetIndex >= task.asseturls.length) {
      tmadminLogger.error("Invalid index!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(400, "Invalid index!"));
    }

    task.asseturls.splice(assetIndex, 1);
    await task.save();

    const duration = Date.now() - start;
    tmadminLogger.info("Deleted asset successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: `TaskID: ${taskID}, Asset index: ${assetIndex}`,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(task);
  } catch (error) {
    tmadminLogger.error("Error deleting asset!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const deleteActivity = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[deleteActivity]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    console.log(req.body);
    const { taskID, activityIndex } = req.body;

    tmadminLogger.info("Deleting activity", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      data_message: `TaskID: ${taskID}, Activity index: ${activityIndex}`,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/team-manager/delete/activity",
      method: "PUT",
    });

    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) {
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(404, "User not found!"));
    }

    if (currentUser.is_admin !== "Yes") {
      tmadminLogger.error("Not admin!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(403, "You are not an admin!"));
    }

    const task = await Task.findById(taskID);
    if (!task) {
      tmadminLogger.error("Task not found!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(404, "Task not found!"));
    }

    if (activityIndex < 0 || activityIndex >= task.activities.length) {
      tmadminLogger.error("Invalid index!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(400, "Invalid index!"));
    }

    task.activities.splice(activityIndex, 1);
    await task.save();

    const duration = Date.now() - start;
    tmadminLogger.info("Deleted activity successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: `TaskID: ${taskID}, Activity index: ${activityIndex}`,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(task);
  } catch (error) {
    tmadminLogger.error("Error deleting activity!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const deleteSubtask = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[deleteSubtask]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    console.log(req.body);
    const { taskID, subtaskIndex } = req.body;

    tmadminLogger.info("Deleting subtask", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      data_message: `TaskID: ${taskID}, Subtask index: ${subtaskIndex}`,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/team-manager/delete/subtask",
      method: "PUT",
    });

    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) {
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(404, "User not found!"));
    }

    if (currentUser.is_admin !== "Yes") {
      tmadminLogger.error("Not admin!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(403, "You are not an admin!"));
    }

    const task = await Task.findById(taskID);
    if (!task) {
      tmadminLogger.error("Task not found!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(404, "Task not found!"));
    }

    if (subtaskIndex < 0 || subtaskIndex >= task.subtasks.length) {
      tmadminLogger.error("Invalid index!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(400, "Invalid index!"));
    }

    task.subtasks.splice(subtaskIndex, 1);
    await task.save();

    const duration = Date.now() - start;
    tmadminLogger.info("Deleted subtask successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: `TaskID: ${taskID}, Subtask index: ${subtaskIndex}`,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(task);
  } catch (error) {
    tmadminLogger.error("Error deleting subtask!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const editActivity = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[editActivity]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    console.log(req.body);
    const { formData, taskID, activityIndex } = req.body;

    const userID = req.user.id;

    tmadminLogger.info("Editing activity", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      data_message: `TaskID: ${taskID}, Activity index: ${activityIndex}`,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/team-manager/edit/activity",
      method: "PUT",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(404, "User not found!"));
    }

    if (currentUser.is_admin !== "Yes") {
      tmadminLogger.error("Not admin!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(403, "You are not an admin!"));
    }

    const task = await Task.findById(taskID);
    if (!task) {
      tmadminLogger.error("Task not found!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(404, "Task not found!"));
    }

    if (activityIndex < 0 || activityIndex >= task.activities.length) {
      tmadminLogger.error("Invalid index!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(400, "Invalid index!"));
    }

    task.activities[activityIndex].type = formData.type;

    if (formData.description)
      task.activities[activityIndex].description = formData.description;

    await task.save();

    const duration = Date.now() - start;
    tmadminLogger.info("Edited activity successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: `TaskID: ${taskID}, Activity index: ${activityIndex}`,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(task);
  } catch (error) {
    tmadminLogger.error("Error editing activity!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const editSubtask = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[editSubtask]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    console.log(req.body);
    const { formData, taskID, subtaskIndex } = req.body;

    const userID = req.user.id;

    tmadminLogger.info("Editing subtask", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      data_message: `TaskID: ${taskID}, Subtask index: ${subtaskIndex}`,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/team-manager/edit/subtask",
      method: "PUT",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(404, "User not found!"));
    }

    if (currentUser.is_admin !== "Yes") {
      tmadminLogger.error("Not admin!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(403, "You are not an admin!"));
    }

    const task = await Task.findById(taskID);
    if (!task) {
      tmadminLogger.error("Task not found!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(404, "Task not found!"));
    }

    if (subtaskIndex < 0 || subtaskIndex >= task.subtasks.length) {
      tmadminLogger.error("Invalid index!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(400, "Invalid index!"));
    }

    if (formData.title) task.subtasks[subtaskIndex].title = formData.title;
    if (formData.tag) task.subtasks[subtaskIndex].tag = formData.tag;
    if (formData.date) task.subtasks[subtaskIndex].date = formData.date;

    await task.save();

    const duration = Date.now() - start;
    tmadminLogger.info("Edited subtask successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: `TaskID: ${taskID}, Subtask index: ${subtaskIndex}`,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(task);
  } catch (error) {
    tmadminLogger.error("Error editing subtask!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const getNotificationsLog = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Admin-[fetchNotifLog]", "admin");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const userID = req.user.id;

    tmadminLogger.info("Fetching notifications log", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/team-manager/get/notifications-log",
      method: "GET",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(404, "User not found!"));
    }

    if (currentUser.is_admin !== "Yes") {
      tmadminLogger.error("Not admin!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(403, "You are not an admin!"));
    }

    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({
        path: "sent_to",
        select: "first_name last_name title email",
      });

    const duration = Date.now() - start;
    tmadminLogger.info("Fetch notifications log successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(notifications);
  } catch (error) {
    tmadminLogger.error("Error fetching notifications log!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};
