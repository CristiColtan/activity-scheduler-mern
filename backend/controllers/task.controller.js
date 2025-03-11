import { errorHandler } from "../utils/error.js";

import Task from "../models/task.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import AppSettings from "../models/app-settings.model.js";

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
      type: "created task",
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

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

export const fetchUserRoles = async (req, res, next) => {
  try {
    const userID = req.user.id;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_admin !== "Yes" && currentUser.is_team_manager !== "Yes")
      return next(errorHandler(403, "You are not authorized!"));

    const appsettings = await AppSettings.findOne();
    if (!appsettings) return next(errorHandler(404, "AppSettings not found!"));

    const filteredRoles = appsettings.roles.filter(
      (role) => role !== "Task Coordinator"
    );
    const updatedRoles = [...filteredRoles, "Not assigned yet"];

    return res.status(200).json(updatedRoles);
  } catch (error) {
    next(error);
  }
};

export const editUserRole = async (req, res, next) => {
  try {
    console.log(req.body);
    const { role, userId, taskId } = req.body;
    const userID = req.user.id;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    const taskMember = await User.findById(userId);
    if (!taskMember) return next(errorHandler(404, "Member not found!"));

    const hasLoggedHours = taskMember.work.some(
      (workEntry) => workEntry.task.toString() === taskId && workEntry.hours > 0
    );

    if (hasLoggedHours)
      return next(
        errorHandler(
          400,
          "Cannot change role. User has already logged hours for this task!"
        )
      );

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

    res.status(200).json(updatedUser);
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

    task.activities.reverse();

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

    const currentUserRole = currentUser.roles.find(
      (role) => role.task.toString() === task._id.toString()
    );

    //verify if currentUser is team member && if current user's role is !== 'Not assigned yet' -> cant add activities
    if (isTeamMember && currentUserRole.role === "Not assigned yet") {
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

    res.status(200).json(duplicatedDuplicatedTask);
  } catch (error) {
    next(error);
  }
};

export const editSubtask = async (req, res, next) => {
  try {
    console.log(req.body);
    const { formData, taskID, subtaskIndex } = req.body;

    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_admin !== "Yes" && currentUser.is_team_manager !== "Yes")
      return next(errorHandler(403, "You are not allowed to edit subtasks!"));

    const task = await Task.findById(taskID);
    if (!task) return next(errorHandler(404, "Task not found!"));

    if (subtaskIndex < 0 || subtaskIndex >= task.subtasks.length)
      return next(errorHandler(400, "Invalid index!"));

    if (formData.title) task.subtasks[subtaskIndex].title = formData.title;
    if (formData.date) task.subtasks[subtaskIndex].date = formData.date;

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteSubtask = async (req, res, next) => {
  try {
    console.log(req.body);
    const { taskID, subtaskIndex } = req.body;

    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_admin !== "Yes" && currentUser.is_team_manager !== "Yes")
      return next(errorHandler(403, "You are not allowed to edit subtasks!"));

    const task = await Task.findById(taskID);
    if (!task) return next(errorHandler(404, "Task not found!"));

    if (subtaskIndex < 0 || subtaskIndex >= task.subtasks.length)
      return next(errorHandler(400, "Invalid index!"));

    task.subtasks.splice(subtaskIndex, 1);
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const editActivity = async (req, res, next) => {
  try {
    console.log(req.body);
    const { formData, taskID, activityIndex } = req.body;

    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    const task = await Task.findById(taskID).populate({
      path: "activities.by",
      select: "-password",
    });
    if (!task) return next(errorHandler(404, "Task not found!"));

    if (activityIndex < 0 || activityIndex >= task.activities.length)
      return next(errorHandler(400, "Invalid index!"));

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
    )
      return next(errorHandler(403, "You are not allowed to edit activity!"));

    if (formData.description)
      task.activities[task.activities.length - activityIndex - 1].description =
        formData.description;

    await task.save();

    task.activities.reverse();

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const deleteActivity = async (req, res, next) => {
  try {
    console.log(req.body);
    const { taskID, activityIndex } = req.body;

    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    const task = await Task.findById(taskID).populate({
      path: "activities.by",
      select: "-password",
    });
    if (!task) return next(errorHandler(404, "Task not found!"));

    if (activityIndex < 0 || activityIndex >= task.activities.length)
      return next(errorHandler(400, "Invalid index!"));

    if (
      currentUser.is_admin !== "Yes" &&
      currentUser._id.toString() !==
        task.activities[
          task.activities.length - activityIndex - 1
        ].by._id.toString()
    )
      return next(errorHandler(403, "You are not allowed to edit activity!"));

    task.activities.splice(task.activities.length - activityIndex - 1, 1);
    await task.save();

    task.activities.reverse();

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};
