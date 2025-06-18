import React, { useState, Fragment, useEffect } from "react";
import { useSelector } from "react-redux";
import clsx from "clsx";
import moment from "moment";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";

import { LiaCommentSolid } from "react-icons/lia";
import { CgDetailsMore } from "react-icons/cg";
import { GoDash } from "react-icons/go";
import { FaBarsProgress } from "react-icons/fa6";
import { FaBug, FaThumbsUp, FaUser, FaFlagCheckered } from "react-icons/fa";
import { CiCircleRemove } from "react-icons/ci";
import { GrInProgress } from "react-icons/gr";
import { GrHelpBook } from "react-icons/gr";
import { AiOutlineOpenAI } from "react-icons/ai";
import {
  MdOutlineTimeline,
  MdKeyboardArrowDown,
  MdOutlineArrowDropDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineDoneAll,
  MdOutlineMessage,
  MdTaskAlt,
  MdAssignmentAdd,
  MdOutlineRefresh,
  MdOutlineEdit,
  MdQueryStats,
  MdRemoveDone,
} from "react-icons/md";
import { RxActivityLog } from "react-icons/rx";
import { FaTrash } from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import { TbClock, TbHours24 } from "react-icons/tb";
import { TbClockHour8 } from "react-icons/tb";
import { IoMdAttach } from "react-icons/io";
import { FaTasks } from "react-icons/fa";

import {
  priority_styles,
  task_type,
  bgs_task_type,
  bgs_transparent,
  text_task_type,
} from "../utils/tableImports.js";
import { getInitials } from "../utils/FullnameInitials.js";

import PageTitle from "../components/PageTitle.jsx";
import Loading from "../components/Loading.jsx";
import Tabs from "../components/Tabs.jsx";
import DialogSetRoleTaskDetails from "../components/dialog/DialogSetRoleTaskDetails.jsx";
import DialogAssignHours from "../components/dialog/DialogAssignHours.jsx";
import DialogEditSubtask from "../components/dialog/DialogEditSubtask.jsx";
import DialogEditActivity from "../components/dialog/DialogEditActivity.jsx";
import TaskAddSubTask from "../components/TaskAddSubTask.jsx";

import { proxy } from "../utils/deployment.js";
import { apiRequest } from "../utils/apiReq.js";
import SubtaskProgress from "../components/task/SubtaskProgress.jsx";
import AssistantChat from "../components/task/AssistantChat.jsx";

const t_icons = {
  high: <MdKeyboardDoubleArrowUp />,
  medium: <MdKeyboardArrowUp />,
  normal: <GoDash />,
  low: <MdKeyboardArrowDown />,
};

const tabs = [
  {
    title: "Task Details",
    icon: <CgDetailsMore className="text-xl" size={24} />,
  },
  {
    title: "Timeline",
    icon: <RxActivityLog className="text-lg" size={20} />,
  },
  {
    title: "Statistics",
    icon: <MdQueryStats className="text-lg" size={20} />,
  },
  {
    title: "Assistant",
    icon: <GrHelpBook className="text-lg" size={20} />,
  },
];

const small_activitiy_types = {
  commented: (
    <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-white">
      <MdOutlineMessage className="text-xl" />
    </div>
  ),
  started: (
    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">
      <FaThumbsUp className="-translate-y-0.5" size={20} />
    </div>
  ),
  assigned: (
    <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white">
      <FaUser className="text-xl" />
    </div>
  ),
  bug: (
    <div className="w-6 h-6 rounded-full border border-red-600 flex items-center justify-center text-red-600">
      <FaBug size={24} />
    </div>
  ),
  completed: (
    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white">
      <MdOutlineDoneAll className="text-2xl" />
    </div>
  ),
  "in progress": (
    <div className="w-6 h-6 rounded-full bg-yellow-600 flex items-center justify-center text-white">
      <GrInProgress className="text-xl" />
    </div>
  ),
  "created task": (
    <div className="w-6 h-6 rounded-full flex border border-gray-500 items-center justify-center text-black">
      <FaFlagCheckered className="text-2xl" />
    </div>
  ),
};

