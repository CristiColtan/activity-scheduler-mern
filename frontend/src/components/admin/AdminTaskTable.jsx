import React, { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import clsx from "clsx";
import {
  Popover,
  PopoverPanel,
  PopoverButton,
  Transition,
} from "@headlessui/react";

import { MdKeyboardArrowUp } from "react-icons/md";
import { MdKeyboardDoubleArrowUp } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";
import { GoDash } from "react-icons/go";
import { FaRegFolderOpen } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import { TbSubtask } from "react-icons/tb";
import { RxActivityLog } from "react-icons/rx";
import { FaPhotoVideo } from "react-icons/fa";
import { CiCircleRemove } from "react-icons/ci";
import { FaBug, FaThumbsUp, FaUser, FaFlagCheckered } from "react-icons/fa";
import { MdOutlineMessage, MdOutlineDoneAll } from "react-icons/md";
import { GrInProgress } from "react-icons/gr";
import { CiEdit } from "react-icons/ci";
import { MdTaskAlt } from "react-icons/md";

import { toggleExpand } from "../../redux/expand/expandSlice.js";
import { setSelectedTabForTask } from "../../redux/expand/taskTabsSlice.js";

import { priority_styles, task_type, bgs } from "../../utils/tableImports.js";
import { getInitials } from "../../utils/FullnameInitials.js";

import Loading from "../Loading.jsx";
import AdminTabs from "./AdminTabs.jsx";
import AdminDialogEditActivity from "./AdminDialogEditActivity.jsx";
import AdminDialogEditSubtask from "./AdminDialogEditSubtask.jsx";

import { proxy } from "../../utils/deployment.js";
import { apiRequest } from "../../utils/apiReq.js";

const t_icons = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  normal: <GoDash />,
  low: <MdKeyboardArrowDown />,
};

