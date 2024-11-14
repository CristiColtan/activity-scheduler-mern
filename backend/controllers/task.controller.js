import { errorHandler } from "../utils/error.js";

import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

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

    //notify
    let text = "New task has been assigned to you";
    if (team?.length > 1) text = text + ` and ${team.length - 1} others`;

    text =
      text +
      `. The task priority is ${priority.toUpperCase()}. Check it and act accordingly. Task deadline: ${new Date(
        date
      ).toDateString()}.`;

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

    const notif = await Notification.create({
      text,
      task: task._id,
      sent_to: team,
    });

    await Promise.all(
      team.map(async (memberId) => {
        await User.findByIdAndUpdate(memberId, {
          $push: {
            roles: { task: task._id, role: "Not assigned yet" },
          },
        });
      })
    );

    await User.findByIdAndUpdate(created_by, {
      $push: {
        roles: { task: task._id, role: "Task Coordinator" },
      },
    });

    return res.status(200).json(task);
  } catch (error) {
    console.error("Error creating task: ", error);
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const userID = req.user.id;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    const task = await Task.findById(req.params.id).populate({
      path: "team",
      select: "-password",
    });

    if (!task) {
      return next(errorHandler(404, "Task not found!"));
    }

    const isCreator = task.created_by._id.toString() === userID;
    if (!isCreator && currentUser.is_admin === "No") {
      return next(errorHandler(403, "You are not allowed to edit this task!"));
    }

    //verificam daca exista membri diferiti fata de cei anteriori
    const existingTeamIds = task.team.map((member) => member._id.toString());
    const newTeamIds = req.body.team.map((memberId) => memberId.toString());
    const newMembers = req.body.team.filter(
      (memberId) => !existingTeamIds.includes(memberId.toString())
    );

    const removedMembers = existingTeamIds.filter(
      (memberId) => !newTeamIds.includes(memberId)
    );

    if (newMembers.length > 0) {
      //notify
      let text = "New task has been assigned to you";
      if (newMembers.length > 1)
        text = text + ` and ${newMembers.length - 1} others`;

      text =
        text +
        `. The task priority is ${
          req.body.priority?.toUpperCase() || task.priority.toUpperCase()
        }. Check it and act accordingly. Task deadline: ${new Date(
          req.body.date || task.date
        ).toDateString()}.`;

      await Notification.create({
        text,
        task: task._id,
        sent_to: newMembers,
      });

      //roles to new members
      await Promise.all(
        newMembers.map(async (memberId) => {
          await User.findByIdAndUpdate(memberId, {
            $push: {
              roles: { task: task._id, role: "Not assigned yet" },
            },
          });
        })
      );
    }

    if (removedMembers.length > 0) {
      await Promise.all(
        removedMembers.map(async (memberId) => {
          await User.findByIdAndUpdate(memberId, {
            $pull: {
              roles: { task: task._id },
            },
          });
        })
      );
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

export const getTaskEdit = async (req, res, next) => {
  try {
    const userID = req.user.id;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    const task = await Task.findById(req.params.id).populate({
      path: "team",
      select: "-password",
    });

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

export const getTask = async (req, res, next) => {
  try {
    const userID = req.user.id;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    const task = await Task.findById(req.params.id)
      .populate({
        path: "team",
        select: "-password",
      })
      .populate({
        path: "activities.by",
        select: "-password",
      })
      .populate({ path: "created_by", select: "-password" });

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

    const updatedTask = await Task.findById(req.params.id).populate({
      path: "activities.by",
      select: "-password",
    });

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
        .populate({
          path: "team",
          select: "-password",
        })
        .populate({ path: "created_by", select: "-password" });
    } else if (currentUser.is_team_manager === "Yes") {
      tasks = await Task.find({ is_trashed: "No", created_by: userID })
        .populate({
          path: "team",
          select: "-password",
        })
        .populate({ path: "created_by", select: "-password" });
    } else {
      tasks = await Task.find({ is_trashed: "No", team: userID })
        .populate({
          path: "team",
          select: "-password",
        })
        .populate({ path: "created_by", select: "-password" });
    }

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
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

export const deleteTask = async (req, res, next) => {
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
      return next(
        errorHandler(403, "You are not allowed to delete this task!")
      );
    }

    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Success!" });
  } catch (error) {
    next(error);
  }
};

export const deleteAllTasks = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const { tasks } = req.body;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    for (let task of tasks) {
      const found_task = await Task.findById(task._id);

      if (!found_task)
        return next(errorHandler(404, `Task with ID ${task._id} not found!`));

      const isCreator = found_task.created_by.toString() === userID;
      if (!isCreator && currentUser.is_admin === "No") {
        return next(
          errorHandler(
            403,
            `You are not allowed to delete task with ID ${found_task._id}`
          )
        );
      }

      await Task.findByIdAndDelete(found_task._id);
    }

    res.status(200).json({ message: "Success!" });
  } catch (error) {
    next(error);
  }
};

export const restoreTask = async (req, res, next) => {
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
      return next(
        errorHandler(403, "You are not allowed to restore this task!")
      );
    }

    task.is_trashed = "No";
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const restoreAllTasks = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const { tasks } = req.body;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    for (let task of tasks) {
      const found_task = await Task.findById(task._id);

      if (!found_task)
        return next(errorHandler(404, `Task with ID ${task._id} not found!`));

      const isCreator = found_task.created_by.toString() === userID;
      if (!isCreator && currentUser.is_admin === "No") {
        return next(
          errorHandler(
            403,
            `You are not allowed to delete task with ID ${found_task._id}`
          )
        );
      }

      found_task.is_trashed = "No";
      await found_task.save();
    }
    res.status(200).json({ message: "Success!" });
  } catch (error) {
    next(error);
  }
};

