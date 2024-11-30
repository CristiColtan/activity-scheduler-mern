import { errorHandler } from "../utils/error.js";

import User from "../models/user.model.js";
import Task from "../models/task.model.js";
import AppSettings from "../models/app-settings.model.js";
import Notification from "../models/notification.model.js";

export const getTeamManagers = async (req, res, next) => {
  try {
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

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getNormalUsers = async (req, res, next) => {
  try {
    const users = await User.find({
      is_admin: "No",
      is_team_manager: "No",
    }).select("-password");

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ is_admin: "No", is_team_manager: "No" })
      .select("-password")
      .populate({
        path: "roles.task",
        select: "title stage priority is_trashed",
      });

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const userID = req.user.id;

    console.log(req.body);

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

    const appsettings = await AppSettings.findOne();

    if (!appsettings.roles.includes(role)) {
      return next(errorHandler(401, "User role doesn't exist!"));
    }

    if (role === "Task Coordinator")
      return next(
        errorHandler(
          401,
          "The 'Task Coordinator' role is crucial! You can't delete it!"
        )
      );

    appsettings.roles = appsettings.roles.filter((r) => r !== role);
    await appsettings.save();

    res.status(200).json(appsettings.roles);
  } catch (error) {
    next(error);
  }
};

export const fetchRoles = async (req, res, next) => {
  try {
    const userID = req.user.id;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

    const appsettings = await AppSettings.findOne();
    if (!appsettings) return next(errorHandler(404, "AppSettings not found!"));

    return res.status(200).json(appsettings.roles);
  } catch (error) {
    next(error);
  }
};

export const addRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const userID = req.user.id;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

    const appsettings = await AppSettings.findOne();

    if (appsettings.roles.includes(role)) {
      return next(errorHandler(401, "User role already exists!"));
    }

    if (role === "" || !role)
      return next(errorHandler(401, "Enter a valid role!"));

    appsettings.roles.push(role);
    await appsettings.save();

    res.status(200).json(appsettings.roles);
  } catch (error) {
    next(error);
  }
};

export const addTeamManager = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const { membersID } = req.body;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

    let newMembers = [];
    for (let memberID of membersID) {
      const member = await User.findById(memberID);
      if (!member)
        return next(errorHandler(404, `Member with ID ${member} not found!`));

      if (member.is_team_manager === "Yes")
        return next(
          errorHandler(400, `Member with ID ${member} is already team-manager!`)
        );

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

    res.status(200).json({ message: "Success!" });
  } catch (error) {
    next(error);
  }
};

export const removeTeamManager = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const { memberID } = req.body;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

    const member = await User.findById(memberID);
    if (!member)
      return next(errorHandler(404, `Member with ID ${member} not found!`));

    if (member.is_team_manager === "No")
      return next(
        errorHandler(400, `Member with ID ${member} is not a team-manager!`)
      );

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

    res.status(200).json({ message: "Success!" });
  } catch (error) {
    next(error);
  }
};

export const editUser = async (req, res, next) => {
  try {
    const memberID = req.params.id;
    const userID = req.user.id;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You're not an admin!"));

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

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

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
  try {
    const userID = req.user.id;
    const { memberID } = req.body;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

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

    if (!member)
      return next(errorHandler(404, `Member with ID ${member} not found!`));

    if (member.is_active === "Yes") {
      member.is_active = "No";
      member.title = "Inactive";
    } else if (member.is_active === "No") {
      member.is_active = "Yes";
      if (member.is_team_manager === "Yes") member.title = "Team Manager";
      else member.title = "Normal User";
    }

    await member.save();

    res.status(200).json(member);
  } catch (error) {
    next(error);
  }
};

export const makeAccountActiveOrInactive = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const { memberID } = req.body;

    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

    const member = await User.findById(memberID)
      .populate({
        path: "roles.task",
        select: "title stage priority is_trashed",
      })
      .select("-password");

    if (!member)
      return next(errorHandler(404, `Member with ID ${member} not found!`));

    if (member.is_active === "Yes") {
      member.is_active = "No";
      member.title = "Inactive";
    } else if (member.is_active === "No") {
      member.is_active = "Yes";
      if (member.is_team_manager === "Yes") member.title = "Team Manager";
      else member.title = "Normal User";
    }

    await member.save();
    res.status(200).json({ message: "Success!" });
  } catch (error) {
    next(error);
  }
};

export const fetchAllTasksPopulated = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

    const populateOptions = [
      { path: "team", select: "-password" },
      { path: "created_by", select: "-password" },
      { path: "activities.by", select: "-password" },
    ];

    const tasks = await Task.find().populate(populateOptions);

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