const AdminTaskTable = ({ tasks, setTasks }) => {
  const navigate = useNavigate();

  const [openEdit, setOpenEdit] = useState(false);
  const [activityData, setActivityData] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [actIndex, setActIndex] = useState(null);

  const [openEditSubtask, setOpenEditSubtask] = useState(false);
  const [subtaskData, setSubtaskData] = useState(null);
  const [subtaskIndex, setSubtaskIndex] = useState(null);
  const [taskIdSubtask, settaskIdSubtask] = useState(null);

  const MyUserInfo = ({ user, index, taskId }) => {
    const userTaskRole = user.roles?.find(
      (role) => role.task.toString() === taskId.toString()
    )?.role;
    return (
      <>
        <div className="px-4">
          <Popover className="relative">
            <>
              <PopoverButton className="group inline-flex items-center outline-none">
                <span className="text-white font-medium">
                  {getInitials(user?.first_name, user?.last_name)}
                </span>
              </PopoverButton>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <PopoverPanel className="absolute left-1/2 z-10 mt-3 w-120 max-w-sm -translate-x-2/3 transform px-4 sm:px-0">
                  <div className="flex items-center gap-4 rounded-lg shadow-lg bg-white ring-1 ring-gray-900/5">
                    <div
                      className={clsx(
                        "w-14 h-14 text-white rounded-full flex items-center justify-center text-2xl mx-1",
                        bgs[index % bgs.length]
                      )}
                    >
                      <span className="text-white font-medium">
                        {getInitials(user?.first_name, user?.last_name)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-y-1 mx-1">
                      <p className="text-black font-serif text-base">
                        {user?.first_name + " " + user?.last_name}
                      </p>
                      <span className="text-gray-700 font-serif">
                        {user?.title + " | " + userTaskRole}
                      </span>
                      <span className="text-gray-700 font-serif">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          </Popover>
        </div>
      </>
    );
  };

  const MyTableHeader = () => {
    return (
      <thead className="border-b border-black">
        <tr className="text-black text-left">
          <th className="py-2">Task Title</th>
          <th className="py-2">Priority</th>
          <th className="py-2">Team</th>
          <th className="py-2 hidden md:block">Created</th>
        </tr>
      </thead>
    );
  };

  const handleDeleteAssetOnClick = async (taskID, asseturlIndex) => {
    try {
      const res = await apiRequest(`${proxy}/backend/admin/delete/asset`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskID: taskID, assetIndex: asseturlIndex }),
      });

      if (!res) return;

      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === data._id
            ? {
                ...task,
                asseturls: task.asseturls.filter(
                  (_, index) => index !== asseturlIndex
                ),
              }
            : task
        )
      );
    } catch (error) {
      console.error(error.message);
      return;
    }
  };

  const handleDeleteActivityOnClick = async (taskID, activityIndex) => {
    try {
      const res = await apiRequest(`${proxy}/backend/admin/delete/activity`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskID: taskID,
          activityIndex: activityIndex,
        }),
      });

      if (!res) return;

      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === data._id
            ? {
                ...task,
                activities: task.activities.filter(
                  (_, index) => index !== activityIndex
                ),
              }
            : task
        )
      );
    } catch (error) {
      console.error(error.message);
      return;
    }
  };

  const handleDeleteSubtaskOnClick = async (taskID, subtaskIndex) => {
    try {
      const res = await apiRequest(`${proxy}/backend/admin/delete/subtask`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskID: taskID, subtaskIndex: subtaskIndex }),
      });

      if (!res) return;

      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === data._id
            ? {
                ...task,
                subtasks: task.subtasks.filter(
                  (_, index) => index !== subtaskIndex
                ),
              }
            : task
        )
      );
    } catch (error) {
      console.error(error.message);
      return;
    }
  };

  const MyTableRow = ({ task }) => {
    const [expand, setExpand] = useState(false);
    const [Selected, setSelected] = useState(0);
    const selected = useSelector(
      (state) => state.taskTabs.selectedTabs[task._id] || 0
    );

    const dispatch = useDispatch();
    const expandedRows = useSelector((state) => state.expand.expandedRows);
    const isExpanded = expandedRows.includes(task._id);

    const handleOpenEditOnClick = (a_data, taskid, aindex) => {
      setActivityData(a_data);
      setTaskId(taskid);
      setActIndex(aindex);
      setOpenEdit(true);
    };

    const handleOpenEditSubtaskOnClick = (s_data, taskid, sindex) => {
      setSubtaskData(s_data);
      settaskIdSubtask(taskid);
      setSubtaskIndex(sindex);
      setOpenEditSubtask(true);
    };

    const switchOnClick = () => {
      setExpand((prevExpand) => !prevExpand);
      if (!expand) setSelected(0);
    };

    const handleToggle = () => {
      dispatch(toggleExpand(task._id));
    };

    const handleTabChange = (tabIndex) => {
      dispatch(setSelectedTabForTask({ taskID: task._id, tabIndex }));
    };

    const activitiy_types = {
      commented: (
        <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
          <MdOutlineMessage className="text-xl" />
        </div>
      ),
      started: (
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
          <FaThumbsUp size={20} />
        </div>
      ),
      assigned: (
        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white">
          <FaUser className="text-xl" />
        </div>
      ),
      bug: (
        <div className="w-10 h-10 rounded-full border border-red-600 flex items-center justify-center text-red-600">
          <FaBug size={24} />
        </div>
      ),
      completed: (
        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
          <MdOutlineDoneAll className="text-2xl" />
        </div>
      ),
      "in progress": (
        <div className="w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center text-white">
          <GrInProgress className="text-xl" />
        </div>
      ),
      "created task": (
        <div className="w-10 h-10 rounded-full flex border border-gray-500 items-center justify-center text-black">
          <FaFlagCheckered className="text-2xl" />
        </div>
      ),
    };

    const tabs = [
      {
        title: "Assets",
        icon: <FaPhotoVideo className="text-lg" size={20} />,
      },
      {
        title: "Activities",
        icon: <RxActivityLog className="text-lg" size={20} />,
      },
      {
        title: "SubTasks",
        icon: <TbSubtask className="text-lg" size={20} />,
      },
    ];

    return (
      <>
        <tr
          className={clsx(
            "text-black hover:bg-gray-200",
            !isExpanded && "border-b border-black"
          )}
        >
          <td className="py-2">
            <div className="flex items-center gap-2">
              <div
                className={clsx("w-4 h-4 rounded-full", task_type[task?.stage])}
              />
              <p className="font-serif">
                {task?.title}
                <span className="font-semibold">
                  {task?.is_trashed === "Yes" && " (Trashed)"}
                </span>
              </p>
            </div>
          </td>

          <td className="py-2">
            <div className="flex items-center gap-1">
              <span
                className={clsx("text-xl", priority_styles[task?.priority])}
              >
                {t_icons[task?.priority]}
              </span>
              <span className="font-thin">{task?.priority}</span>
            </div>
          </td>

          <td className="py-2">
            <div className="flex">
              {task.team.map((m, index) => (
                <div
                  key={m._id}
                  className={clsx(
                    "w-7 h-7 rounded-full text-white items-center justify-center text-sm flex -mr-1",
                    bgs[index % bgs.length]
                  )}
                >
                  <MyUserInfo user={m} index={index} taskId={task._id} />
                </div>
              ))}
            </div>
          </td>

          <td className="py-2 hidden md:block">
            <span className="font-thin">
              {moment(task?.createdAt).fromNow()}
            </span>
          </td>

          <td className="p-2">
            <div className="flex justify-end gap-3">
              <button
                className="hidden lg:block ml-1"
                onClick={() => navigate(`/task/${task._id}`)}
              >
                <FaRegFolderOpen className="text-xl text-yellow-600 hover:text-yellow-500" />
              </button>
              <button className="ml-1">
                <IoIosArrowDown
                  onClick={handleToggle}
                  className="text-xl text-black hover:text-gray-500"
                />
              </button>
            </div>
          </td>
        </tr>

        {isExpanded && (
          <tr className="text-black border-b border-black table-row">
            <td colSpan="5">
              <AdminTabs
                tabs={tabs}
                selectedd={selected}
                setSelected={handleTabChange}
              >
                {selected === 0 && (
                  <>
                    {task.asseturls && task.asseturls.length > 0 ? (
                      <>
                        {task.asseturls?.map((url, index) => (
                          <div
                            key={url + index}
                            className="w-full flex items-center  gap-10 mb-5"
                          >
                            <img
                              src={url}
                              alt="Asset image"
                              className="rounded h-24 md:h-32 2xl:h-48 cursor-pointer
                                transition-all duration-500 hover:scale-110 hover:z-50 border-black border-2"
                            ></img>
                            <button
                              className="px-6 py-2 rounded 
                                bg-red-500 text-white font-sans
                                hover:bg-red-300 transition duration-200
                                font-medium"
                              onClick={() =>
                                handleDeleteAssetOnClick(task._id, index)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        <p>No assets available.</p>
                      </>
                    )}
                  </>
                )}
                {selected === 1 && (
                  <>
                    {task.activities && task.activities.length > 0 ? (
                      <>
                        {task.activities?.map((item, index) => (
                          <div
                            key={item?.type + index + item?.description}
                            className="w-full grid grid-cols-2"
                          >
                            <div className="flex space-x-4">
                              <div className="flex flex-col items-center flex-shrink-0">
                                <div className="w-10 h-10 flex items-center justify-center translate-y-5">
                                  {activitiy_types[item?.type]}
                                </div>
                              </div>

                              <div className="flex flex-col gap-y-1 mb-8">
                                <p className="font-semibold">
                                  {item?.by?.first_name +
                                    " " +
                                    item?.by?.last_name}
                                </p>
                                <div className="font-thin space-y-2">
                                  <span className="capitalize mr-2">
                                    {item?.type}
                                  </span>
                                  <span className="text-sm">
                                    {moment(item?.date).fromNow()}
                                  </span>
                                </div>

                                <div className="text-gray-700">
                                  {item?.description}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <button
                                className="px-2 py-2 rounded 
                                text-red-500 font-sans
                                hover:text-red-300 transition duration-200
                                font-medium -translate-y-3"
                                onClick={() =>
                                  handleDeleteActivityOnClick(task._id, index)
                                }
                              >
                                {
                                  <CiCircleRemove
                                    className="text-xl mr-3"
                                    size={36}
                                  />
                                }
                              </button>
                              <button
                                className="px-2 py-2 rounded 
                                text-blue-500 font-sans
                                hover:text-blue-300 transition duration-200
                                font-medium -translate-y-3"
                                onClick={() =>
                                  handleOpenEditOnClick(item, task._id, index)
                                }
                              >
                                {<CiEdit className="text-xl" size={36} />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        <p>No activities available.</p>
                      </>
                    )}
                  </>
                )}
                {selected === 2 && (
                  <>
                    {task.subtasks && task.subtasks.length > 0 ? (
                      <>
                        {task.subtasks?.map((subtask, index) => (
                          <div
                            key={subtask?.title + subtask?.description + index}
                            className="w-full grid grid-cols-2"
                          >
                            <div className="flex gap-6 border-gray-500 py-3">
                              <div
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-violet-100
                                translate-y-1"
                              >
                                <MdTaskAlt
                                  className="text-violet-600"
                                  size={24}
                                />
                              </div>

                              <div className="">
                                <div className="flex gap-4 items-center">
                                  <span className="font-thin">
                                    {new Date(subtask?.date).toDateString()}
                                  </span>
                                  <span
                                    className="px-2 py-0.5 text-center text-sm rounded-full bg-violet-100 text-violet-700 font-semibold
                                    hidden md:block"
                                  >
                                    {subtask?.tag}
                                  </span>
                                </div>
                                <p className="font-serif">{subtask?.title}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <button
                                className="px-2 py-2 rounded 
                                text-red-500 font-sans
                                hover:text-red-300 transition duration-200
                                font-medium -translate-y-1.5"
                                onClick={() =>
                                  handleDeleteSubtaskOnClick(task._id, index)
                                }
                              >
                                {
                                  <CiCircleRemove
                                    className="text-xl mr-3"
                                    size={36}
                                  />
                                }
                              </button>
                              <button
                                className="px-2 py-2 rounded 
                                text-blue-500 font-sans
                                hover:text-blue-300 transition duration-200
                                font-medium -translate-y-1.5"
                                onClick={() =>
                                  handleOpenEditSubtaskOnClick(
                                    subtask,
                                    task._id,
                                    index
                                  )
                                }
                              >
                                {<CiEdit className="text-xl" size={36} />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <p>No subtasks available.</p>
                    )}
                  </>
                )}
              </AdminTabs>
            </td>
          </tr>
        )}
      </>
    );
  };

  return (
    <>
      <div className="w-full bg-white px-2 md:px-4 pt-4 pb-4 shadow-lg rounded">
        <table className="w-full mb-5">
          <MyTableHeader />
          <tbody className="">
            {tasks && tasks.length > 0 ? (
              tasks.map((task, id) => (
                <MyTableRow key={task._id + id + "a"} task={task} />
              ))
            ) : (
              <>
                <tr>
                  <td colSpan="5" className="text-center py-4 text-lg">
                    No tasks available.
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
      <AdminDialogEditActivity
        open={openEdit}
        setOpen={setOpenEdit}
        allTasks={tasks}
        setAllTasks={setTasks}
        taskID={taskId}
        activityIndex={actIndex}
        activityData={activityData}
      />
      <AdminDialogEditSubtask
        open={openEditSubtask}
        setOpen={setOpenEditSubtask}
        allTasks={tasks}
        setAllTasks={setTasks}
        taskID={taskIdSubtask}
        subtaskIndex={subtaskIndex}
        subtaskData={subtaskData}
      />
    </>
  );
};

export default AdminTaskTable;
