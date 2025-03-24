import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

import Loading from "./Loading.jsx";
import PageTitle from "./PageTitle.jsx";

import { MdKeyboardArrowUp } from "react-icons/md";
import { MdKeyboardDoubleArrowUp } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";
import { GoDash } from "react-icons/go";
import { MdOutlineRestore } from "react-icons/md";
import { FaDeleteLeft } from "react-icons/fa6";
import { FaRegFolderOpen } from "react-icons/fa6";

import { priority_styles, task_type } from "../utils/tableImports.js";

import DialogRemoveTask from "./dialog/DialogRemoveTask.jsx";
import DialogRestoreTask from "./dialog/DialogRestoreTask.jsx";
import TaskDeleteAll from "./task/TaskDeleteAll.jsx";
import TaskRestoreAll from "./task/TaskRestoreAll.jsx";

import { apiRequest } from "../utils/apiReq.js";

const TrashAdmin = () => {
  const t_icons = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    normal: <GoDash />,
    low: <MdKeyboardArrowDown />,
  };

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trashedTasks, setTrashedTasks] = useState([]);

  const [openDialogDelete, setOpenDialogDelete] = useState(false);
  const [openDialogRestore, setOpenDialogRestore] = useState(false);
  const [deleteTaskData, setDeleteTaskData] = useState(null);
  const [restoreTaskData, setRestoreTaskData] = useState(null);

  const [openDialogDeleteAll, setOpenDialogDeleteAll] = useState(false);
  const [openDialogRestoreAll, setOpenDialogRestoreAll] = useState(false);

  const deleteTaskHandlerOnClick = (d_t_data) => {
    setDeleteTaskData(d_t_data);
    setOpenDialogDelete(true);
  };

  const restoreTaskHandlerOnClick = (r_t_data) => {
    setRestoreTaskData(r_t_data);
    setOpenDialogRestore(true);
  };

  const { currentUser } = useSelector((state) => state.user);

  console.log(trashedTasks);

  const fetchTrashedTasks = async () => {
    try {
      setLoading(true);

      const res = await apiRequest(
        "http://localhost:8081/backend/admin/get/all-trashed-tasks"
      );

      if (!res) return;

      const data = await res.json();

      if (data.success === false) {
        console.log(data.message);
        setError(data.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      setError(null);
      setTrashedTasks(data);
    } catch (error) {
      console.log(error.message);
      setError(error.message);
      setLoading(false);
      return;
    }
  };

  useEffect(() => {
    fetchTrashedTasks();
  }, []);

  const MyTableHeader = () => {
    return (
      <thead className="border-b border-black">
        <tr className="text-black text-left">
          <th className="py-2">Task Title</th>
          <th className="py-2">Priority</th>
          <th className="py-2">Stage</th>
          <th className="py-2 px-2 hidden lg:block">Modified on</th>
        </tr>
      </thead>
    );
  };

  const MyTableRow = ({ task }) => {
    return (
      <tr className="border-b border-black text-black hover:bg-gray-200">
        <td className="py-2 pr-2">
          <div className="flex items-center gap-3">
            <div
              className={clsx("w-4 h-4 rounded-full", task_type[task.stage])}
            ></div>
            <p className="w-full line-clamp-2 font-serif text-black">
              {task.title}
            </p>
          </div>
        </td>

        <td className="py-2 pr-2">
          <div className="flex gap-1 items-center">
            <span className={clsx("text-lg", priority_styles[task.priority])}>
              {t_icons[task.priority]}
            </span>
            <span className="font-thin">{task.priority}</span>
          </div>
        </td>

        <td className="py-2">{task.stage}</td>

        <td className="py-2 font-thin hidden lg:table-cell">
          {new Date(task.date).toDateString()}
        </td>

        <td className="p-2">
          <div className="flex justify-end gap-3">
            <button onClick={() => restoreTaskHandlerOnClick(task)}>
              <MdOutlineRestore className="text-2xl text-blue-700 hover:text-blue-500" />
            </button>
            <button onClick={() => deleteTaskHandlerOnClick(task)}>
              <FaDeleteLeft className="text-xl text-red-700 hover:text-red-500" />
            </button>
            <button
              className="hidden lg:block ml-1"
              onClick={() => navigate(`/task/${task._id}`)}
            >
              <FaRegFolderOpen className="text-xl text-yellow-600 hover:text-yellow-500" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return loading ? (
    <div>
      <Loading />
    </div>
  ) : (
    <>
      <div className="w-full bg-white h-fit px-2 md:px-6 py-4 shadow-lg rounded mb-8">
        <div className="flex items-center justify-between">
          <PageTitle title="Admin" />
          <div className="inline-flex gap-4 md:gap-6 items-center">
            <button
              className="text-blue-700 hover:text-blue-500 inline-flex items-center gap-1
                            disabled:cursor-not-allowed disabled:text-blue-500"
              onClick={() => setOpenDialogRestoreAll(true)}
              disabled={!trashedTasks || trashedTasks.length < 1}
            >
              {<MdOutlineRestore className="text-xl " />} Restore All
            </button>
            <button
              className="text-red-700 hover:text-red-500 inline-flex items-center gap-1
                            disabled:cursor-not-allowed disabled:text-red-500"
              onClick={() => setOpenDialogDeleteAll(true)}
              disabled={!trashedTasks || trashedTasks.length < 1}
            >
              {<FaDeleteLeft className="text-xl " />} Delete All
            </button>
          </div>
        </div>
      </div>
      <div className="w-full bg-white h-fit px-2 md:px-6 py-4 shadow-lg rounded">
        <table className="w-full mb-5">
          <MyTableHeader />
          <tbody>
            {trashedTasks && trashedTasks.length > 0 ? (
              trashedTasks.map((task, index) => (
                <MyTableRow task={task} key={index + task._id} />
              ))
            ) : (
              <>
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Trash is empty.
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
      <div>{error && <p className="text-red-500">{error}</p>}</div>
      <DialogRemoveTask
        open={openDialogDelete}
        setOpen={setOpenDialogDelete}
        taskData={deleteTaskData}
        trashedTasks={trashedTasks}
        setTrashedTasks={setTrashedTasks}
      />
      <DialogRestoreTask
        open={openDialogRestore}
        setOpen={setOpenDialogRestore}
        taskData={restoreTaskData}
        trashedTasks={trashedTasks}
        setTrashedTasks={setTrashedTasks}
      />
      <TaskDeleteAll
        open={openDialogDeleteAll}
        setOpen={setOpenDialogDeleteAll}
        trashedTasks={trashedTasks}
        setTrashedTasks={setTrashedTasks}
      />
      <TaskRestoreAll
        open={openDialogRestoreAll}
        setOpen={setOpenDialogRestoreAll}
        trashedTasks={trashedTasks}
        setTrashedTasks={setTrashedTasks}
      />
    </>
  );
};

export default TrashAdmin;
