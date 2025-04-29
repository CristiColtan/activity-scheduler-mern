import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import clsx from "clsx";
import moment from "moment";
import { useNavigate } from "react-router-dom";

import Loading from "./Loading.jsx";
import PageTitle from "./PageTitle.jsx";

import { IoIosArrowDown } from "react-icons/io";
import { BsPersonSquare } from "react-icons/bs";
import { HiDocumentReport } from "react-icons/hi";
import { FaRegFolderOpen } from "react-icons/fa6";

import { MdKeyboardArrowUp } from "react-icons/md";
import { MdKeyboardDoubleArrowUp } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";
import { GoDash } from "react-icons/go";

import { getInitials } from "../utils/FullnameInitials.js";
import {
  priority_styles,
  task_type,
  bgs,
  task_type_report,
} from "../utils/tableImports.js";

import DialogDeleteConfirmTeamMember from "./dialog/DialogDeleteConfirmTeamMember.jsx";
import AddTeamMember from "./AddTeamMember.jsx";
import EditUser from "./EditUser.jsx";
import AdminTabs from "./admin/AdminTabs.jsx";

import CustomToolTipReport1 from "./recharts/CustomToolTipReport1.jsx";
import CustomToolTipReport2 from "./recharts/CustomToolTipReport2.jsx";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";

import { proxy } from "../utils/deployment.js";
import { apiRequest } from "../utils/apiReq.js";

