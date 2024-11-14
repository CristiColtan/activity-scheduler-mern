import React, {useState, useEffect} from 'react'
import { useSelector } from 'react-redux';
import clsx from "clsx"
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

import Loading from './Loading.jsx';
import PageTitle from './PageTitle.jsx';

import { IoIosArrowDown } from "react-icons/io";
import { BsPersonSquare } from "react-icons/bs";
import { HiDocumentReport } from "react-icons/hi";
import { FaRegFolderOpen } from "react-icons/fa6";

import { MdKeyboardArrowUp } from "react-icons/md";
import { MdKeyboardDoubleArrowUp } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";
import { GoDash } from "react-icons/go";

import { getInitials } from '../utils/FullnameInitials.js';
import { priority_styles, task_type, bgs } from '../utils/tableImports.js';

import DialogDeleteConfirmTeamMember from './dialog/DialogDeleteConfirmTeamMember.jsx';
import AddTeamMember from './AddTeamMember.jsx';
import EditUser from './EditUser.jsx';
import AdminTabs from './admin/AdminTabs.jsx';

const TeamManager = () => {
    const navigate = useNavigate();

  const t_icons = {
      high: <MdKeyboardDoubleArrowUp />,
      medium: <MdKeyboardArrowUp />,
      normal: <GoDash />,
      low: <MdKeyboardArrowDown />,
    };

  const { currentUser, error } = useSelector((state) => state.user)
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
  }

  const editUserHandlerOnClick = (e_u_data) => {
    setEditUserData(e_u_data);
    setOpenEditUser(true);
  }

  const fetchMyTeam = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:8081/backend/team-manager/get/my-team", {
        credentials: "include",
      });

      const data = await res.json();
      setTeamManagerTeam(data);
    } catch (error) {
      console.log(error.message);
      setLoading(false);
      return;
    }
    setLoading(false);
  }

  console.log("TEAM", teamManagerTeam);

  useEffect(() => {
    fetchMyTeam();
  }, []);

  useEffect(() => {
    if (openEditUser === false)
      fetchMyTeam();
    if (openDialogDelete === false)
      fetchMyTeam();
    if (openAddTeamMember === false)
      fetchMyTeam();
  }, [openAddTeamMember, openDialogDelete, openEditUser]);

  const MyTableHeaderUsers = () => {
    return (
      <thead className='border-b border-black'>
        <tr className='text-black text-left'>
          <th className='py-2'>Name</th>
          <th className='py-2 hidden lg:block'>Email</th>
          <th className='py-2 pr-4'></th>
          <th className='py-2'>Status</th>
          <th className='py-2 px-2 hidden lg:block'>Created</th>
        </tr>
      </thead>
    )
  }

  const TableHeaderRoles = () => {
    return (
      <thead className='border-b border-gray-500'>
        <tr className='text-black text-left'>
          <th className='py-2'>Task Title</th>
          <th className='py-2 pr-4'>Priority</th>
          <th className='py-2'>Role Assigned</th>
        </tr>
      </thead>
    )
    
  }

  const tabs = [{
      title: "Roles",
      icon: <BsPersonSquare className='text-lg' size={20} />
    }, {
      title: "Report",
      icon: <HiDocumentReport className='text-lg' size={20} />
    }];

  const MyTableRowUsers = ({ user }) => {
    const [expand, setExpand] = useState(false);
    const [selected, setSelected] = useState(0);

    const switchOnClick = () => {
      setExpand((prevExpand) => !prevExpand);
      if (!expand)
        setSelected(0);
    };

    console.log(expand);

    return (
      <>
        <tr className={clsx('text-black hover:bg-gray-200', !expand && 'border-b border-black')}>
          <td className='py-2'>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-violet-500'>
                <span className='text-center'>{getInitials(user.first_name, user.last_name)}</span>
              </div>
              <div>
                <p className='font-serif'>{user.first_name + user.last_name}</p>
                <span className='font-thin'>{user.title}</span>
              </div>
            </div>
          </td>

          <td className='py-2 hidden lg:table-cell'>
            <p className='font-thin '>{user.email}</p>
          </td>
              
          <td className='py-2'>
          </td>
               
          <td className='py-2'>
            <button className={clsx('w-fit px-3 py-1 rounded-full font-serif cursor-default', (user.is_active === "Yes") ?
              "bg-blue-200 hover:bg-blue-400" : "bg-yellow-200 hover:bg-yellow-400")}
            >
              {(user.is_active === "Yes") ? "Active" : "Disabled"}
            </button>
          </td>

          <td className='py-2 font-thin px-2 hidden lg:table-cell'>
            <span className=''>{moment(user.createdAt).fromNow()}</span>
          </td>

          <td className='p-2 '>
            <div className='flex justify-end gap-4'>
              {/*<button className='font-medium text-blue-700 hover:text-blue-500'
              onClick={() => editUserHandlerOnClick(user)}>Edit</button>*/}
              <button className='ml-1'>
                <IoIosArrowDown onClick={switchOnClick}
                  className='text-xl text-black hover:text-gray-500' />
              </button>
              <button className='font-medium text-red-700 hover:text-red-500 hidden md:block'
                onClick={() => userDeleteHandlerOnClick(user)}>Delete</button>
            </div>
          </td>
        </tr>

        {
          expand && (
            <tr className='text-black border-b border-black table-row'>
              <td colSpan="5">
                <AdminTabs tabs={tabs} selectedd={selected} setSelected={setSelected}>
                  {selected === 0 && (
                    <>
                      <table className='w-full mb-5'>
                        <TableHeaderRoles />
                        {user.roles && user.roles.length > 0 ? (
                          <>
                            {user.roles.map((role, index) => (
                              <tr key={index} className=" border-b border-gray-300 py-2 hover:bg-gray-200">
                                <td className='py-2 pr-2'>
                                  <div className='flex items-center gap-3'>
                                    <div className={clsx("w-4 h-4 rounded-full", task_type[role.task?.stage])} />
                                    <p className='font-serif'>{role.task?.title || "N/A"}
                                      <span className='font-semibold'>{(role.task?.is_trashed === "Yes") && " (Trashed)"}</span>
                                    </p>
                                  </div>
                                </td>

                                <td className='pr-4'>
                                  <div className='flex items-center gap-1'>
                                    <span className={clsx("text-xl", priority_styles[role.task?.priority])}>
                                      {t_icons[role.task?.priority]}
                                    </span>
                                    <span className='font-thin'>{role.task?.priority}</span>
                                  </div>
                                </td>

                                <td>
                                  <div>
                                    <span className='font-serif'>{role.role}</span>
                                  </div>
                                </td>

                                <td className='p-2'>
                                  <div className='flex justify-end gap-3'>
                                    <button className='px-1 mr-1' onClick={() => navigate(`/task/${role.task?._id}`)}>
                                      <FaRegFolderOpen
                                        className='text-xl text-yellow-600 hover:text-yellow-500' />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </>) : (
                          <>
                            <tr>
                              <td colSpan="5" className="text-center py-4 text-lg">
                                <p>No roles assigned.</p>
                              </td>
                            </tr>
                          </>
                        )}
                      </table>
                    </>
                  )}
                </AdminTabs>
              </td>
            </tr>
          )}
      </>
    )
  }

  return (
    loading ? (<div><Loading /></div>) : (
      <>
        <div className='w-full bg-white rounded shadow-lg mb-8'>
          <div className='flex items-center justify-between px-2 py-2'>
            <PageTitle title="My Team" />
            <button className='px-3 py-2 rounded-lg
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium' onClick={() => setOpenAddTeamMember(true)}>
              <span>+ Add new Team Member</span>
            </button>
          </div>
        </div>
        <div className='w-full bg-white h-fit px-2 md:px-6 py-4 shadow-lg rounded'>
          <table className='w-full mb-5'>
            <MyTableHeaderUsers />
            <tbody>
              {
                teamManagerTeam && teamManagerTeam.length > 0 ?
                  (
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
                  )
              }
            </tbody>
          </table>
        </div>
        
        <div>
          {error && <p className="text-red-500">{error}</p>}
        </div>
        
        <DialogDeleteConfirmTeamMember open={openDialogDelete} setOpen={setOpenDialogDelete} userData={deleteUserData} />
        <AddTeamMember open={openAddTeamMember} setOpen={setOpenAddTeamMember} />
        {/*<EditUser open={openEditUser} setOpen={setOpenEditUser} data={editUserData} />*/}
      </>
    )
  )
}

export default TeamManager