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

import DialogStatusAction from "./dialog/DialogStatusAction.jsx";
import DialogDeleteConfirmTeamManager from "./dialog/DialogDeleteConfirmTeamManager.jsx";
import AddTeamManager from "./AddTeamManager.jsx";
import EditUser from "./EditUser.jsx";
import AdminTabs from "./admin/AdminTabs.jsx";

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
} from "recharts";

import CustomToolTipReportTM1 from "./recharts/CustomToolTipReportTM1.jsx";

import { apiRequest } from "../utils/apiReq.js";

const TeamAdmin = () => {
  const navigate = useNavigate();

  const t_icons = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    normal: <GoDash />,
    low: <MdKeyboardArrowDown />,
  };

  const { currentUser, error } = useSelector((state) => state.user);
  const [adminTeamManagers, setAdminTeamManagers] = useState([]);
  const [loading, setLoading] = useState(false);

  console.log("Team managers: ", adminTeamManagers);

  const [openDialogDelete, setOpenDialogDelete] = useState(false);
  const [openAddTeamManager, setOpenAddTeamManager] = useState(false);
  const [openEditUser, setOpenEditUser] = useState(false);
  const [openDialogStatusAction, setOpenDialogStatusAction] = useState(false);

  const [userData, setUserData] = useState(null);
  const [deleteUserData, setDeleteUserData] = useState(null);
  const [editUserData, setEditUserData] = useState(null);

  const userDeleteHandlerOnClick = (d_u_data) => {
    setDeleteUserData(d_u_data);
    setOpenDialogDelete(true);
  };

  const userActionHandlerOnClick = (u_data) => {
    setUserData(u_data);
    setOpenDialogStatusAction(true);
  };

  const editUserHandlerOnClick = (e_u_data) => {
    setEditUserData(e_u_data);
    setOpenEditUser(true);
  };

  const fetchAdminTeamManagers = async () => {
    try {
      setLoading(true);

      const res = await apiRequest(
        "http://localhost:8081/backend/admin/get/team-managers"
      );

      if (!res) return;

      const data = await res.json();
      setAdminTeamManagers(data);
    } catch (error) {
      console.log(error.message);
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminTeamManagers();
  }, []);

  useEffect(() => {
    if (openDialogStatusAction === false) fetchAdminTeamManagers();
    if (openEditUser === false) fetchAdminTeamManagers();
    if (openAddTeamManager === false) fetchAdminTeamManagers();
    if (openDialogDelete === false) fetchAdminTeamManagers();
  }, [
    openAddTeamManager,
    openDialogDelete,
    openEditUser,
    openDialogStatusAction,
  ]);

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
          <th className="py-2">Priority</th>
          <th className="py-2">Role Assigned</th>
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
      title: "Report",
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

    //reports
    const [loadingReports, setLoadingReports] = useState(false);
    const [errorReports, setErrorReports] = useState(null);
    const [reportsData, setReportsData] = useState({});

    const [activeIndex1, setActiveIndex1] = useState(-1);
    const COLORSS = ["#1A8E01", "#008678", "#00437D", "#6B007D", "#7D0000"];
    const onPieEnter1 = (_, index) => {
      setActiveIndex1(index);
    };

    const [showReports, setShowReports] = useState(false);

    const fetchReports = async () => {
      try {
        setLoadingReports(true);

        const res = await fetch(
          `http://localhost:8081/backend/admin/get/reports-TM/${user._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        const data = await res.json();
        if (data.success === false) {
          console.log(data.message);
          setErrorReports(data.message);
          setLoadingReports(false);
          return;
        }

        setLoadingReports(false);
        setErrorReports(null);
        setShowReports(true);
        setReportsData(data);
      } catch (error) {
        console.log(error.message);
        setErrorReports(error);
        setLoadingReports(false);
        return;
      }
    };

    useEffect(() => {
      fetchReports();
    }, []);

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
                "w-fit px-3 py-1 rounded-full font-serif",
                user.is_active === "Yes"
                  ? "bg-blue-200 hover:bg-blue-400"
                  : "bg-yellow-200 hover:bg-yellow-400"
              )}
              onClick={() => userActionHandlerOnClick(user)}
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
                          Tasks proportion depending on their stage.
                        </p>
                        <div className="w-full grid grid-cols-1 justify-center items-center gap-x-6 gap-y-2 mt-4">
                          {loadingReports && <Loading />}
                          {errorReports && (
                            <p className="text-red-500 text-center">
                              {errorReports}
                            </p>
                          )}
                          {!loadingReports && !errorReports && showReports && (
                            <>
                              {reportsData?.taskStatusDistribution?.length >
                              0 ? (
                                <>
                                  <div className="">
                                    <ResponsiveContainer
                                      width={"100%"}
                                      height={300}
                                    >
                                      <PieChart width={150} height={150}>
                                        <Pie
                                          activeIndex={activeIndex1}
                                          data={
                                            reportsData.taskStatusDistribution
                                          }
                                          dataKey="total"
                                          nameKey="name"
                                          fill="black"
                                          outerRadius={150}
                                          innerRadius={90}
                                          onMouseEnter={onPieEnter1}
                                          style={{
                                            cursor: "pointer",
                                            outline: "none",
                                          }}
                                        >
                                          {reportsData.taskStatusDistribution.map(
                                            (entry, index) => (
                                              <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                  task_type_report[entry.name]
                                                }
                                              />
                                            )
                                          )}
                                        </Pie>
                                        <Tooltip
                                          content={<CustomToolTipReportTM1 />}
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
                      <br></br>
                      <div className="w-full flex flex-col gap-2">
                        <p className="font-serif">
                          The contribution of team members through the number of
                          hours worked on tasks.
                        </p>
                        <div className="w-full grid grid-cols-1 justify-center items-center gap-x-6 gap-y-2 mt-4">
                          {loadingReports && <Loading />}
                          {errorReports && (
                            <p className="text-red-500 text-center">
                              {errorReports}
                            </p>
                          )}
                          {!loadingReports && !errorReports && showReports && (
                            <>
                              {reportsData?.teamEfficency?.length > 0 ? (
                                <>
                                  <div className="">
                                    <ResponsiveContainer
                                      width={"100%"}
                                      height={300}
                                    >
                                      <BarChart
                                        data={reportsData.teamEfficency}
                                      >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="hours" fill="#6B007D">
                                          {reportsData?.teamEfficiency?.map(
                                            (entry, index) => (
                                              <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                  COLORSS[
                                                    index % COLORSS.length
                                                  ]
                                                }
                                              />
                                            )
                                          )}
                                        </Bar>
                                      </BarChart>
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
          <PageTitle title="Team Managers" />
          <button
            className="px-3 py-2 rounded-lg
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium"
            onClick={() => setOpenAddTeamManager(true)}
          >
            <span>+ Add new Team Manager</span>
          </button>
        </div>
      </div>
      <div className="w-full bg-white h-fit px-2 md:px-6 py-4 shadow-lg rounded">
        <table className="w-full mb-5">
          <MyTableHeaderUsers />
          <tbody>
            {adminTeamManagers && adminTeamManagers.length > 0 ? (
              adminTeamManagers.map((user, index) => (
                <MyTableRowUsers key={index + user._id} user={user} />
              ))
            ) : (
              <>
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No team managers found.
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      <div>{error && <p className="text-red-500">{error}</p>}</div>

      <DialogStatusAction
        open={openDialogStatusAction}
        setOpen={setOpenDialogStatusAction}
        userData={userData}
      />
      <DialogDeleteConfirmTeamManager
        open={openDialogDelete}
        setOpen={setOpenDialogDelete}
        userData={deleteUserData}
      />
      <AddTeamManager
        open={openAddTeamManager}
        setOpen={setOpenAddTeamManager}
      />
      {/*<EditUser open={openEditUser} setOpen={setOpenEditUser} data={editUserData} />*/}
    </>
  );
};

export default TeamAdmin;
