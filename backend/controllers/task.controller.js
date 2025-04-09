import { errorHandler } from "../utils/error.js";

import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import AppSettings from "../models/app-settings.model.js";

import { logger } from "../utils/logger.js";
import { userLogger } from "../utils/logger.js";
import apm from "elastic-apm-node";

export const createTask = async (req, res, next) => {
  const start = Date.now();
  const transaction = apm.startTransaction("Task-[Create]", "tasks");
  const traceId = apm?.currentTraceIds?.["trace.id"];

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

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/create",
      method: "POST",
    });

    const activity = {
      type: "created task",
      by: userID,
    };

    logger.info("Creating task", {
      traceId,
      transactionId: transaction?.id,
      userID,
      title,
      priority,
      stage,
      created_by,
      teamSize: team?.length || 0,
    });

    //notify
    let text = "New task has been assigned to you";
    if (team?.length > 1) text = text + ` and ${team.length - 1} others`;

    text =
      text +
      `. The task priority is ${priority.toUpperCase()}. Check it and act accordingly. Task deadline: ${new Date(
        date
      ).toDateString()}.`;

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      logger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

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

    const duration = Date.now() - start;
    logger.info("Task created successfully", {
      traceId,
      transactionId: transaction?.id,
      taskID: task._id,
      userID,
      duration,
      title,
      priority,
      stage,
      teamSize: task.team?.length || 0,
    });
    if (transaction) transaction.end();

    return res.status(200).json(task);
  } catch (error) {
    console.error("Error creating task: ", error);
    logger.error("Error creating task", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction("Task-[Update]", "tasks");
    const traceId = apm?.currentTraceIds?.["trace.id"];

    const userID = req.user.id;

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/update/:id",
      method: "POST",
    });

    const currentUser = await User.findById(userID);

    if (!currentUser) {
      logger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    const task = await Task.findById(req.params.id).populate({
      path: "team",
      select: "-password",
    });

    if (!task) {
      logger.error("Task not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
        taskID: req.params.id,
      });
      return next(errorHandler(404, "Task not found!"));
    }

    const isCreator = task.created_by._id.toString() === userID;
    if (!isCreator && currentUser.is_admin === "No") {
      logger.error("Not allowed to edit the task!", {
        traceId,
        transactionId: transaction?.id,
        userID,
        taskID: task._id.toString(),
      });
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

    //daca sunt useri care au inceput sa munceasca, componenta echipei se mai poate modifica doar pentru a adauga un user nou,
    //nu se pot scoate useri care au muncit
    if (removedMembers.length > 0) {
      const membersWhoWorked = [];
      await Promise.all(
        removedMembers.map(async (memberId) => {
          const member = await User.findById(memberId);
          if (
            member &&
            member.work.some(
              (entry) => entry.task.toString() === task._id.toString()
            )
          ) {
            membersWhoWorked.push(memberId);
          }
        })
      );

      if (membersWhoWorked.length > 0) {
        logger.error(
          "Not allowed to edit the task! (Members have logged work)",
          {
            traceId,
            transactionId: transaction?.id,
            userID,
            taskID: task._id.toString(),
          }
        );
        return next(
          errorHandler(
            403,
            "Cannot edit task members because team members have logged work for it."
          )
        );
      }

      {
        /*if (removedMembers.length > 0 && membersWhoWorked.length > 0) {
        return next(
          errorHandler(
            403,
            "Cannot edit task members because team members have logged work for it."
          )
        );
      }*/
      }
    }

    logger.info("Updating task", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID: task._id.toString(),
      title: task.title,
      priority: task.priority,
      stage: task.stage,
      created_by: task.created_by,
      teamSize: task.team?.length || 0,
    });

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
      //daca membrul a lucrat la task, munca sa ii va ramane salvata, asa ca va trebui sa verificam in roles daca exista deja
      await Promise.all(
        newMembers.map(async (memberId) => {
          const member = await User.findById(memberId);

          const alreadyHasRole = member.roles.some((role) =>
            role.task.equals(task._id)
          );

          if (!alreadyHasRole) {
            await User.findByIdAndUpdate(memberId, {
              $push: {
                roles: { task: task._id, role: "Not assigned yet" },
              },
            });
          }
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

    const duration = Date.now() - start;
    logger.info("Task updated successfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID: updatedTask._id.toString(),
      title: updatedTask.title,
      priority: updatedTask.priority,
      stage: updatedTask.stage,
      created_by: updatedTask.created_by,
      teamSize: updatedTask.team?.length || 0,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(updatedTask);
  } catch (error) {
    logger.error("Error updating task!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const fetchUserRoles = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction("Task-[GetUserRoles]", "tasks");
    const traceId = apm?.currentTraceIds?.["trace.id"];

    const userID = req.user.id;

    userLogger.info("Getting user roles", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/get-user-roles",
      method: "GET",
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

    if (
      currentUser.is_admin !== "Yes" &&
      currentUser.is_team_manager !== "Yes"
    ) {
      userLogger.error("Not authorized!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(403, "You are not authorized!"));
    }

    const appsettings = await AppSettings.findOne();

    if (!appsettings) {
      userLogger.error("AppSettings not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "AppSettings not found!"));
    }

    const filteredRoles = appsettings.roles.filter(
      (role) => role !== "Task Coordinator"
    );
    const updatedRoles = [...filteredRoles, "Not assigned yet"];

    const duration = Date.now() - start;
    userLogger.info("User roles received sucessfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      duration,
    });
    if (transaction) transaction.end();

    return res.status(200).json(updatedRoles);
  } catch (error) {
    userLogger.error("Error getting user roles!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const editUserRole = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction(
      "Task-[EditUserRoleOnTask]",
      "tasks"
    );
    const traceId = apm?.currentTraceIds?.["trace.id"];

    console.log(req.body);
    const { role, userId, taskId } = req.body;
    const userID = req.user.id;

    userLogger.info("Editing user role", {
      traceId,
      transactionId: transaction?.id,
      userID,
      affectedUserID: userId,
      taskID: taskId,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/edit-user-role-on-task",
      method: "PUT",
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

    const taskMember = await User.findById(userId);
    if (!taskMember) {
      userLogger.error("Member not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "Member not found!"));
    }

    const hasLoggedHours = taskMember.work.some(
      (workEntry) => workEntry.task.toString() === taskId && workEntry.hours > 0
    );

    if (hasLoggedHours) {
      userLogger.error("Has already logged hours! Cannot change role!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(
        errorHandler(
          400,
          "Cannot change role. User has already logged hours for this task!"
        )
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        "roles.task": taskId,
      },
      { $set: { "roles.$.role": role } },
      { new: true }
    );

    if (!updatedUser)
      return next(errorHandler(404, "Task or Role not found for the user!"));

    //notify
    let text_role;
    text_role = `Your new task role: ${role.toUpperCase()}. Updated by ${
      currentUser.first_name + " " + currentUser.last_name
    }!`;

    const notif = await Notification.create({
      type: "message",
      task: taskId,
      text: text_role,
      sent_to: userId,
    });

    const duration = Date.now() - start;
    userLogger.info("User role edited sucessfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      affectedUserID: userId,
      taskID: taskId,
      data_message: `Changed role to ${role}`,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(updatedUser);
  } catch (error) {
    userLogger.error("Error getting user roles!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const getTaskEdit = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction(
      "Task-[GetTaskDetails-Edit]",
      "tasks"
    );
    const traceId = apm?.currentTraceIds?.["trace.id"];

    const userID = req.user.id;

    userLogger.info("Getting task details (edit)", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/get-task-edit/:id",
      method: "GET",
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

    const task = await Task.findById(req.params.id).populate({
      path: "team",
      select: "-password",
    });

    if (!task) {
      userLogger.error("Task not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "Task not found!"));
    }

    const isCreator = task.created_by._id.toString() === userID;
    const isTeamMember = task.team.some(
      (member) => member._id.toString() === userID
    );

    console.log(isCreator, isTeamMember);

    if (!isCreator && !isTeamMember && currentUser.is_admin === "No") {
      userLogger.error("Not authorized!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(
        errorHandler(403, "You are not allowed to see task's details!")
      );
    }

    const duration = Date.now() - start;
    userLogger.info("Task details (edit) received sucessfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(task);
  } catch (error) {
    userLogger.error("Error getting task details! (edit)", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction("Task-[GetTaskDetails]", "tasks");
    const traceId = apm?.currentTraceIds?.["trace.id"];

    const userID = req.user.id;

    userLogger.info("Getting task details", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/get/:id",
      method: "GET",
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
      userLogger.error("Task not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "Task not found!"));
    }

    const isCreator = task.created_by._id.toString() === userID;
    const isTeamMember = task.team.some(
      (member) => member._id.toString() === userID
    );

    console.log(isCreator, isTeamMember);

    if (!isCreator && !isTeamMember && currentUser.is_admin === "No") {
      userLogger.error("Not authorized!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(
        errorHandler(403, "You are not allowed to see task's details!")
      );
    }

    task.activities.reverse();

    const duration = Date.now() - start;
    userLogger.info("Task details received sucessfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(task);
  } catch (error) {
    userLogger.error("Error getting task details!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const addActivity = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction("Task-[AddActivity]", "tasks");
    const traceId = apm?.currentTraceIds?.["trace.id"];

    const userID = req.user.id;
    const { type, description, date } = req.body;

    userLogger.info("Adding activity", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID: req.params.id,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/add-activity/:id",
      method: "PUT",
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

    const task = await Task.findById(req.params.id);
    if (!task) {
      userLogger.error("Task not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "Task not found!"));
    }

    const isCreator = task.created_by.toString() === userID;
    const isTeamMember = task.team.some(
      (member) => member.toString() === userID
    );

    if (!isCreator && !isTeamMember && currentUser.is_admin === "No") {
      userLogger.error("Not authorized!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(403, "You are not allowed to add activities!"));
    }

    const currentUserRole = currentUser.roles.find(
      (role) => role.task.toString() === task._id.toString()
    );

    //verify if currentUser is team member && if current user's role is !== 'Not assigned yet' -> cant add activities
    if (isTeamMember && currentUserRole.role === "Not assigned yet") {
      userLogger.error("Not allowed!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(403, "You are not allowed to add activities!"));
    }

    const data = { type, description, date, by: userID };
    task.activities.push(data);

    await task.save();

    const updatedTask = await Task.findById(req.params.id).populate({
      path: "activities.by",
      select: "-password",
    });

    updatedTask.activities.reverse();

    const duration = Date.now() - start;
    userLogger.info("User added activity sucessfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID: req.params.id,
      data_message: `Activity type: ${type}, Description: ${description}`,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(updatedTask);
  } catch (error) {
    userLogger.error("Error adding activity!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const addSubTask = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction("Task-[AddSubtask]", "tasks");
    const traceId = apm?.currentTraceIds?.["trace.id"];

    const userID = req.user.id;
    const { title, date, tag } = req.body;

    userLogger.info("Adding subtask", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID: req.params.id,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/add-subtask/:id",
      method: "PUT",
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

    const task = await Task.findById(req.params.id);
    if (!task) {
      userLogger.error("Task not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "Task not found!"));
    }

    const isCreator = task.created_by.toString() === userID;
    if (!isCreator && currentUser.is_admin === "No") {
      userLogger.error("Not authorized!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(403, "You are not allowed to add subtasks!"));
    }

    //notify
    let text = `New subtask has been assigned to your team. Check it and act accordingly. Subtask deadline: ${new Date(
      date
    ).toDateString()}.`;

    const notif = await Notification.create({
      text,
      task: task._id,
      sent_to: task.team,
    });

    //add to timeline
    const activity_data = {
      type: "assigned",
      description: `subtask (${title}) to ${tag}`,
      date: new Date(),
      by: userID,
    };
    task.activities.push(activity_data);

    const data = { title, date, tag };
    task.subtasks.push(data);
    await task.save();

    const duration = Date.now() - start;
    userLogger.info("User added subtask sucessfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID: req.params.id,
      data_message: `Activity type: ${title}, Tag: ${tag}`,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(task);
  } catch (error) {
    userLogger.error("Error adding subtask!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const fetchAllTasks = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction("Task-[GetAllTasks]", "tasks");
    const traceId = apm?.currentTraceIds?.["trace.id"];

    const userID = req.user.id;

    userLogger.info("Getting all tasks", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/get-all-tasks",
      method: "GET",
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

    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    let priority = req.query.priority;
    if (!priority || priority === "any-priority") {
      priority = { $in: ["high", "medium", "normal", "low"] };
    }

    let status = req.query.status;
    if (!status || status === "any-status") {
      status = { $in: ["completed", "to do", "in progress"] };
    }

    const searchTerm = req.query.searchTerm || "";
    const sort = req.query.sort || "createdAt";
    const order = req.query.order || "desc";

    let tasks;

    if (currentUser.is_admin === "Yes") {
      tasks = await Task.find({
        title: { $regex: searchTerm, $options: "i" },
        is_trashed: "No",
        priority,
        stage: status,
      })
        .populate({
          path: "team",
          select: "-password",
        })
        .populate({ path: "created_by", select: "-password" })
        .sort({ [sort]: order })
        .limit(limit)
        .skip(startIndex);
    } else if (currentUser.is_team_manager === "Yes") {
      tasks = await Task.find({
        title: { $regex: searchTerm, $options: "i" },
        is_trashed: "No",
        created_by: userID,
        priority,
        stage: status,
      })
        .populate({
          path: "team",
          select: "-password",
        })
        .populate({ path: "created_by", select: "-password" })
        .sort({ [sort]: order })
        .limit(limit)
        .skip(startIndex);
    } else {
      tasks = await Task.find({
        title: { $regex: searchTerm, $options: "i" },
        is_trashed: "No",
        team: userID,
        priority,
        stage: status,
      })
        .populate({
          path: "team",
          select: "-password",
        })
        .populate({ path: "created_by", select: "-password" })
        .sort({ [sort]: order })
        .limit(limit)
        .skip(startIndex);
    }

    const duration = Date.now() - start;
    userLogger.info("User received all tasks sucessfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(tasks);
  } catch (error) {
    userLogger.error("Error getting all tasks!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const trashTask = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction("Task-[Trash]", "tasks");
    const traceId = apm?.currentTraceIds?.["trace.id"];

    const userID = req.user.id;

    logger.info("Trashing task", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID: req.params.id,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/trash-task/:id",
      method: "PUT",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      logger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      logger.error("Task not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "Task not found!"));
    }

    const isCreator = task.created_by.toString() === userID;
    if (!isCreator && currentUser.is_admin === "No") {
      logger.error("Not authorized!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(403, "You are not allowed to trash this task!"));
    }

    task.is_trashed = "Yes";
    await task.save();

    const duration = Date.now() - start;
    logger.info("Trashed task sucessfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID: req.params.id,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(task);
  } catch (error) {
    logger.error("Error trashing task!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction("Task-[Delete]", "tasks");
    const traceId = apm?.currentTraceIds?.["trace.id"];

    const userID = req.user.id;

    logger.info("Deleting task", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID: req.params.id,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/delete-task/:id",
      method: "DELETE",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      logger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      logger.error("Task not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "Task not found!"));
    }

    const isCreator = task.created_by.toString() === userID;
    if (!isCreator && currentUser.is_admin === "No") {
      logger.error("Not authorized!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(
        errorHandler(403, "You are not allowed to delete this task!")
      );
    }

    const teamMembers = task.team.map((member) => member._id.toString());

    //verify daca cineva a muncit la acest task, daca da nu se poate sterge definitiv
    const membersWhoWorked = [];
    await Promise.all(
      teamMembers.map(async (memberId) => {
        const member = await User.findById(memberId);
        if (
          member &&
          member.work.some(
            (entry) => entry.task.toString() === task._id.toString()
          )
        ) {
          membersWhoWorked.push(memberId);
        }
      })
    );

    if (membersWhoWorked.length > 0) {
      logger.error("Not allowed! Members have logged work hours!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(
        errorHandler(
          403,
          "Cannot delete task because team members have logged work hours for it."
        )
      );
    }

    if (teamMembers.length > 0) {
      await Promise.all(
        teamMembers.map(async (memberId) => {
          await User.findByIdAndUpdate(memberId, {
            $pull: {
              roles: { task: task._id },
            },
          });
        })
      );
    }

    await User.findByIdAndUpdate(task.created_by, {
      $pull: {
        roles: { task: task._id },
      },
    });

    await Task.findByIdAndDelete(req.params.id);

    const duration = Date.now() - start;
    logger.info("Deleted task sucessfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID: req.params.id,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json({ message: "Success!" });
  } catch (error) {
    logger.error("Error trashing task!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const deleteAllTasks = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction("Task-[DeleteAll]", "tasks");
    const traceId = apm?.currentTraceIds?.["trace.id"];

    const userID = req.user.id;
    const { tasks } = req.body;

    logger.info("Deleting all tasks", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/delete-all-tasks",
      method: "DELETE",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      logger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    for (let task of tasks) {
      const found_task = await Task.findById(task._id);

      if (!found_task) {
        logger.error(`TaskID: ${task._id} not found!`, {
          traceId,
          transactionId: transaction?.id,
          userID,
        });
        return next(errorHandler(404, `Task with ID ${task._id} not found!`));
      }

      const isCreator = found_task.created_by.toString() === userID;
      if (!isCreator && currentUser.is_admin === "No") {
        logger.error("Not authorized!", {
          traceId,
          transactionId: transaction?.id,
          userID,
        });
        return next(
          errorHandler(
            403,
            `You are not allowed to delete task with ID ${found_task._id}`
          )
        );
      }

      const teamMembers = found_task.team.map((member) =>
        member._id.toString()
      );

      //verify daca cineva a muncit la acest task, daca da nu se poate sterge definitiv
      const membersWhoWorked = [];
      await Promise.all(
        teamMembers.map(async (memberId) => {
          const member = await User.findById(memberId);
          if (
            member &&
            member.work.some(
              (entry) => entry.task.toString() === found_task._id.toString()
            )
          ) {
            membersWhoWorked.push(memberId);
          }
        })
      );

      if (membersWhoWorked.length > 0) {
        logger.error("Not allowed! Members have logged work hours!", {
          traceId,
          transactionId: transaction?.id,
          userID,
        });
        return next(
          errorHandler(
            403,
            "Cannot delete task because team members have logged work for it."
          )
        );
      }

      if (teamMembers.length > 0) {
        await Promise.all(
          teamMembers.map(async (memberId) => {
            await User.findByIdAndUpdate(memberId, {
              $pull: {
                roles: { task: found_task._id },
              },
            });
          })
        );
      }

      await User.findByIdAndUpdate(found_task.created_by, {
        $pull: {
          roles: { task: found_task._id },
        },
      });

      await Task.findByIdAndDelete(found_task._id);
    }

    const duration = Date.now() - start;
    logger.info("Deleted all tasks sucessfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json({ message: "Success!" });
  } catch (error) {
    logger.error("Error deleting all tasks!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const restoreTask = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction("Task-[Restore]", "tasks");
    const traceId = apm?.currentTraceIds?.["trace.id"];

    const userID = req.user.id;

    logger.info("Restoring task", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID: req.params.id,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/restore-task/:id",
      method: "PUT",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      logger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      logger.error("Task not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "Task not found!"));
    }

    const isCreator = task.created_by.toString() === userID;
    if (!isCreator && currentUser.is_admin === "No") {
      logger.error("Not authorized!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(
        errorHandler(403, "You are not allowed to restore this task!")
      );
    }

    task.is_trashed = "No";
    await task.save();

    const duration = Date.now() - start;
    logger.info("Restored task sucessfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID: req.params.id,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(task);
  } catch (error) {
    logger.error("Error restoring task!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const restoreAllTasks = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction("Task-[RestoreAll]", "tasks");
    const traceId = apm?.currentTraceIds?.["trace.id"];

    const userID = req.user.id;
    const { tasks } = req.body;

    logger.info("Restoring all tasks", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/restore-all-tasks",
      method: "PUT",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      logger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    for (let task of tasks) {
      const found_task = await Task.findById(task._id);

      if (!found_task) {
        logger.error(`TaskID: ${task._id} not found!`, {
          traceId,
          transactionId: transaction?.id,
          userID,
        });
        return next(errorHandler(404, `Task with ID ${task._id} not found!`));
      }

      const isCreator = found_task.created_by.toString() === userID;
      if (!isCreator && currentUser.is_admin === "No") {
        logger.error("Not authorized!", {
          traceId,
          transactionId: transaction?.id,
          userID,
        });
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

    const duration = Date.now() - start;
    logger.info("Restored all tasks sucessfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json({ message: "Success!" });
  } catch (error) {
    logger.error("Error restoring all tasks!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const fetchAllCompletedTasks = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction(
      "Task-[GetAllCompletedTasks]",
      "tasks"
    );
    const traceId = apm?.currentTraceIds?.["trace.id"];

    const userID = req.user.id;

    userLogger.info("Getting all completed tasks", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/get-all-completed-tasks",
      method: "GET",
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
    const duration = Date.now() - start;
    userLogger.info("Received all completed tasks sucessfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(tasks);
  } catch (error) {
    userLogger.error("Error getting all completed tasks!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const fetchAllInProgressTasks = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction(
      "Task-[GetAllInProgressTasks]",
      "tasks"
    );
    const traceId = apm?.currentTraceIds?.["trace.id"];

    const userID = req.user.id;

    userLogger.info("Getting all in progress tasks", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/get-all-in-progress-tasks",
      method: "GET",
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

    const duration = Date.now() - start;
    userLogger.info("Received all in progress tasks sucessfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(tasks);
  } catch (error) {
    userLogger.error("Error getting all in progress tasks!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const fetchAllToDoTasks = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction("Task-[GetAllToDoTasks]", "tasks");
    const traceId = apm?.currentTraceIds?.["trace.id"];

    const userID = req.user.id;

    userLogger.info("Getting all to do tasks", {
      traceId,
      transactionId: transaction?.id,
      userID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/get-all-to-do-tasks",
      method: "GET",
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

    const duration = Date.now() - start;
    userLogger.info("Received all to do tasks sucessfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(tasks);
  } catch (error) {
    userLogger.error("Error getting all to do tasks!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const duplicateTask = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction("Task-[Duplicate]", "tasks");
    const traceId = apm?.currentTraceIds?.["trace.id"];

    const userID = req.user.id;

    logger.info("Duplicating task", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID: req.params.id,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/duplicate-task/:id",
      method: "PUT",
    });

    const currentUser = await User.findById(userID);
    if (!currentUser) {
      logger.error("User not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "User not found!"));
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      logger.error("Task not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "Task not found!"));
    }

    const isCreator = task.created_by.toString() === userID;
    if (!isCreator && currentUser.is_admin === "No") {
      logger.error("Not authorized!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(
        errorHandler(403, "You are not allowed to duplicate this task!")
      );
    }

    const taskData = task.toObject();
    delete taskData._id;

    const membersWhoWorked = [];
    await Promise.all(
      taskData.team.map(async (memberId) => {
        const member = await User.findById(memberId);
        if (
          member &&
          member.work.some(
            (entry) => entry.task.toString() === task._id.toString()
          )
        ) {
          membersWhoWorked.push(memberId);
        }
      })
    );

    if (membersWhoWorked.length > 0) {
      logger.error("Not allowed! Members have logged work hours!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(
        errorHandler(
          403,
          "Cannot duplicate task because team members have logged work for it."
        )
      );
    }

    //notify
    let text = "New task has been assigned to you";
    if (taskData.team?.length > 1)
      text = text + ` and ${taskData.team.length - 1} others`;

    text =
      text +
      `. The task priority is ${taskData.priority.toUpperCase()}. Check it and act accordingly. Task deadline: ${new Date(
        taskData.date
      ).toDateString()}.`;

    const duplicatedTask = await Task.create({
      ...taskData,
      title: "Copy of - " + task.title,
    });

    const notif = await Notification.create({
      text,
      task: duplicatedTask._id,
      sent_to: duplicatedTask.team,
    });

    await Promise.all(
      duplicatedTask.team.map(async (memberId) => {
        await User.findByIdAndUpdate(memberId, {
          $push: {
            roles: { task: duplicatedTask._id, role: "Not assigned yet" },
          },
        });
      })
    );

    await User.findByIdAndUpdate(duplicatedTask.created_by, {
      $push: {
        roles: { task: duplicatedTask._id, role: "Task Coordinator" },
      },
    });

    const duplicatedDuplicatedTask = await Task.findById(duplicatedTask._id)
      .populate({
        path: "team",
        select: "-password",
      })
      .populate({ path: "created_by", select: "-password" });

    const duration = Date.now() - start;
    logger.info("Duplicated task sucessfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID: duplicatedDuplicatedTask._id.toString(),
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(duplicatedDuplicatedTask);
  } catch (error) {
    userLogger.error("Error duplicating task!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const editSubtask = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction("Task-[EditSubtask]", "tasks");
    const traceId = apm?.currentTraceIds?.["trace.id"];

    console.log(req.body);
    const { formData, taskID, subtaskIndex } = req.body;

    const userID = req.user.id;

    userLogger.info("Editing subtask", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/edit-task-details-subtask",
      method: "PUT",
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

    if (
      currentUser.is_admin !== "Yes" &&
      currentUser.is_team_manager !== "Yes"
    ) {
      userLogger.error("Not authorized!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(403, "You are not allowed to edit subtasks!"));
    }

    const task = await Task.findById(taskID);
    if (!task) {
      userLogger.error("Task not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "Task not found!"));
    }

    if (subtaskIndex < 0 || subtaskIndex >= task.subtasks.length) {
      userLogger.error("Invalid index!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(400, "Invalid index!"));
    }

    if (formData.title) task.subtasks[subtaskIndex].title = formData.title;
    if (formData.date) task.subtasks[subtaskIndex].date = formData.date;

    await task.save();

    const duration = Date.now() - start;
    userLogger.info("User edited subtask sucessfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID,
      data_message: `Changed title to: ${task.title} and date to: ${task.subtasks[subtaskIndex].date}`,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(task);
  } catch (error) {
    userLogger.error("Error editing subtask!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const deleteSubtask = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction("Task-[DeleteSubtask]", "tasks");
    const traceId = apm?.currentTraceIds?.["trace.id"];

    console.log(req.body);
    const { taskID, subtaskIndex } = req.body;

    const userID = req.user.id;

    userLogger.info("Deleting subtask", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/delete-task-details-subtask",
      method: "PUT",
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

    if (
      currentUser.is_admin !== "Yes" &&
      currentUser.is_team_manager !== "Yes"
    ) {
      userLogger.error("Not authorized!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(403, "You are not allowed to delete subtasks!"));
    }

    const task = await Task.findById(taskID);
    if (!task) {
      userLogger.error("Task not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "Task not found!"));
    }

    if (subtaskIndex < 0 || subtaskIndex >= task.subtasks.length) {
      userLogger.error("Invalid index!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(400, "Invalid index!"));
    }

    task.subtasks.splice(subtaskIndex, 1);
    await task.save();

    const duration = Date.now() - start;
    userLogger.info("User deleted subtask sucessfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID,
      data_message: `Deleted index: ${subtaskIndex}`,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(task);
  } catch (error) {
    userLogger.error("Error deleting subtask!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const editActivity = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction("Task-[EditActivity]", "tasks");
    const traceId = apm?.currentTraceIds?.["trace.id"];

    console.log(req.body);
    const { formData, taskID, activityIndex } = req.body;

    const userID = req.user.id;

    userLogger.info("Editing activity", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/edit-task-details-activity",
      method: "PUT",
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

    const task = await Task.findById(taskID).populate({
      path: "activities.by",
      select: "-password",
    });
    if (!task) {
      userLogger.error("Task not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "Task not found!"));
    }

    if (activityIndex < 0 || activityIndex >= task.activities.length) {
      userLogger.error("Invalid index!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(400, "Invalid index!"));
    }

    /*console.log(
      task.activities[
        task.activities.length - activityIndex - 1
      ].by._id.toString()
    );
    console.log(currentUser._id.toString());*/

    if (
      currentUser.is_admin !== "Yes" &&
      currentUser._id.toString() !==
        task.activities[
          task.activities.length - activityIndex - 1
        ].by._id.toString()
    ) {
      userLogger.error("Not authorized!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(403, "You are not allowed to edit activity!"));
    }

    if (formData.description)
      task.activities[task.activities.length - activityIndex - 1].description =
        formData.description;

    await task.save();

    task.activities.reverse();

    const duration = Date.now() - start;
    userLogger.info("User edited activity sucessfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID,
      data_message: `Changed description to: ${formData.description}`,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(task);
  } catch (error) {
    userLogger.error("Error editing activity!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};

export const deleteActivity = async (req, res, next) => {
  try {
    const start = Date.now();
    const transaction = apm.startTransaction("Task-[DeleteActivity]", "tasks");
    const traceId = apm?.currentTraceIds?.["trace.id"];

    console.log(req.body);
    const { taskID, activityIndex } = req.body;

    const userID = req.user.id;

    userLogger.info("Deleting activity", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID,
    });

    transaction?.addLabels({
      userID,
      endpoint: "/backend/task/delete-task-details-activity",
      method: "PUT",
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

    const task = await Task.findById(taskID).populate({
      path: "activities.by",
      select: "-password",
    });
    if (!task) {
      userLogger.error("Task not found!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(404, "Task not found!"));
    }

    if (activityIndex < 0 || activityIndex >= task.activities.length) {
      userLogger.error("Invalid index!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(400, "Invalid index!"));
    }

    if (
      currentUser.is_admin !== "Yes" &&
      currentUser._id.toString() !==
        task.activities[
          task.activities.length - activityIndex - 1
        ].by._id.toString()
    ) {
      userLogger.error("Not authorized!", {
        traceId,
        transactionId: transaction?.id,
        userID,
      });
      return next(errorHandler(403, "You are not allowed to delete activity!"));
    }

    task.activities.splice(task.activities.length - activityIndex - 1, 1);
    await task.save();

    task.activities.reverse();

    const duration = Date.now() - start;
    userLogger.info("User deleted activity sucessfully!", {
      traceId,
      transactionId: transaction?.id,
      userID,
      taskID,
      data_message: `Deleted index: ${activityIndex}`,
      duration,
    });
    if (transaction) transaction.end();

    res.status(200).json(task);
  } catch (error) {
    userLogger.error("Error deleting activity!", {
      traceId,
      transactionId: transaction?.id,
      error: error.message,
    });
    if (transaction) transaction.end();
    next(error);
  }
};