export const fetchAllTrashedTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ is_trashed: "Yes" });
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

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

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

    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
};

export const fetchUserReport1 = async (req, res, next) => {
  try {
    console.log(req.params);
    console.log(req.body);

    const memberID = req.params.id;
    const { date_from, date_until } = req.body;
    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

    if (!date_from || !date_until)
      return next(errorHandler(400, "Both dates are required!"));

    const targetUser = await User.findById(memberID)
      .populate("work.task")
      .select("-password");

    if (!targetUser) return next(errorHandler(404, "Member not found!"));

    const fromDate = new Date(date_from);
    const untilDate = new Date(date_until);

    if (fromDate > untilDate)
      return next(
        errorHandler(400, "Please enter dates in cronological order!")
      );

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

    res.status(200).json({ taskHours, filteredTasks });
  } catch (error) {
    next(error);
  }
};

export const fetchUserReport2 = async (req, res, next) => {
  try {
    console.log(req.params);
    console.log(req.body);

    const memberID = req.params.id;
    const { date_from, date_until } = req.body;
    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

    if (!date_from || !date_until)
      return next(errorHandler(400, "Both dates are required!"));

    const targetUser = await User.findById(memberID).select("-password");

    if (!targetUser) return next(errorHandler(404, "Member not found!"));

    const fromDate = new Date(date_from);
    const untilDate = new Date(date_until);

    if (fromDate > untilDate)
      return next(
        errorHandler(400, "Please enter dates in cronological order!")
      );

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

    return res.status(200).json(roleHours);
  } catch (error) {
    next(error);
  }
};

export const fetchTeamManagerReports = async (req, res, next) => {
  try {
    const teamManagerID = req.params.id;
    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

    const teamManager = await User.findById(teamManagerID);
    if (!teamManager) return next(errorHandler(404, "Team Manager not found!"));

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

    //ore lucrate per membru al echipei team manager-ului
    //ex: user normal 1 - 53
    const teamMemberIDs = [
      ...new Set(
        tasks.flatMap((task) => task.team.map((member) => member._id))
      ),
    ];
    const teamMembers = await User.find({ _id: { $in: teamMemberIDs } });

    const teamEfficency = teamMembers.map((member) => {
      const totalHours = member.work.reduce(
        (sum, entry) => sum + entry.hours,
        0
      );
      return {
        name: `${member.first_name} ${member.last_name}`,
        hours: totalHours,
      };
    });

    res.status(200).json({ taskStatusDistribution, teamEfficency });
  } catch (error) {
    next(error);
  }
};

export const deleteAsset = async (req, res, next) => {
  try {
    console.log(req.body);
    const { taskID, assetIndex } = req.body;

    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

    const task = await Task.findById(taskID);
    if (!task) return next(errorHandler(404, "Task not found!"));

    if (assetIndex < 0 || assetIndex >= task.asseturls.length)
      return next(errorHandler(400, "Invalid index!"));

    task.asseturls.splice(assetIndex, 1);
    await task.save();

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

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

    const task = await Task.findById(taskID);
    if (!task) return next(errorHandler(404, "Task not found!"));

    if (activityIndex < 0 || activityIndex >= task.activities.length)
      return next(errorHandler(400, "Invalid index!"));

    task.activities.splice(activityIndex, 1);
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

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

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

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

    const task = await Task.findById(taskID);
    if (!task) return next(errorHandler(404, "Task not found!"));

    if (activityIndex < 0 || activityIndex >= task.activities.length)
      return next(errorHandler(400, "Invalid index!"));

    task.activities[activityIndex].type = formData.type;

    if (formData.description)
      task.activities[activityIndex].description = formData.description;

    await task.save();

    res.status(200).json(task);
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

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

    const task = await Task.findById(taskID);
    if (!task) return next(errorHandler(404, "Task not found!"));

    if (subtaskIndex < 0 || subtaskIndex >= task.subtasks.length)
      return next(errorHandler(400, "Invalid index!"));

    if (formData.title) task.subtasks[subtaskIndex].title = formData.title;
    if (formData.tag) task.subtasks[subtaskIndex].tag = formData.tag;
    if (formData.date) task.subtasks[subtaskIndex].date = formData.date;

    await task.save();

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const getNotificationsLog = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const currentUser = await User.findById(userID);
    if (!currentUser) return next(errorHandler(404, "User not found!"));

    if (currentUser.is_admin !== "Yes")
      return next(errorHandler(403, "You are not an admin!"));

    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({
        path: "sent_to",
        select: "first_name last_name title email",
      });

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};