const TeamManager = () => {
  const navigate = useNavigate();

  const t_icons = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    normal: <GoDash />,
    low: <MdKeyboardArrowDown />,
  };

  const { currentUser, error } = useSelector((state) => state.user);
  const [teamManagerTeam, setTeamManagerTeam] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openDialogDelete, setOpenDialogDelete] = useState(false);
  const [openAddTeamMember, setOpenAddTeamMember] = useState(false);
  const [openEditUser, setOpenEditUser] = useState(false);

  const [deleteUserData, setDeleteUserData] = useState(null);
  const [editUserData, setEditUserData] = useState(null);

  const userDeleteHandlerOnClick = (d_u_data) => {
    setDeleteUserData(d_u_data);
    setOpenDialogDelete(true);
  };

  const editUserHandlerOnClick = (e_u_data) => {
    setEditUserData(e_u_data);
    setOpenEditUser(true);
  };

  const fetchMyTeam = async () => {
    try {
      setLoading(true);

      const res = await apiRequest(`${proxy}/backend/team-manager/get/my-team`);

      if (!res) return;

      const data = await res.json();
      setTeamManagerTeam(data);
    } catch (error) {
      console.log(error.message);
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  console.log("TEAM", teamManagerTeam);

  useEffect(() => {
    fetchMyTeam();
  }, []);

  useEffect(() => {
    if (openEditUser === false) fetchMyTeam();
    if (openDialogDelete === false) fetchMyTeam();
    if (openAddTeamMember === false) fetchMyTeam();
  }, [openAddTeamMember, openDialogDelete, openEditUser]);

  const MyTableHeaderUsers = () => {
    return (
      <thead className="border-b border-black">
        <tr className="text-black text-left">
          <th className="py-2">Name</th>
          <th className="py-2 hidden lg:block">Email</th>
          <th className="py-2 pr-4"></th>
          <th className="py-2">Status</th>
          <th className="py-2 px-2 hidden lg:block">Created</th>
        </tr>
      </thead>
    );
  };

  const TableHeaderRoles = () => {
    return (
      <thead className="border-b border-gray-500">
        <tr className="text-black text-left">
          <th className="py-2">Task Title</th>
          <th className="py-2 pr-4">Priority</th>
          <th className="py-2">Role Assigned</th>
        </tr>
      </thead>
    );
  };

  const TableHeaderFilteredTasks = () => {
    return (
      <thead className="border-b border-black">
        <tr className="text-black text-left">
          <th className="py-2">Task Title</th>
          <th className="py-2 lg:hidden block">Priority</th>
          <th className="py-2"></th>
        </tr>
      </thead>
    );
  };

  const tabs = [
    {
      title: "Roles",
      icon: <BsPersonSquare className="text-lg" size={20} />,
    },
    {
      title: "Report 1",
      icon: <HiDocumentReport className="text-lg" size={20} />,
    },
    {
      title: "Report 2",
      icon: <HiDocumentReport className="text-lg" size={20} />,
    },
  ];

  const MyTableRowUsers = ({ user }) => {
    const [expand, setExpand] = useState(false);
    const [selected, setSelected] = useState(0);

    const switchOnClick = () => {
      setExpand((prevExpand) => !prevExpand);
      if (!expand) setSelected(0);
    };

    console.log(expand);

    // form for both reports
    const [formData, setFormData] = useState({});

    console.log("formDatas", formData);

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.id]: e.target.value });
    };
    //

    // report 1
    const [loadingReport1, setLoadingReport1] = useState(false);
    const [errorReport1, setErrorReport1] = useState(null);
    const [reportData1, setReportData1] = useState({});

    console.log("reportData", reportData1);

    const [activeIndex1, setActiveIndex1] = useState(-1);
    const COLORS = ["#D60000", "#F46300", "#0358B6", "#44DE28", "#F29191"];
    const onPieEnter1 = (_, index) => {
      setActiveIndex1(index);
    };

    const [showReport1, setShowReport1] = useState(false);
    const fetchReport1 = async () => {
      try {
        setLoadingReport1(true);

        const res = await apiRequest(
          `${proxy}/backend/team-manager/get/report-1/${user._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        if (!res) return;

        const data = await res.json();
        if (data.success === false) {
          console.log(data.message);
          setErrorReport1(data.message);
          setLoadingReport1(false);
          return;
        }

        setLoadingReport1(false);
        setErrorReport1(null);
        setShowReport1(true);
        setReportData1(data);
      } catch (error) {
        console.log(error.message);
        setErrorReport1(error);
        setLoadingReport1(false);
        return;
      }
    };

    //report 2
    const [loadingReport2, setLoadingReport2] = useState(false);
    const [errorReport2, setErrorReport2] = useState(null);
    const [reportData2, setReportData2] = useState({});

    console.log("reportData2", reportData2);

    const [activeIndex2, setActiveIndex2] = useState(-1);
    const COLORSS = ["#1A8E01", "#008678", "#00437D", "#6B007D", "#7D0000"];
    const onPieEnter2 = (_, index) => {
      setActiveIndex2(index);
    };

    const [showReport2, setShowReport2] = useState(false);
    const fetchReport2 = async () => {
      try {
        setLoadingReport2(true);

        const res = await apiRequest(
          `${proxy}/backend/team-manager/get/report-2/${user._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        if (!res) return;

        const data = await res.json();
        if (data.success === false) {
          console.log(data.message);
          setErrorReport2(data.message);
          setLoadingReport2(false);
          return;
        }

        setLoadingReport2(false);
        setErrorReport2(null);
        setShowReport2(true);
        setReportData2(data);
      } catch (error) {
        console.log(error.message);
        setErrorReport2(error);
        setLoadingReport2(false);
        return;
      }
    };

    return (
      <>
        <tr
          className={clsx(
            "text-black hover:bg-gray-200",
            !expand && "border-b border-black"
          )}
        >
          <td className="py-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-violet-500">
                <span className="text-center">
                  {getInitials(user.first_name, user.last_name)}
                </span>
              </div>
              <div>
                <p className="font-serif">
                  {user.first_name + " " + user.last_name}
                </p>
                <span className="font-thin">{user.title}</span>
              </div>
            </div>
          </td>

          <td className="py-2 hidden lg:table-cell">
            <p className="font-thin ">{user.email}</p>
          </td>

          <td className="py-2"></td>

          <td className="py-2">
            <button
              className={clsx(
                "w-fit px-3 py-1 rounded-full font-serif cursor-default",
                user.is_active === "Yes"
                  ? "bg-blue-200 hover:bg-blue-400"
                  : "bg-yellow-200 hover:bg-yellow-400"
              )}
            >
              {user.is_active === "Yes" ? "Active" : "Disabled"}
            </button>
          </td>

          <td className="py-2 font-thin px-2 hidden lg:table-cell">
            <span className="">{moment(user.createdAt).fromNow()}</span>
          </td>

          <td className="p-2 ">
            <div className="flex justify-end gap-4">
              {/*<button className='font-medium text-blue-700 hover:text-blue-500'
              onClick={() => editUserHandlerOnClick(user)}>Edit</button>*/}
              <button className="ml-1">
                <IoIosArrowDown
                  onClick={switchOnClick}
                  className="text-xl text-black hover:text-gray-500"
                />
              </button>
              <button
                className="font-medium text-red-700 hover:text-red-500 hidden md:block"
                onClick={() => userDeleteHandlerOnClick(user)}
              >
                Delete
              </button>
            </div>
          </td>
        </tr>

        {expand && (
          <tr className="text-black border-b border-black table-row">
            <td colSpan="5">
              <AdminTabs
                tabs={tabs}
                selectedd={selected}
                setSelected={setSelected}
              >
                {selected === 0 && (
                  <>
                    <table className="w-full mb-5">
                      <TableHeaderRoles />
                      {user.roles && user.roles.length > 0 ? (
                        <>
                          {user.roles.map((role, index) => (
                            <tr
                              key={index}
                              className=" border-b border-gray-300 py-2 hover:bg-gray-200"
                            >
                              <td className="py-2 pr-2">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={clsx(
                                      "w-4 h-4 rounded-full",
                                      task_type[role.task?.stage]
                                    )}
                                  />
                                  <p className="font-serif">
                                    {role.task?.title || "N/A"}
                                    <span className="font-semibold">
                                      {role.task?.is_trashed === "Yes" &&
                                        " (Trashed)"}
                                    </span>
                                  </p>
                                </div>
                              </td>

                              <td className="pr-4">
                                <div className="flex items-center gap-1">
                                  <span
                                    className={clsx(
                                      "text-xl",
                                      priority_styles[role.task?.priority]
                                    )}
                                  >
                                    {t_icons[role.task?.priority]}
                                  </span>
                                  <span className="font-thin">
                                    {role.task?.priority}
                                  </span>
                                </div>
                              </td>

                              <td>
                                <div>
                                  <span className="font-serif">
                                    {role.role}
                                  </span>
                                </div>
                              </td>

                              <td className="p-2">
                                <div className="flex justify-end gap-3">
                                  <button
                                    className="px-1 mr-1"
                                    onClick={() =>
                                      navigate(`/task/${role.task?._id}`)
                                    }
                                  >
                                    <FaRegFolderOpen className="text-xl text-yellow-600 hover:text-yellow-500" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </>
                      ) : (
                        <>
                          <tr>
                            <td
                              colSpan="5"
                              className="text-center py-4 text-lg"
                            >
                              <p>No roles assigned.</p>
                            </td>
                          </tr>
                        </>
                      )}
                    </table>
                  </>
                )}
                {selected === 1 && (
                  <>
                    <div className="w-full flex flex-col overflow-y-hidden gap-4">
                      <div className="w-full flex flex-col gap-2">
                        <p className="font-serif">
                          Select a time period to generate a report of hours
                          worked on each task.
                        </p>
                        <div className="w-full grid lg:grid-cols-2 grid-cols-1 gap-x-6 gap-y-2 px-10">
                          <div>
                            <label className="font-thin text-base mb-2">
                              From:
                            </label>
                            <input
                              type="date"
                              required
                              id="date_from"
                              onChange={handleChange}
                              className="border py-1 px-2 placeholder-black focus:ring-2 ring-blue-300 outline-none
                            border-black focus:placeholder-gray-500 rounded mb-5 mt-1 w-full"
                            ></input>
                          </div>
                          <div>
                            <label className="font-thin text-base mb-2">
                              Until:
                            </label>
                            <input
                              type="date"
                              required
                              id="date_until"
                              onChange={handleChange}
                              className="border py-1 px-2 placeholder-black focus:ring-2 ring-blue-300 outline-none
                            border-black focus:placeholder-gray-500 rounded mb-5 mt-1 w-full"
                            ></input>
                          </div>
                        </div>
                        <div className="flex justify-center items-center">
                          <button
                            disabled={loadingReport1}
                            className="px-3 py-2 rounded w-1/2
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium disabled:bg-blue-500"
                            onClick={() => fetchReport1()}
                          >
                            {loading ? "Generating..." : "Generate"}
                          </button>
                        </div>
                      </div>
                      <div className="w-full grid lg:grid-cols-[2fr_1fr] grid-cols-1 gap-x-6 gap-y-2 mt-4">
                        {loadingReport1 && <Loading />}
                        {errorReport1 && (
                          <p className="text-red-500 text-center">
                            {errorReport1}
                          </p>
                        )}
                        {!loadingReport1 && !errorReport1 && showReport1 && (
                          <>
                            {reportData1?.taskHours?.length > 0 ? (
                              <>
                                <div className="">
                                  <ResponsiveContainer
                                    width={"100%"}
                                    height={300}
                                  >
                                    <PieChart width={150} height={150}>
                                      <Pie
                                        activeIndex={activeIndex1}
                                        data={reportData1.taskHours.map(
                                          (entry) => ({
                                            ...entry,
                                            task: reportData1.filteredTasks.find(
                                              (task) =>
                                                task.title === entry.name
                                            ),
                                          })
                                        )}
                                        dataKey="total"
                                        fill="green"
                                        outerRadius={150}
                                        onMouseEnter={onPieEnter1}
                                        style={{
                                          cursor: "pointer",
                                          outline: "none",
                                        }}
                                      >
                                        {reportData1.taskHours.map(
                                          (entry, index) => (
                                            <Cell
                                              key={`cell-${index}`}
                                              fill={
                                                COLORS[index % COLORS.length]
                                              }
                                            />
                                          )
                                        )}
                                      </Pie>
                                      <Tooltip
                                        content={<CustomToolTipReport1 />}
                                      />
                                    </PieChart>
                                  </ResponsiveContainer>
                                </div>
                                <div>
                                  <table className="w-full">
                                    <TableHeaderFilteredTasks />
                                    {reportData1.filteredTasks &&
                                      reportData1.filteredTasks.length > 0 && (
                                        <>
                                          {reportData1.filteredTasks.map(
                                            (task, index) => (
                                              <tr
                                                key={index}
                                                className=" border-b border-gray-300 py-2 hover:bg-gray-200"
                                              >
                                                <td className="py-2 pr-2">
                                                  <div className="flex items-center gap-3">
                                                    <div
                                                      className={clsx(
                                                        "w-4 h-4 rounded-full",
                                                        task_type[task?.stage]
                                                      )}
                                                    />
                                                    <p className="font-serif text-clamp-1">
                                                      {task?.title || "N/A"}
                                                      <span className="font-semibold">
                                                        {task?.is_trashed ===
                                                          "Yes" && " (Trashed)"}
                                                      </span>
                                                    </p>
                                                  </div>
                                                </td>

                                                <td className="pr-4 lg:hidden table-cell">
                                                  <div className="flex items-center gap-1">
                                                    <span
                                                      className={clsx(
                                                        "text-xl",
                                                        priority_styles[
                                                          task?.priority
                                                        ]
                                                      )}
                                                    >
                                                      {t_icons[task?.priority]}
                                                    </span>
                                                    <span className="font-thin">
                                                      {task?.priority}
                                                    </span>
                                                  </div>
                                                </td>

                                                <td className="p-2">
                                                  <div className="flex justify-end gap-3">
                                                    <button
                                                      className="px-1 mr-1"
                                                      onClick={() =>
                                                        navigate(
                                                          `/task/${task?._id}`
                                                        )
                                                      }
                                                    >
                                                      <FaRegFolderOpen className="text-xl text-yellow-600 hover:text-yellow-500" />
                                                    </button>
                                                  </div>
                                                </td>
                                              </tr>
                                            )
                                          )}
                                        </>
                                      )}
                                  </table>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-center text-lg font-serif text-red-500">
                                  No data available.
                                </p>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
                {selected === 2 && (
                  <>
                    <div className="w-full flex flex-col overflow-y-hidden gap-4">
                      <div className="w-full flex flex-col gap-2">
                        <p className="font-serif">
                          Select a time period to generate a report of hours
                          worked based on roles.
                        </p>
                        <div className="w-full grid lg:grid-cols-2 grid-cols-1 gap-x-6 gap-y-2 px-10">
                          <div>
                            <label className="font-thin text-base mb-2">
                              From:
                            </label>
                            <input
                              type="date"
                              required
                              id="date_from"
                              onChange={handleChange}
                              className="border py-1 px-2 placeholder-black focus:ring-2 ring-blue-300 outline-none
                            border-black focus:placeholder-gray-500 rounded mb-5 mt-1 w-full"
                            ></input>
                          </div>
                          <div>
                            <label className="font-thin text-base mb-2">
                              Until:
                            </label>
                            <input
                              type="date"
                              required
                              id="date_until"
                              onChange={handleChange}
                              className="border py-1 px-2 placeholder-black focus:ring-2 ring-blue-300 outline-none
                            border-black focus:placeholder-gray-500 rounded mb-5 mt-1 w-full"
                            ></input>
                          </div>
                        </div>
                        <div className="flex justify-center items-center">
                          <button
                            disabled={loadingReport2}
                            className="px-3 py-2 rounded w-1/2
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium disabled:bg-blue-500"
                            onClick={() => fetchReport2()}
                          >
                            {loading ? "Generating..." : "Generate"}
                          </button>
                        </div>
                      </div>
                      <div className="w-full grid grid-cols-1 justify-center items-center gap-x-6 gap-y-2 mt-4">
                        {loadingReport2 && <Loading />}
                        {errorReport2 && (
                          <p className="text-red-500 text-center">
                            {errorReport2}
                          </p>
                        )}
                        {!loadingReport2 && !errorReport2 && showReport2 && (
                          <>
                            {reportData2?.length > 0 ? (
                              <>
                                <div className="">
                                  <ResponsiveContainer
                                    width={"100%"}
                                    height={300}
                                  >
                                    <PieChart width={200} height={200}>
                                      <Pie
                                        activeIndex={activeIndex2}
                                        data={reportData2}
                                        dataKey="total"
                                        nameKey="name"
                                        fill="black"
                                        outerRadius={150}
                                        onMouseEnter={onPieEnter2}
                                        style={{
                                          cursor: "pointer",
                                          outline: "none",
                                        }}
                                      >
                                        {reportData2.map((entry, index) => (
                                          <Cell
                                            key={`cell-${index}`}
                                            fill={
                                              COLORSS[index % COLORSS.length]
                                            }
                                          />
                                        ))}
                                      </Pie>
                                      <Tooltip
                                        content={<CustomToolTipReport2 />}
                                      />
                                    </PieChart>
                                  </ResponsiveContainer>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-center text-lg font-serif text-red-500">
                                  No data available.
                                </p>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </AdminTabs>
            </td>
          </tr>
        )}
      </>
    );
  };

  return loading ? (
    <div>
      <Loading />
    </div>
  ) : (
    <>
      <div className="w-full bg-white rounded shadow-lg mb-8">
        <div className="flex items-center justify-between px-2 py-2">
          <PageTitle title="My Team" />
          <button
            className="px-3 py-2 rounded-lg
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium"
            onClick={() => setOpenAddTeamMember(true)}
          >
            <span>+ Add new Team Member</span>
          </button>
        </div>
      </div>
      <div className="w-full bg-white h-fit px-2 md:px-6 py-4 shadow-lg rounded">
        <table className="w-full mb-5">
          <MyTableHeaderUsers />
          <tbody>
            {teamManagerTeam && teamManagerTeam.length > 0 ? (
              teamManagerTeam.map((user, index) => (
                <MyTableRowUsers key={index + user._id} user={user} />
              ))
            ) : (
              <>
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No team members found.
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      <div>{error && <p className="text-red-500">{error}</p>}</div>

      <DialogDeleteConfirmTeamMember
        open={openDialogDelete}
        setOpen={setOpenDialogDelete}
        userData={deleteUserData}
      />
      <AddTeamMember open={openAddTeamMember} setOpen={setOpenAddTeamMember} />
      {/*<EditUser open={openEditUser} setOpen={setOpenEditUser} data={editUserData} />*/}
    </>
  );
};

export default TeamManager;
