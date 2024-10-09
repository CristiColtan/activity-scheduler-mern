import { errorHandler } from "../utils/error.js";

import Task from "../models/task.model.js";
import User from "../models/user.model.js";

export const createTask = async (req, res, next) => {
  console.log(req.params);
  console.log(req.body);

  try {
    const userID = req.user.id;
    const {
      title,
      date,
      priority,
      stage,
      activities,
      subtasks,
      asseturls,
      team,
      is_trashed,
      created_by,
    } = req.body;

    const activity = {
      type: "assigned",
      description: "Created the task!",
      by: userID,
    };

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    const task = await Task.create({
      title,
      date,
      priority,
      stage,
      activities: activity,
      subtasks,
      asseturls,
      team,
      is_trashed,
      created_by,
    });

    return res.status(200).json(task);
  } catch (error) {
    console.error("Error creating task: ", error);
    next(error);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const userID = req.user.id;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    const task = await Task.findById(req.params.id)
      .populate("team")
      .populate("activities.by")
      .populate("created_by");

    if (!task) {
      return next(errorHandler(404, "Task not found!"));
    }

    const isCreator = task.created_by._id.toString() === userID;
    const isTeamMember = task.team.some(
      (member) => member._id.toString() === userID
    );

    console.log(isCreator, isTeamMember);

    if (!isCreator && !isTeamMember && currentUser.is_admin === "No") {
      return next(
        errorHandler(403, "You are not allowed to see task's details!")
      );
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const addActivity = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const { type, description, date } = req.body;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    const task = await Task.findById(req.params.id);
    if (!task) {
      return next(errorHandler(404, "Task not found!"));
    }

    const isCreator = task.created_by.toString() === userID;
    const isTeamMember = task.team.some(
      (member) => member.toString() === userID
    );

    if (!isCreator && !isTeamMember && currentUser.is_admin === "No") {
      return next(errorHandler(403, "You are not allowed to add activities!"));
    }

    const data = { type, description, date, by: userID };
    task.activities.push(data);

    await task.save();

    const updatedTask = await Task.findById(req.params.id).populate(
      "activities.by"
    );

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

export const addSubTask = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const { title, date, tag } = req.body;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    const task = await Task.findById(req.params.id);
    if (!task) {
      return next(errorHandler(404, "Task not found!"));
    }

    const isCreator = task.created_by.toString() === userID;
    if (!isCreator && currentUser.is_admin === "No") {
      return next(errorHandler(403, "You are not allowed to add subtasks!"));
    }

    const data = { title, date, tag };
    task.subtasks.push(data);
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const fetchAllTasks = async (req, res, next) => {
  try {
    const userID = req.user.id;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    let tasks;

    if (currentUser.is_admin === "Yes") {
      tasks = await Task.find({ is_trashed: "No" })
        .populate("team")
        .populate("created_by");
    } else if (currentUser.is_team_manager === "Yes") {
      tasks = await Task.find({ is_trashed: "No", created_by: userID })
        .populate("team")
        .populate("created_by");
    } else {
      tasks = await Task.find({ is_trashed: "No", team: userID })
        .populate("team")
        .populate("created_by");
    }

    res.status(200).json(tasks);
  } catch (error) {
    next(erorr);
  }
};

export const trashTask = async (req, res, next) => {
  try {
    const userID = req.user.id;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    const task = await Task.findById(req.params.id);
    if (!task) {
      return next(errorHandler(404, "Task not found!"));
    }

    const isCreator = task.created_by.toString() === userID;
    if (!isCreator && currentUser.is_admin === "No") {
      return next(errorHandler(403, "You are not allowed to trash this task!"));
    }

    task.is_trashed = "Yes";
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};
