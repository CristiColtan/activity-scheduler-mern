import { errorHandler } from "../utils/error.js";

import User from "../models/user.model.js";
import Task from "../models/task.model.js";
import Notification from "../models/notification.model.js";

export const getMyTeam = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "team",
      select: "-password",
    });

    if (!user) return next(errorHandler(404, "User not found!"));

    res.status(200).json(user.team); //return user team
  } catch (error) {
    next(error);
  }
};

export const getNormalUsers = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const currentUser = await User.findById(userID).populate({
      path: "team",
      select: "-password",
    });
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    const users = await User.find({
      is_admin: "No",
      is_team_manager: "No",
    }).select("-password");

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

    const updatedUser = await User.findById(userID).populate({
      path: "team",
      select: "-password",
    });
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

    const updatedUser = await User.findById(userID).populate({
      path: "team",
      select: "-password",
    });
    res.status(200).json(updatedUser.team);
  } catch (error) {
    next(error);
  }
};

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
  try {
    const userID = req.user.id;

    const tasks = await Task.find({ is_trashed: "Yes", created_by: userID });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const fetchDashboardStatistics = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_team_manager !== "Yes")
      return next(errorHandler(403, "You are not an team-manager!"));

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

    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
};
