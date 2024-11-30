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

export const fetchHours = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    //console.log(req.params);

    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    const today = new Date();
    //console.log(today);
    today.setHours(0, 0, 0, 0);

    console.log(today);
    //console.log(today.getTime());

    const workEntry = currentUser.work.find(
      (entry) =>
        entry.task.toString() === taskId &&
        entry.date.toISOString().slice(0, 10) ===
          today.toISOString().slice(0, 10)
    );

    const loggedHoursToday = currentUser.work
      .filter((entry) => new Date(entry.date).getTime() === today.getTime())
      .reduce((sum, entry) => sum + entry.hours, 0);

    console.log("WorkEntry:", workEntry);

    if (!workEntry)
      return res
        .status(200)
        .json({ hours: "Not assigned yet", total_hours: loggedHoursToday });

    return res.status(200).json({
      hours: workEntry.hours,
      total_hours: loggedHoursToday,
    });
  } catch (error) {
    next(error);
  }
};

export const assignHoursToTask = async (req, res, next) => {
  try {
    const { taskId } = req.body;
    const { hours } = req.body.formData;
    //console.log(req.body);
    //console.log(taskId);
    console.log("Hours:", hours);

    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    const task = await Task.findById(taskId);
    if (!task) return next(errorHandler(404, "Task not found!"));

    const isUserInTaskTeam = task.team.some(
      (memberId) => memberId.toString() === userID
    );

    if (!isUserInTaskTeam) {
      return next(
        errorHandler(
          403,
          "You are not part of this task's team, so you can't log hours!"
        )
      );
    }

    if (hours < 0 || hours > 8)
      return next(
        errorHandler(401, "Please enter an input between 0 and 8 hours")
      );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const loggedHoursToday = currentUser.work
      .filter(
        (entry) =>
          new Date(entry.date).getTime() === today.getTime() &&
          entry.task.toString() !== taskId
      )
      .reduce((sum, entry) => sum + entry.hours, 0);

    console.log("Ore logate", loggedHoursToday);

    if (loggedHoursToday + Number(hours) > 8) {
      console.log("hh", loggedHoursToday + Number(hours));
      return next(
        errorHandler(401, "You can't work more than 8 hours per day!")
      );
    }

    const workEntry = currentUser.work.find(
      (entry) =>
        entry.task.toString() === taskId &&
        new Date(entry.date).getTime() === today.getTime()
    );

    if (workEntry) {
      if (hours === 0) {
        const index = currentUser.work.findIndex(
          (entry) =>
            entry.task.toString() === taskId &&
            new Date(entry.date).getTime() === today.getTime()
        );
        if (index !== -1) {
          currentUser.work.splice(index, 1); //if hours is 0 eliminate work entry for today
        }
      } else {
        workEntry.hours = hours;
      }
    } else {
      if (hours !== 0)
        currentUser.work.push({
          task: taskId,
          date: today,
          hours,
        });
    }

    await currentUser.save();

    res.status(200).json({ message: "Hours have been logged successfully!" });
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
