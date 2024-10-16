import React, {useState, Fragment, useEffect} from 'react'
import { useSelector } from 'react-redux';
import clsx from "clsx"
import moment from 'moment';

import Loading from './Loading.jsx';
import PageTitle from './PageTitle.jsx';

import { getInitials } from '../utils/FullnameInitials';

import DialogStatusAction from './dialog/DialogStatusAction.jsx';
import DialogDeleteConfirmTeamManager from './dialog/DialogDeleteConfirmTeamManager.jsx';
import AddTeamManager from './AddTeamManager.jsx';
import EditUser from './EditUser.jsx';

const TeamAdmin = () => {
  const { currentUser, error } = useSelector((state) => state.user);
  const [adminTeamManagers, setAdminTeamManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  
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
  }
  
  const userDeleteHandler = () => {
      
  }
  
  const userActionHandlerOnClick = (u_data) => {
    setUserData(u_data);
    setOpenDialogStatusAction(true);
  }
    
  const userActionHandler = () => {

  }
  
  const editUserHandlerOnClick = (e_u_data) => {
    setEditUserData(e_u_data);
    setOpenEditUser(true);
  }

  const editUserHandler = () => {
      
  }
  
  const fetchAdminTeamManagers = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:8081/backend/admin/get/team-managers", {
        credentials: "include",
      });

      const data = await res.json();
      setAdminTeamManagers(data);
    } catch (error) {
      console.log(error.message);
      setLoading(false);
      return;
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchAdminTeamManagers();
  }, []);

  useEffect(() => {
    if (openDialogStatusAction === false)
      fetchAdminTeamManagers();
    if (openEditUser === false)
      fetchAdminTeamManagers();
    if (openAddTeamManager === false)
      fetchAdminTeamManagers();
    if (openDialogDelete === false)
      fetchAdminTeamManagers();
  },[openAddTeamManager, openDialogDelete, openEditUser, openDialogStatusAction])

  const MyTableHeaderUsers = () => {
    return (
      <thead className='border-b border-black'>
        <tr className='text-black text-left'>
          <th className='py-2'>Name</th>
          <th className='py-2 hidden lg:block'>Email</th>
          <th className='py-2 pr-4'>Title</th>
          <th className='py-2'>Status</th>
          <th className='py-2 px-2 hidden lg:block'>Created</th>
        </tr>
      </thead>
    )
  }

  const MyTableRowUsers = ({ user }) => {
    return (
      <tr className='border-b border-black text-black hover:bg-gray-200'>
        <td className='py-2'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-violet-500'>
              <span className='text-center'>{getInitials(user.first_name, user.last_name)}</span>
            </div>
            <div>
              <p className='font-serif'>{user.first_name + user.last_name}</p>
              <span className='font-thin'>{user.role}</span>
            </div>
          </div>
        </td>

        <td className='py-2 hidden lg:table-cell'>
          <p className='font-thin '>{user.email}</p>
        </td>
              
        <td className='py-2'>
          <p className='font-thin'>{user.title}</p>
        </td>
               
        <td className='py-2'>
          <button className={clsx('w-fit px-3 py-1 rounded-full font-serif', (user.is_active === "Yes") ?
            "bg-blue-200 hover:bg-blue-400" : "bg-yellow-200 hover:bg-yellow-400")}
            onClick={() => userActionHandlerOnClick(user)}>
            {(user.is_active === "Yes") ? "Active" : "Disabled"}
            {/*Aici sa verific cu dialoguseraction daca activez sau inactivez contul */}
          </button>
        </td>

        <td className='py-2 font-thin px-2 hidden lg:table-cell'>
          <span className=''>{moment(user.createdAt).fromNow()}</span>
        </td>

        <td className='p-2 '>
          <div className='flex justify-end gap-4'>
            <button className='font-medium text-blue-700 hover:text-blue-500'
              onClick={() => editUserHandlerOnClick(user)}>Edit</button>
            <button className='font-medium text-red-700 hover:text-red-500 hidden md:block'
              onClick={() => userDeleteHandlerOnClick(user)}>Delete</button>
          </div>
        </td>
      </tr>
    )
  }
  
  return (
    loading ? (<div><Loading /></div>) : (
      <>
        <div className='w-full bg-white rounded shadow-lg mb-8'>
          <div className='flex items-center justify-between px-2 py-2'>
            <PageTitle title="Team Managers" />
            <button className='px-3 py-2 rounded-lg
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium' onClick={() => setOpenAddTeamManager(true)}>
              <span>+ Add new Team Manager</span>
            </button>
          </div>
        </div>
        <div className='w-full bg-white h-fit px-2 md:px-6 py-4 shadow-lg rounded'>
          <table className='w-full mb-5'>
            <MyTableHeaderUsers />
            <tbody>
              {
                adminTeamManagers && adminTeamManagers.length > 0 ?
                  (
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
                  )
              }
            </tbody>
          </table>
        </div>

        <div>
            {error && <p className="text-red-500">{error}</p>}
        </div>

        <DialogStatusAction open={openDialogStatusAction} setOpen={setOpenDialogStatusAction} onClick={userActionHandler}
          userData={userData} />
        <DialogDeleteConfirmTeamManager open={openDialogDelete} setOpen={setOpenDialogDelete} userData={deleteUserData} />
        <AddTeamManager open={openAddTeamManager} setOpen={setOpenAddTeamManager} />
        <EditUser open={openEditUser} setOpen={setOpenEditUser} data={editUserData} />
      </>
    )
  )
}

export default TeamAdmin