export const fetchAllCompletedTasks = async (req, res, next) => {
  try {
    const userID = req.user.id;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    let tasks;

    if (currentUser.is_admin === "Yes") {
      tasks = await Task.find({ is_trashed: "No", stage: "completed" })
        .populate({
          path: "team",
          select: "-password",
        })
        .populate({ path: "created_by", select: "-password" });
    } else if (currentUser.is_team_manager === "Yes") {
      tasks = await Task.find({
        is_trashed: "No",
        created_by: userID,
        stage: "completed",
      })
        .populate({
          path: "team",
          select: "-password",
        })
        .populate({ path: "created_by", select: "-password" });
    } else {
      tasks = await Task.find({
        is_trashed: "No",
        team: userID,
        stage: "completed",
      })
        .populate({
          path: "team",
          select: "-password",
        })
        .populate({ path: "created_by", select: "-password" });
    }

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const fetchAllInProgressTasks = async (req, res, next) => {
  try {
    const userID = req.user.id;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    let tasks;

    if (currentUser.is_admin === "Yes") {
      tasks = await Task.find({ is_trashed: "No", stage: "in progress" })
        .populate({
          path: "team",
          select: "-password",
        })
        .populate({ path: "created_by", select: "-password" });
    } else if (currentUser.is_team_manager === "Yes") {
      tasks = await Task.find({
        is_trashed: "No",
        created_by: userID,
        stage: "in progress",
      })
        .populate({
          path: "team",
          select: "-password",
        })
        .populate({ path: "created_by", select: "-password" });
    } else {
      tasks = await Task.find({
        is_trashed: "No",
        team: userID,
        stage: "in progress",
      })
        .populate({
          path: "team",
          select: "-password",
        })
        .populate({ path: "created_by", select: "-password" });
    }

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const fetchAllToDoTasks = async (req, res, next) => {
  try {
    const userID = req.user.id;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    let tasks;

    if (currentUser.is_admin === "Yes") {
      tasks = await Task.find({ is_trashed: "No", stage: "to do" })
        .populate({
          path: "team",
          select: "-password",
        })
        .populate({ path: "created_by", select: "-password" });
    } else if (currentUser.is_team_manager === "Yes") {
      tasks = await Task.find({
        is_trashed: "No",
        created_by: userID,
        stage: "to do",
      })
        .populate({
          path: "team",
          select: "-password",
        })
        .populate({ path: "created_by", select: "-password" });
    } else {
      tasks = await Task.find({
        is_trashed: "No",
        team: userID,
        stage: "to do",
      })
        .populate({
          path: "team",
          select: "-password",
        })
        .populate({ path: "created_by", select: "-password" });
    }

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const duplicateTask = async (req, res, next) => {
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
      return next(
        errorHandler(403, "You are not allowed to duplicate this task!")
      );
    }

    const taskData = task.toObject();
    delete taskData._id;

    const duplicatedTask = await Task.create({
      ...taskData,
      title: "Copy of - " + task.title,
    });

    const duplicatedDuplicatedTask = await Task.findById(duplicatedTask._id)
      .populate({
        path: "team",
        select: "-password",
      })
      .populate({ path: "created_by", select: "-password" });

    res.status(200).json(duplicatedDuplicatedTask);
  } catch (error) {
    next(error);
  }
};