const activitiy_types = {
  commented: (
    <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
      <MdOutlineMessage className="text-xl" />
    </div>
  ),
  started: (
    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
      <FaThumbsUp className="-translate-y-0.5" size={20} />
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

const act_types = [
  "Started",
  "Completed",
  "In Progress",
  "Commented",
  "Bug",
  "Assigned",
];

const TaskDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);

  const [taskStatistics, setTaskStatistics] = useState({});
  const [loadingStatistics, setLoadingStatistics] = useState(false);
  const [errorStatistics, setErrorStatistics] = useState(null);

  const [Task, setTask] = useState({});
  const [loading, setLoading] = useState(false);
  const [Error, setError] = useState(null);

  const [activities, setActivities] = useState([]);
  const [Subtasks, setSubtasks] = useState([]);

  const [TaskTeam, setTaskTeam] = useState([]);

  const [openAddSubtask, setOpenAddSubtask] = useState(false);

  const [openEditRole, setOpenEditRole] = useState(false);
  const [editRoleData, setEditRoleData] = useState(null);
  const [userRoleId, setUserRoleId] = useState(null);

  const [openEditHours, setOpenEditHours] = useState(false);
  const [userHoursId, setUserHoursId] = useState(null);

  const handleEditUserRole = (roleData, uId) => {
    setEditRoleData(roleData);
    setUserRoleId(uId);
    setOpenEditRole(true);
  };

  console.log("TASK DETAILS: ", Task);
  console.log("TASK STATISTICS: ", taskStatistics);

  const handleEditUserHours = (uId) => {
    setUserHoursId(uId);
    setOpenEditHours(true);
  };

  const { currentUser } = useSelector((state) => state.user);

  const fetchTask = async () => {
    try {
      setLoading(true);

      const res = await apiRequest(`${proxy}/backend/task/get/${params.id}`);

      if (!res) return;

      const data = await res.json();

      if (data.success === false) {
        setError(data.message);
        setLoading(false);
        return;
      }

      setTask(data);
      setSubtasks(data.subtasks);
      setTaskTeam(data.team);
      setActivities(data.activities);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.log(error.message);
      setError(error.message);
      setLoading(false);
      return;
    }
  };

  const fetchTaskStatistics = async () => {
    try {
      setLoading(true);

      const res = await apiRequest(
        `${proxy}/backend/task/get-statistics/${params.id}`
      );

      if (!res) return;

      const data = await res.json();

      if (data.success === false) {
        setError(data.message);
        setLoading(false);
        return;
      }

      setTaskStatistics(data);
      setLoadingStatistics(false);
      setErrorStatistics(null);
    } catch (error) {
      console.log(error.message);
      setErrorStatistics(error.message);
      setLoadingStatistics(false);
      return;
    }
  };

  useEffect(() => {
    if (!openEditHours) {
      fetchTask();
      fetchTaskStatistics();
    }
  }, [params.id, openEditHours]);

  const handleRefreshButton = () => {
    fetchTask();
    fetchTaskStatistics();
    setSelected(0);
  };

  const handleEditButton = () => {
    navigate(`/edit-task/${Task._id}`);
  };

  const [openEditSubtask, setOpenEditSubtask] = useState(false);
  const [subtaskData, setSubtaskData] = useState(null);
  const [subtaskIndex, setSubtaskIndex] = useState(null);
  const [taskIdSubtask, settaskIdSubtask] = useState(null);

  const handleOpenEditSubtaskOnClick = (s_data, taskid, sindex) => {
    setSubtaskData(s_data);
    settaskIdSubtask(taskid);
    setSubtaskIndex(sindex);
    setOpenEditSubtask(true);
  };

  const handleSwitchSubtaskStatus = async (taskID, subtaskIndex) => {
    try {
      const res = await apiRequest(
        `${proxy}/backend/task/switch-subtask-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ taskID: taskID, subtaskIndex: subtaskIndex }),
        }
      );

      if (!res) return;

      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setActivities(data.activities);
      setSubtasks(data.subtasks);
    } catch (error) {
      console.error(error.message);
      return;
    }
  };

  const handleDeleteSubTaskOnClick = async (taskID, subtaskIndex) => {
    try {
      const res = await apiRequest(
        `${proxy}/backend/task/delete-task-details-subtask`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ taskID: taskID, subtaskIndex: subtaskIndex }),
        }
      );

      if (!res) return;

      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setSubtasks((prevSubtasks) =>
        prevSubtasks.filter((_, index) => index !== subtaskIndex)
      );
    } catch (error) {
      console.error(error.message);
      return;
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 mb-4 overflow-y-hidden">
      {loading || loadingStatistics ? (
        <div>
          <Loading />
        </div>
      ) : (
        <>
          {Error ? (
            <p className="text-red-500 text-4xl">
              Something went wrong! {Error}
            </p>
          ) : (
            <>
              <div className="pl-1 flex gap-6">
                <PageTitle title={Task?.title} />
                <div className="flex gap-3">
                  <button
                    className="group"
                    onClick={() => handleRefreshButton()}
                  >
                    <MdOutlineRefresh className="rounded-full h-7 w-7 text-black group-hover:text-gray-400 bg-white shadow-lg"></MdOutlineRefresh>
                  </button>
                  <button
                    className={clsx(
                      "group",
                      currentUser.is_team_manager === "Yes" ||
                        currentUser.is_admin === "Yes"
                        ? "block"
                        : "hidden"
                    )}
                    onClick={() => handleEditButton()}
                  >
                    <MdOutlineEdit className="rounded-full h-7 w-7 p-0.5 text-black group-hover:text-gray-400 bg-white shadow-lg" />
                  </button>
                </div>
              </div>
              <Tabs tabs={tabs} setSelected={setSelected}>
                {selected === 0 && (
                  <>
                    <div className="w-full flex flex-col md:flex-row gap-5 2xl:gap-8 overflow-y-auto">
                      {/*left*/}
                      <div className="w-full md:w-1/2 space-y-6">
                        <div className="flex items-center gap-5">
                          <div
                            className={clsx(
                              "flex gap-1 items-center font-serif px-3 py-1 rounded-full",
                              priority_styles[Task?.priority],
                              bgs_transparent[Task?.priority]
                            )}
                          >
                            <span className="text-xl">
                              {t_icons[Task?.priority]}
                            </span>
                            <span className="font-thin uppercase">
                              {Task?.priority} priority
                            </span>
                          </div>

                          <div
                            className={clsx(
                              "flex items-center gap-1.5 rounded-full px-3 py-1",
                              bgs_task_type[Task?.stage]
                            )}
                          >
                            <div
                              className={clsx(
                                "w-4 h-4 rounded-full",
                                task_type[Task?.stage]
                              )}
                            ></div>
                            <span
                              className={clsx(
                                "font-serif uppercase",
                                text_task_type[Task?.stage]
                              )}
                            >
                              {Task?.stage}
                            </span>
                          </div>

                          <div
                            className={clsx(
                              "flex gap-1 items-center font-serif px-3 py-1 rounded-full bg-gray-400",
                              {
                                hidden: Task?.is_trashed === "No",
                              }
                            )}
                          >
                            <FaTrash className="" />
                            <span className="font-serif uppercase">
                              TRASHED
                            </span>
                          </div>
                        </div>

                        <p className="font-thin">
                          <span className="font-semibold">Created at:</span>{" "}
                          {new Date(Task?.createdAt).toDateString() + " "}
                          <span className="font-semibold">by</span>
                          {" " +
                            Task?.created_by?.first_name +
                            " " +
                            Task?.created_by?.last_name}
                        </p>
                        <p className="font-thin -translate-y-5">
                          <span className="font-semibold">Deadline:</span>{" "}
                          {new Date(Task?.date).toDateString()}
                        </p>

                        <div className="flex items-center gap-8 px-4 py-2 border-y border-gray-500">
                          <div className="space-x-2">
                            <span className="font-serif">
                              Assets:{" "}
                              <span>
                                {" "}
                                {Task.asseturls && Array.isArray(Task.asseturls)
                                  ? Task.asseturls.length
                                  : 0}
                              </span>
                            </span>
                            <span className="text-gray-500 pl-2 pr-2">|</span>
                            <span className="font-serif">
                              Sub-Tasks:{" "}
                              <span>
                                {" "}
                                {Subtasks && Array.isArray(Subtasks)
                                  ? Subtasks.length
                                  : 0}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1 py-4">
                          <p className="font-thin">TEAM</p>
                          <div className="">
                            {TaskTeam && TaskTeam.length > 0 ? (
                              TaskTeam.map((m, index) => {
                                const userTaskRole = m.roles?.find(
                                  (role) =>
                                    role.task.toString() === Task._id.toString()
                                )?.role;
                                const isWorking = m.work?.find(
                                  (work) =>
                                    work.task.toString() === Task._id.toString()
                                );
                                console.log(
                                  "index, usertaskrole",
                                  index,
                                  userTaskRole
                                );
                                return (
                                  <div
                                    key={m._id + index}
                                    className="flex gap-4 py-2 items-center border-t border-gray-500 justify-between"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-full text-base -mr-1 bg-blue-600 flex items-center justify-center text-white">
                                        <span className="text-center">
                                          {getInitials(
                                            m?.first_name,
                                            m?.last_name
                                          )}
                                        </span>
                                      </div>

                                      <div>
                                        <p className="text-lg font-serif flex items-center">
                                          {m?.first_name + " " + m?.last_name}
                                          {isWorking && (
                                            <FaBarsProgress className="text-xl text-green-600 mx-2" />
                                          )}
                                        </p>
                                        <span className="font-thin">
                                          {m?.title}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      {userTaskRole && (
                                        <>
                                          {(currentUser.is_admin === "Yes" ||
                                            currentUser.is_team_manager ===
                                              "Yes") && (
                                            <>
                                              <div className="flex items-center">
                                                <p className="font-thin">
                                                  {userTaskRole}
                                                </p>
                                                <button
                                                  className="px-2 py-2 rounded 
                                              text-blue-500 font-sans
                                              hover:text-blue-300 transition duration-200
                                                font-medium"
                                                  onClick={() =>
                                                    handleEditUserRole(
                                                      userTaskRole,
                                                      m._id
                                                    )
                                                  }
                                                >
                                                  <CiEdit
                                                    className="text-xl"
                                                    size={28}
                                                  />
                                                </button>
                                              </div>
                                            </>
                                          )}
                                          {currentUser.is_admin === "No" &&
                                            currentUser.is_team_manager ===
                                              "No" && (
                                              <>
                                                <div className="flex items-center">
                                                  <p className="font-thin pr-4">
                                                    {userTaskRole}
                                                  </p>
                                                  {userTaskRole !==
                                                    "Not assigned yet" &&
                                                    currentUser._id ===
                                                      m._id && (
                                                      <button
                                                        className="px-2 py-2 rounded 
                                              text-green-500 font-sans text-center items-center flex
                                              hover:text-green-300 transition duration-200
                                                font-medium"
                                                        onClick={() =>
                                                          handleEditUserHours(
                                                            m._id
                                                          )
                                                        }
                                                      >
                                                        <MdAssignmentAdd
                                                          className="text-xl"
                                                          size={28}
                                                        />
                                                        Work
                                                      </button>
                                                    )}
                                                </div>
                                              </>
                                            )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-lg font-serif border-t border-gray-500 py-2">
                                No team members.
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <div
                            className={clsx(
                              "flex justify-between",
                              currentUser.is_team_manager === "Yes" ||
                                currentUser.is_admin === "Yes"
                                ? "-mb-2"
                                : "mb-1"
                            )}
                          >
                            <p className="font-thin">SUB-TASKS</p>
                            <button
                              onClick={() => setOpenAddSubtask(true)}
                              className={clsx(
                                "text-3xl -translate-y-1.5 hover:text-gray-500 font-thin px-2",
                                currentUser.is_team_manager === "Yes" ||
                                  currentUser.is_admin === "Yes"
                                  ? "block"
                                  : "hidden"
                              )}
                            >
                              +
                            </button>
                          </div>
                          <div>
                            {Subtasks && Subtasks.length > 0 ? (
                              Subtasks.map((subtask, index) => (
                                <div
                                  key={index}
                                  className="w-full justify-between inline-flex border-t border-gray-500"
                                >
                                  <div className="flex gap-3 py-2">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200">
                                      <MdTaskAlt
                                        className={clsx(
                                          subtask.completed === true
                                            ? "text-green-600"
                                            : "text-red-600"
                                        )}
                                        size={24}
                                      />
                                    </div>

                                    <div>
                                      <div className="flex gap-2 items-center">
                                        <span className="font-thin">
                                          {new Date(
                                            subtask?.date
                                          ).toDateString()}
                                        </span>
                                        <span className="px-2 py-0.5 text-center text-sm rounded-full bg-gray-200 text-slate-700 font-semibold">
                                          {subtask?.tag}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-start gap-2 pr-4">
                                        <div className="font-serif max-w-[70%] break-words">
                                          {subtask?.title}
                                        </div>
                                        <span className="font-thin whitespace-nowrap">
                                          {subtask?.completed === true
                                            ? " - completed"
                                            : " - to do"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  {(currentUser.is_admin === "Yes" ||
                                    currentUser.is_team_manager === "Yes") && (
                                    <>
                                      <div className="flex items-center">
                                        <button
                                          className={clsx(
                                            "px-2 py-2 rounded font-sans transition duration-200 font-medium",
                                            subtask?.completed === true
                                              ? " text-green-600  hover:text-green-300"
                                              : "text-green-600 hover:text-green-300"
                                          )}
                                          onClick={() =>
                                            handleSwitchSubtaskStatus(
                                              Task._id,
                                              index
                                            )
                                          }
                                        >
                                          {subtask?.completed === false ? (
                                            <MdOutlineDoneAll
                                              className="text-xl"
                                              size={28}
                                            />
                                          ) : (
                                            <MdRemoveDone
                                              className="text-xl"
                                              size={28}
                                            />
                                          )}
                                        </button>
                                        <button
                                          className="px-2 py-2 rounded 
                                text-red-500 font-sans
                                hover:text-red-300 transition duration-200
                                font-medium "
                                          onClick={() =>
                                            handleDeleteSubTaskOnClick(
                                              Task._id,
                                              index
                                            )
                                          }
                                        >
                                          {
                                            <CiCircleRemove
                                              className="text-xl"
                                              size={28}
                                            />
                                          }
                                        </button>
                                        <button
                                          className="px-2 py-2 rounded 
                                text-blue-500 font-sans
                                hover:text-blue-300 transition duration-200
                                font-medium "
                                          onClick={() =>
                                            handleOpenEditSubtaskOnClick(
                                              subtask,
                                              Task._id,
                                              index
                                            )
                                          }
                                        >
                                          {
                                            <CiEdit
                                              className="text-xl"
                                              size={28}
                                            />
                                          }
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="text-lg font-serif border-t border-gray-500 py-2">
                                No subtasks available.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      {/*right*/}
                      <div className="w-full md:w-1/2 space-y-6 p-2">
                        <p className="text-lg font-semibold">ASSETS</p>
                        <div className="w-full grid grid-cols-2 gap-4">
                          {Task.asseturls && Task.asseturls.length > 0 ? (
                            Task.asseturls.map((asset, index) => (
                              <img
                                key={index}
                                src={asset}
                                alt={Task?.title}
                                className="w-full rounded h-28 md:h-36 2xl:h-52 cursor-pointer transition-all duration-700 hover:scale-125 hover:z-50"
                              ></img>
                            ))
                          ) : (
                            <p className="text-lg font-serif py-2">
                              No assets available.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {selected === 1 && (
                  <>
                    <Activities
                      task={Task}
                      activity={activities}
                      id={params.id}
                      setActivities={setActivities}
                    />
                  </>
                )}
                {selected === 2 && (
                  <>
                    {errorStatistics ? (
                      <p className="text-red-500 text-4xl">
                        Something went wrong! {errorStatistics}
                      </p>
                    ) : (
                      <>
                        <TStats
                          task={Task}
                          taskStatistics={taskStatistics}
                          setTaskStatistics={setTaskStatistics}
                          activities={activities}
                          subtasks={Subtasks}
                          id={params.id}
                        />
                      </>
                    )}
                  </>
                )}
                {selected === 3 && (
                  <>
                    <AssistantChat task={Task} />
                  </>
                )}
              </Tabs>

              {(currentUser.is_admin === "Yes" ||
                currentUser.is_team_manager === "Yes") && (
                <>
                  <TaskAddSubTask
                    open={openAddSubtask}
                    setOpen={setOpenAddSubtask}
                    id={Task._id}
                    subTasks={Subtasks}
                    setSubTasks={setSubtasks}
                    activities={activities}
                    setActivities={setActivities}
                  />
                  <DialogSetRoleTaskDetails
                    open={openEditRole}
                    setOpen={setOpenEditRole}
                    editRoleData={editRoleData}
                    team={TaskTeam}
                    setTeam={setTaskTeam}
                    taskId={Task._id}
                    userId={userRoleId}
                  />
                  <DialogEditSubtask
                    open={openEditSubtask}
                    setOpen={setOpenEditSubtask}
                    subtasks={Subtasks}
                    setSubtasks={setSubtasks}
                    taskID={taskIdSubtask}
                    subtaskIndex={subtaskIndex}
                    subtaskData={subtaskData}
                  />
                </>
              )}
              {currentUser.is_admin === "No" &&
                currentUser.is_team_manager === "No" && (
                  <DialogAssignHours
                    open={openEditHours}
                    setOpen={setOpenEditHours}
                    taskId={Task._id}
                    userId={userHoursId}
                  />
                )}
            </>
          )}
        </>
      )}
    </div>
  );
};

const TStats = ({
  taskStatistics,
  setTaskStatistics,
  activities,
  subtasks,
  task,
  id,
}) => {
  const [showMoreMap, setShowMoreMap] = useState({});

  const COLORSS = ["#1A8E01", "#008678", "#00437D", "#6B007D", "#7D0000"];

  const toggleShowMore = (userId) => {
    setShowMoreMap((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  return (
    <div className="w-full flex gap-10 2xl:gap-20 flex-col md:flex-row overflow-y-auto">
      <div className="w-full pl-1 pr-3">
        <div className="w-full mt-4">
          <div className="space-y-1">
            <p className="font-thin">OVERVIEW</p>
            <div className="flex items-center justify-start gap-2 px-4 py-2 border-t border-gray-500">
              <span className="font-serif flex items-center gap-1">
                <IoMdAttach className="text-xl" />
                Assets: <span> {taskStatistics?.n_assets}</span>
              </span>
              <span className="text-gray-500 pl-2 pr-2">|</span>
              <span className="font-serif flex items-center gap-1">
                <FaTasks className="text-lg" />
                Sub-Tasks: <span>{subtasks?.length}</span>
              </span>
              <span className="text-gray-500 pl-2 pr-2">|</span>
              <span className="font-serif flex items-center gap-1">
                <LiaCommentSolid className="text-xl" />
                Activities: <span>{activities?.length}</span>
              </span>
            </div>

            <br></br>

            <div className="space-y-1 ">
              <p className="font-thin">TEAM</p>
              <div className="flex items-center gap-8 px-4 py-2 border-t border-gray-500">
                <div className="md:w-1/2 w-full">
                  {task.team && task.team.length > 0 ? (
                    task.team.map((m, index) => {
                      const userTaskRole = m.roles?.find(
                        (role) => role.task.toString() === task._id.toString()
                      )?.role;
                      const isWorking = m.work?.find(
                        (work) => work.task.toString() === task._id.toString()
                      );
                      const workStats = taskStatistics?.work_by_user?.find(
                        (entry) => entry.user_id === m._id
                      );

                      const showMore = showMoreMap[m._id] || false;

                      return (
                        <div
                          key={m._id + index}
                          className="gap-4 py-2 border-b border-gray-500"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full text-base -mr-1 bg-blue-600 flex items-center justify-center text-white">
                                <span className="text-center">
                                  {getInitials(m?.first_name, m?.last_name)}
                                </span>
                              </div>

                              <div>
                                <p className="text-lg font-serif flex items-center">
                                  {m?.first_name + " " + m?.last_name}
                                  {isWorking && (
                                    <FaBarsProgress className="text-xl text-green-600 mx-2" />
                                  )}
                                </p>
                                <span className="font-thin">{m?.title}</span>
                                <span className="text-gray-500 pl-2 pr-2">
                                  |
                                </span>
                                <span className="font-thin">
                                  {userTaskRole || "Not assigned yet"}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                className="px-2 py-2 rounded 
                                              text-gray-900 font-sans
                                              hover:text-gray-400 transition duration-200
                                                font-medium"
                              >
                                <MdOutlineArrowDropDown
                                  onClick={() => toggleShowMore(m._id)}
                                  className="text-xl"
                                  size={28}
                                />
                              </button>
                            </div>
                          </div>

                          {showMore && (
                            <div className="flex flex-col mt-2 gap-1">
                              <div className="flex items-center">
                                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white">
                                  <TbClockHour8 className="text-xl" />
                                </div>
                                <p className="pl-1 font-serif">
                                  Total worked hours: {workStats?.total_hours}
                                </p>
                                <span className="text-gray-500 pl-2 pr-2">
                                  |
                                </span>
                                <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white">
                                  <TbHours24 className="text-xl" />
                                </div>
                                <p className="pl-1 font-serif">
                                  Hours worked today: {workStats?.hours_today}
                                </p>
                              </div>

                              <div className="flex items-center">
                                <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-600 flex items-center justify-center">
                                  <MdOutlineTimeline className="text-xl" />
                                </div>
                                <p className="pl-1 font-serif">
                                  Total activities:{" "}
                                  {workStats?.total_activities}
                                </p>

                                {workStats?.activities ? (
                                  <>
                                    {workStats?.total_activities !== 0 && (
                                      <span className="text-gray-500 pl-2 pr-2">
                                        |
                                      </span>
                                    )}
                                    {Object.entries(workStats.activities).map(
                                      ([type, count], index, array) => (
                                        <div
                                          key={type}
                                          className="flex items-center gap-2"
                                        >
                                          {small_activitiy_types[type]}
                                          <p className="font-serif">{count}</p>
                                          {index !== array.length - 1 && (
                                            <span className="text-gray-500 pl-1 pr-1">
                                              |
                                            </span>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </>
                                ) : (
                                  <span></span>
                                )}
                              </div>

                              <div className="flex items-center">
                                <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-800 flex items-center justify-center">
                                  <AiOutlineOpenAI className="text-2xl" />
                                </div>
                                <p className="pl-1 font-serif">
                                  AI Interactions: {workStats?.ai_interactions}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-lg font-serif border-t border-gray-500 py-2">
                      No team members.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <br></br>

            <div className="flex flex-col">
              <div className="space-y-1 ">
                <p className="font-thin">TEAM PROGRESS</p>
                <div className="flex items-center gap-8 px-4 py-2 border-t border-gray-500">
                  <div className="space-x-2">
                    <span className="font-serif">
                      Total hours worked:{" "}
                      <span> {taskStatistics?.work_by_team}</span>
                    </span>
                    <span className="text-gray-500 pl-2 pr-2">|</span>
                    <span className="font-serif">
                      Estimated work volume:{" "}
                      <span>{taskStatistics?.estimated_work_volume}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pr-5">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={taskStatistics.teamEfficiency}>
                    <defs>
                      <pattern
                        id="hasure-remaining"
                        patternUnits="userSpaceOnUse"
                        width="6"
                        height="6"
                        patternTransform="rotate(45)"
                      >
                        <line
                          x1="0"
                          y="0"
                          x2="0"
                          y2="6"
                          stroke="black"
                          strokeWidth="2"
                        />
                      </pattern>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />

                    <ReferenceLine
                      y={taskStatistics.teamEfficiency[0]?.estimated || 0}
                      stroke="black"
                      strokeDasharray="5 5"
                      label={{
                        position: "right",
                        value: "Estimare",
                        fontSize: 12,
                        fill: "gray",
                      }}
                    />

                    {/* worked */}
                    <Bar dataKey="worked" stackId="a" fill="#6B007D">
                      {taskStatistics.teamEfficiency.map((entry, index) => (
                        <Cell
                          key={`worked-${index}`}
                          fill={COLORSS[index % COLORSS.length]}
                        />
                      ))}
                    </Bar>

                    {/* remaining*/}
                    <Bar
                      dataKey="remaining"
                      stackId="a"
                      fill="url(#hasure-remaining)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1">
                <p className="font-thin border-b border-gray-500 py-0.5">
                  TEAM EFFICIENCY
                </p>
                <div className="flex gap-5 w-full flex-col sm:flex-row">
                  <div className="flex-1">
                    <SubtaskProgress
                      completed={taskStatistics?.completed_subtasks}
                      total={subtasks.length}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-sm max-w-md">
                        <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full">
                          <MdOutlineTimeline size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-serif text-gray-600">
                            Activity rate:
                          </p>
                          <p className="text-lg font-semibold">
                            {taskStatistics?.activity_rate_per_day}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm max-w-md">
                        <div className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-800 rounded-full">
                          <AiOutlineOpenAI size={32} />
                        </div>
                        <div>
                          <p className="text-sm font-serif text-gray-600">
                            AI Interactions:
                          </p>
                          <p className="text-lg font-semibold">
                            {taskStatistics?.ai_interactions_total}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Activities = ({ activity, id, setActivities, task }) => {
  const [select, setSelect] = useState(act_types[0]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [Errorr, setErrorr] = useState(null);

  const navigate = useNavigate();
  const params = useParams();

  const { currentUser } = useSelector((state) => state.user);
  const userTaskRole = currentUser.roles?.find(
    (role) => role.task.toString() === task._id.toString()
  )?.role;

  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    if (userTaskRole !== "Not assigned yet" || currentUser.is_admin === "Yes")
      setIsDisabled(false);
  }, [userTaskRole]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const res = await apiRequest(
        `${proxy}/backend/task/add-activity/${params.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: select.toLowerCase(),
            description: text,
            date: new Date(),
          }),
        }
      );

      if (!res) return;

      const data = await res.json();

      if (data.success === false) {
        setErrorr(data.message);
        setIsLoading(false);
        return;
      }

      setActivities(data.activities);

      setIsLoading(false);
      setErrorr(null);
      navigate(`/task/${id}`);
    } catch (error) {
      console.log(error.message);
      setErrorr(error.message);
      setIsLoading(false);
      return;
    }
  };

  const [openEditActivity, setOpenEditActivity] = useState(false);
  const [activityData, setActivityData] = useState(null);
  const [activityIndex, setActivityIndex] = useState(null);
  const [taskIdActivity, settaskIdActivity] = useState(null);

  const handleOpenEditActivityOnClick = (s_data, taskid, sindex) => {
    setActivityData(s_data);
    settaskIdActivity(taskid);
    setActivityIndex(sindex);
    setOpenEditActivity(true);
  };

  const handleDeleteActivityOnClick = async (taskID, activityIndex) => {
    try {
      const res = await apiRequest(
        `${proxy}/backend/task/delete-task-details-activity`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskID: taskID,
            activityIndex: activityIndex,
          }),
        }
      );

      if (!res) return;

      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setActivities((prevSubtasks) =>
        prevSubtasks.filter((_, index) => index !== activityIndex)
      );
    } catch (error) {
      console.error(error.message);
      return;
    }
  };

  return (
    <>
      <div className="w-full flex gap-10 2xl:gap-20 flex-col md:flex-row overflow-y-auto">
        <div className="w-full md:w-1/2 pl-1">
          <PageTitle title="Activities" />
          <div className="w-full mt-5">
            {activity && activity.length > 0 ? (
              activity.map((item, index) => (
                <Fragment key={index + item}>
                  <div className="grid grid-cols-[2fr_1fr] justify-between">
                    <Card
                      item={item}
                      isConnected={index < activity.length - 1}
                    />
                    {(currentUser.is_admin === "Yes" ||
                      currentUser._id === item.by._id) && (
                      <>
                        <div className="">
                          <button
                            className="px-2 py-2 rounded 
                                text-red-500 font-sans
                                hover:text-red-300 transition duration-200
                                font-medium "
                            onClick={() =>
                              handleDeleteActivityOnClick(task._id, index)
                            }
                          >
                            {<CiCircleRemove className="text-3xl mr-2" />}
                          </button>
                          <button
                            className="px-2 py-2 rounded 
                                text-blue-500 font-sans
                                hover:text-blue-300 transition duration-200
                                font-medium "
                            onClick={() =>
                              handleOpenEditActivityOnClick(
                                item,
                                task._id,
                                index
                              )
                            }
                          >
                            {<CiEdit className="text-3xl" />}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </Fragment>
              ))
            ) : (
              <p className="text-lg font-serif">No activities available.</p>
            )}
          </div>
        </div>

        <div className="w-full md:w-1/3 pl-1">
          <PageTitle title="Add Activity" />
          <div className="w-full flex flex-wrap gap-5 mt-5 ">
            {act_types.map((act, index) => (
              <div key={act + index} className="flex gap-2 items-center">
                <input
                  disabled={isDisabled}
                  type="checkbox"
                  className="size-4 disabled:cursor-not-allowed"
                  checked={select === act ? true : false}
                  onChange={(e) => setSelect(act)}
                ></input>
                <p className="font-serif">{act}</p>
              </div>
            ))}
            <textarea
              disabled={isDisabled}
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder=" Type here..."
              className="border border-black w-full mr-4 mb-5 rounded py-2 px-4 disabled:cursor-not-allowed"
            ></textarea>
            {isLoading ? (
              <Loading></Loading>
            ) : (
              <button
                className="px-3 py-2 rounded-lg
                                 bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium mb-2 -mt-6 disabled:cursor-not-allowed
                                disabled:bg-blue-500"
                onClick={handleSubmit}
                disabled={isDisabled}
              >
                Submit
              </button>
            )}
            {Errorr && <p className="text-red-500 text-4xl">{Errorr}</p>}
          </div>
        </div>
      </div>
      <DialogEditActivity
        open={openEditActivity}
        setOpen={setOpenEditActivity}
        setActivities={setActivities}
        taskID={taskIdActivity}
        activityIndex={activityIndex}
        activityData={activityData}
      />
    </>
  );
};

const Card = ({ item, isConnected }) => {
  return (
    <>
      <div className="flex space-x-4">
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-10 h-10 flex items-center justify-center">
            {activitiy_types[item?.type]}
          </div>

          <div
            className={clsx(
              "w-full flex items-center  ml-10",
              isConnected ? "min-h-[100px]" : "min-h-[0px]"
            )}
          >
            <div className="w-0.5 bg-gray-400 h-full"></div>
          </div>
        </div>

        <div className="flex flex-col gap-y-1 mb-8">
          <p className="font-semibold">
            {item?.by?.first_name + " " + item?.by?.last_name}
          </p>
          <div className="font-thin space-y-2">
            <span className="capitalize mr-2">{item?.type}</span>
            <span className="text-sm">{moment(item?.date).fromNow()}</span>
          </div>

          <div className="text-gray-700">{item?.description}</div>
        </div>
      </div>
    </>
  );
};

export default TaskDetails;
