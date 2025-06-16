import { errorHandler } from "../utils/error.js";

import User from "../models/user.model.js";
import Task from "../models/task.model.js";
import Notification from "../models/notification.model.js";

import apm from "elastic-apm-node";
import { userLogger, notifsLogger, tmadminLogger } from "../utils/logger.js";

export const getMyTeam = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction(
    "TeamManager-[getMyTeam]",
    "teammanagers"
  );
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    tmadminLogger.info("Fetching team", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/team-manager/get/my-team",
      method: "GET",
    });

    const user = await User.findById(req.user.id).populate({
      path: "team",
      select: "-password",
      populate: {
        path: "roles.task",
        model: "Task",
        select: "title stage priority is_trashed",
      },
    });

    if (!user) {
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(404, "User not found!"));
    }

    const duration = Date.now() - start;
    tmadminLogger.info("Team Manager fetch team successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(user.team); //return user team
  } catch (error) {
    tmadminLogger.error("Error fetching team!", {
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
  const transaction = apm.startTransaction(
    "TeamManager-[getNormalUsers]",
    "teammanagers"
  );
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const userID = req.user.id;

    tmadminLogger.info("Fetching normal users", {
      traceId,
      transactionId: transaction?.id,
      userID,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/team-manager/get/normal-users",
      method: "GET",
    });

    const currentUser = await User.findById(userID).populate({
      path: "team",
      select: "-password",
    });
    if (!currentUser) {
      tmadminLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    const users = await User.find({
      is_admin: "No",
      is_team_manager: "No",
    }).select("-password");

    const filteredUsers = users.filter(
      (user) =>
        !currentUser.team.some((teamMember) => teamMember._id.equals(user._id))
    );

    console.log(filteredUsers);

    const duration = Date.now() - start;
    tmadminLogger.info("Team Manager fetch normal users successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(filteredUsers);
  } catch (error) {
    tmadminLogger.error("Error fetching all normal users!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const addToTeam = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction(
    "TeamManager-[addToTeam]",
    "teammanagers"
  );
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const userID = req.user.id;
    const { membersID } = req.body;

    tmadminLogger.info("Adding to team", {
      traceId,
      transactionId: transaction?.id,
      data_message: membersID,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/team-manager/add/team-member",
      method: "POST",
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

    if (currentUser.team.length + membersID.length > 8) {
      tmadminLogger.error("Maximum team limit (8) exceded!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(401, "Maximum team limit (8) exceded!"));
    }

    let newMembers = [];
    for (let memberID of membersID) {
      const newMember = await User.findById(memberID);
      if (!newMember) {
        tmadminLogger.error(`Member with ID ${memberID} not found!`, {
          traceId,
          transactionId: transaction?.id,
          userID: req.user.id,
        });
        return next(errorHandler(404, `Member with ID ${memberID} not found!`));
      }

      if (currentUser.team.includes(memberID)) {
        tmadminLogger.error(`Member with ID ${memberID} already in team!`, {
          traceId,
          transactionId: transaction?.id,
          userID: req.user.id,
        });
        return next(
          errorHandler(
            400,
            `Member with ID ${memberID} is already in your team!`
          )
        );
      }

      //notify
      let text = `${currentUser.last_name} ${currentUser.first_name} (${currentUser.title}) added you to his team!`;
      const notif = await Notification.create({
        text,
        task: null,
        sent_to: memberID,
      });

      newMembers.push(memberID);
    }

    currentUser.team.push(...newMembers);
    await currentUser.save();

    const updatedUser = await User.findById(userID).populate({
      path: "team",
      select: "-password",
    });

    const duration = Date.now() - start;
    tmadminLogger.info("Team Manager added member(s) to team successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: membersID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(updatedUser.team);
  } catch (error) {
    tmadminLogger.error("Error adding member(s) to team!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const removeFromTeam = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction(
    "TeamManager-[removeFromTeam]",
    "teammanagers"
  );
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const userID = req.user.id;
    const { memberID } = req.params;

    tmadminLogger.info("Removing from team", {
      traceId,
      transactionId: transaction?.id,
      data_message: memberID,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/team-manager/remove/team-member/:memberID",
      method: "DELETE",
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

    if (!currentUser.team.includes(memberID)) {
      tmadminLogger.error("Member is not in team!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(
        errorHandler(400, `Member with ID ${memberID} is not in your team!`)
      );
    }

    currentUser.team = currentUser.team.filter(
      (user) => user.toString() !== memberID
    );

    await currentUser.save();

    const member = await User.findById(memberID);
    if (!member) {
      tmadminLogger.error("Member not found!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(404, "Member not found!"));
    }

    const tasksToUpdate = await Task.find({
      created_by: userID,
      team: memberID,
    });

    await Promise.all(
      tasksToUpdate.map(async (task) => {
        task.team = task.team.filter((id) => id.toString() !== memberID);
        await task.save();
      })
    );

    //mai raman doar intrarile din user.roles in care nu se gasesc task-urile din tasksToUpdate
    //si care au logate ore muncite

    //old: !tasksToUpdate.some((task) => task._id.equals(role.task))
    member.roles = member.roles.filter((roleEntry) => {
      const taskInRoles = tasksToUpdate.some((task) =>
        task._id.equals(roleEntry.task)
      );

      if (!taskInRoles) return true;

      const hasLoggedWork = member.work.some(
        (workEntry) =>
          workEntry.task._id.equals(roleEntry.task) && workEntry.hours > 0
      );

      return hasLoggedWork;
    });
    await member.save();

    const updatedUser = await User.findById(userID).populate({
      path: "team",
      select: "-password",
    });

    const duration = Date.now() - start;
    tmadminLogger.info("Team Manager removed member from team successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
      data_message: memberID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(updatedUser.team);
  } catch (error) {
    tmadminLogger.error("Error removing member from team!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

//not using this
export const editTeamMember = async (req, res, next) => {
  try {
    const { memberID } = req.params;
    const { title, role } = req.body;
    const managerID = req.user.id;

    const manager = await User.findById(managerID);
    if (!manager || manager.is_team_manager !== "Yes")
      return next(
        errorHandler(403, "You are not allowed to edit team members!")
      );

    if (!manager.team.includes(memberID)) {
      return next(errorHandler(403, "This user is not part of your team!"));
    }

    const user = await User.findById(memberID).select("-password");
    if (!user) return next(errorHandler(404, "User not found!"));

    //notify
    let text_title;
    let text_role;

    if (title) {
      user.title = title;

      text_title = `Your title has been updated by ${
        manager.first_name + " " + manager.last_name
      }. Check your profile!`;

      const notif = await Notification.create({
        type: "message",
        text: text_title,
        sent_to: user._id,
      });
    }
    if (role) {
      user.role = role;

      text_role = `Your role has been updated by ${
        manager.first_name + " " + manager.last_name
      }. Check your profile!`;

      const notif = await Notification.create({
        type: "message",
        text: text_role,
        sent_to: user._id,
      });
    }

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const fetchAllTrashedTasks = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction(
    "TeamManager-[fetchTrashedTasks]",
    "teammanagers"
  );
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const userID = req.user.id;

    tmadminLogger.info("Fetching all trashed tasks", {
      traceId,
      transactionId: transaction?.id,
      userID: req.user.id,
      is_admin: req.user.is_admin,
      is_team_manager: req.user.is_team_manager,
    });

    transaction?.addLabels({
      userID: req.user.id,
      endpoint: "/backend/team-manager/get/all-trashed-tasks",
      method: "GET",
    });

    const tasks = await Task.find({ is_trashed: "Yes", created_by: userID });

    const duration = Date.now() - start;
    tmadminLogger.info("Team Manager fetch all trashed tasks successfully!", {
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
    tmadminLogger.error("Error fetching all trashed tasks!", {
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
  const transaction = apm.startTransaction(
    "TeamManager-[fetchDashboard]",
    "teammanagers"
  );
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
      endpoint: "/backend/team-manager/get/dashboard-statistics",
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

    if (currentUser.is_team_manager !== "Yes") {
      tmadminLogger.error("Not a team manager!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(403, "You are not an team-manager!"));
    }

    const allTasks = await Task.find({
      is_trashed: "No",
      created_by: userID,
    }).populate({
      path: "team",
      select: "-password",
    });
    const allUserss = await User.findById(userID).populate({
      path: "team",
      select: "-password",
    });
    const allUsers = allUserss.team;

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

export const fetchTeamMemberReport1 = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction(
    "TeamManager-[fetchTeamMemberReport1]",
    "teammanagers"
  );
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    console.log(req.params);
    console.log(req.body);

    const memberID = req.params.id;
    const { date_from, date_until } = req.body;
    const userID = req.user.id;

    tmadminLogger.info("Fetching team member report 1", {
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

    if (currentUser.is_team_manager !== "Yes") {
      tmadminLogger.error("Not a team manager!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(403, "You are not an team-manager!"));
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
        errorHandler(400, "Please enter dates in chronological order!")
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
    tmadminLogger.info("Fetch team member report 1 successfully!", {
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
    tmadminLogger.error("Error fetching team member report 1!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const fetchTeamMemberReport2 = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction(
    "TeamManager-[fetchTeamMemberReport2]",
    "teammanagers"
  );
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    console.log(req.params);
    console.log(req.body);

    const memberID = req.params.id;
    const { date_from, date_until } = req.body;
    const userID = req.user.id;

    tmadminLogger.info("Fetching team member report 2", {
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

    if (currentUser.is_team_manager !== "Yes") {
      tmadminLogger.error("Not a team manager!", {
        traceId,
        transactionId: transaction?.id,
        userID: req.user.id,
      });
      return next(errorHandler(403, "You are not an team-manager!"));
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
    tmadminLogger.info("Fetch team member report 2 successfully!", {
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
    tmadminLogger.error("Error fetching team member report 2!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};
