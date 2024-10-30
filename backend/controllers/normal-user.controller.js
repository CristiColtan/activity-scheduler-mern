import { errorHandler } from "../utils/error.js";

import Task from "../models/task.model.js";
import User from "../models/user.model.js";

export const updateProfile = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (userID !== req.params.id)
      return next(errorHandler(401, "You can only update your own account!"));

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    const { password: pass, ...userWithoutPassword } = updatedUser._doc;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const fetchDashboardStatistics = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    const allTasks = await Task.find({
      is_trashed: "No",
      team: userID,
    }).populate({
      path: "team",
      select: "-password",
    });

    const allUsers = [];

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
