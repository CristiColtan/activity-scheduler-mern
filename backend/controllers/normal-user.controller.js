import { errorHandler } from "../utils/error.js";

import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

import apm from "elastic-apm-node";
import { userLogger, authLogger } from "../utils/logger.js";

export const updateProfile = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("User-[UpdateProfile]", "users");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const userID = req.user.id;

    userLogger.info("Updating profile", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/normal-user/update-my-profile/:id",
      method: "POST",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      userLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    if (userID !== req.params.id) {
      userLogger.error("Tried to update profile for another account!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(401, "You can only update your own account!"));
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    const { password: pass, ...userWithoutPassword } = updatedUser._doc;

    const duration = Date.now() - start;
    userLogger.info("User updated profile successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    userLogger.error("Error updating profile!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const fetchHours = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("User-[FetchHours]", "users");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const { taskId } = req.params;
    //console.log(req.params);

    const userID = req.user.id;

    userLogger.info("Fetching hours", {
      traceId,
      taskID: taskId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/normal-user/get-hours/:taskId",
      method: "POST",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      userLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
        taskID: taskId,
      });
      return next(errorHandler(404, "User not found!"));
    }

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

    const duration = Date.now() - start;
    userLogger.info("Fetched hours successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID: taskId,
      duration,
      data_message: `Total hours logged today: ${loggedHoursToday}`,
    });
    if (transaction) transaction.end();

    if (!workEntry)
      return res
        .status(200)
        .json({ hours: "Not logged yet", total_hours: loggedHoursToday });

    return res.status(200).json({
      hours: workEntry.hours,
      total_hours: loggedHoursToday,
    });
  } catch (error) {
    userLogger.error("Error fetching hours!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const assignHoursToTask = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("User-[AssignHours]", "users");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const { taskId } = req.body;
    const { hours } = req.body.formData;
    //console.log(req.body);
    //console.log(taskId);
    console.log("Hours:", hours);

    const userID = req.user.id;

    userLogger.info("Logging hours", {
      traceId,
      taskID: taskId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/normal-user/assign-hours",
      method: "POST",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      userLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
        taskID: taskId,
      });
      return next(errorHandler(404, "User not found!"));
    }

    const task = await Task.findById(taskId);
    if (!task) {
      userLogger.error("Task not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
        taskID: taskId,
      });
      return next(errorHandler(404, "Task not found!"));
    }

    const isUserInTaskTeam = task.team.some(
      (memberId) => memberId.toString() === userID
    );

    if (!isUserInTaskTeam) {
      userLogger.error("Not part of task's team! Can't log hours!", {
        traceId,
        transactionId: transaction?.id,
        userID,
        taskID: taskId,
      });
      return next(
        errorHandler(
          403,
          "You are not part of this task's team, so you can't log hours!"
        )
      );
    }

    if (hours < 0 || hours > 8) {
      userLogger.error("Not entered an input between 0 and 8 hours!", {
        traceId,
        transactionId: transaction?.id,
        userID,
        taskID: taskId,
      });
      return next(
        errorHandler(401, "Please enter an input between 0 and 8 hours")
      );
    }

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
      userLogger.error("Logged more than 8 hours today!", {
        traceId,
        transactionId: transaction?.id,
        userID,
        taskID: taskId,
      });
      return next(
        errorHandler(401, "You can't work more than 8 hours per day!")
      );
    }

    const workEntry = currentUser.work.find(
      (entry) =>
        entry.task.toString() === taskId &&
        new Date(entry.date).getTime() === today.getTime()
    );

    const hasEverWorked = currentUser.work.some(
      (entry) => entry.task.toString() === taskId
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
      if (hours !== 0) {
        currentUser.work.push({
          task: taskId,
          date: today,
          hours,
        });

        if (hasEverWorked === true) {
          //add to timeline
          const activity_data = {
            type: "in progress",
            description: `Working at the project`,
            date: new Date(),
            by: userID,
          };

          //notify
          let text = `New activity on task ${task.title}. Check it and act accordingly.`;

          const notif = await Notification.create({
            text,
            task: task._id,
            sent_to: task.created_by,
          });

          task.activities.push(activity_data);
          await task.save();
        } else {
          //add to timeline
          const activity_data = {
            type: "started",
            description: `Working at the project`,
            date: new Date(),
            by: userID,
          };

          //notify
          let text = `New activity on task ${task.title}. Check it and act accordingly.`;

          const notif = await Notification.create({
            text,
            task: task._id,
            sent_to: task.created_by,
          });

          task.activities.push(activity_data);
          await task.save();
        }
      }
    }

    await currentUser.save();

    const duration = Date.now() - start;
    userLogger.info("Logged hours successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID: taskId,
      duration,
      data_message: `Logged: ${hours} hours. Total hours logged today: ${loggedHoursToday}`,
    });
    if (transaction) transaction.end();

    res.status(200).json({ message: "Hours have been logged successfully!" });
  } catch (error) {
    userLogger.error("Error logging hours!", {
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
  const transaction = apm.startTransaction("User-[FetchDashboard]", "users");
  const traceId = apm?.currentTraceIds?.["trace.id"];

  try {
    const userID = req.user.id;

    userLogger.info("Fetching dashboard statistics", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/normal-user/get-dashboard-statistics",
      method: "POST",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      userLogger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

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

    const duration = Date.now() - start;
    userLogger.info("Fetch dashboard statistics successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(summary);
  } catch (error) {
    userLogger.error("Error fetching dashboard statistics!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};
