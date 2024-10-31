import React, {useState, useEffect} from 'react'
import clsx from "clsx"
import moment from 'moment';

import Loading from '../Loading.jsx';
import AdminPagetitle from './AdminPageTitle.jsx';

import { getInitials } from '../../utils/FullnameInitials.js';
import AdminDialogStatusAction from './AdminDialogStatusAction.jsx';
import AdminDialogEditUser from './AdminDialogEditUser.jsx';


const AdminUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [openDialogStatusAction, setOpenDialogStatusAction] = useState(false);
  const [openDialogEditUser, setOpenDialogEditUser] = useState(false);

  const [userDataStatusAction, setUserDataStatusAction] = useState(null);
  const [userDataEdit, setUserDataEdit] = useState(null);

  const userStatusActionHandlerOnClick = (s_a_data) => {
    setUserDataStatusAction(s_a_data);
    setOpenDialogStatusAction(true);
  }

  const userEditHandlerOnClick = (e_data) => {
    setUserDataEdit(e_data);
    setOpenDialogEditUser(true);
  }

  console.log("AdminUsers-AllUsers:", allUsers);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:8081/backend/admin/get/all-users", {
        credentials: "include",
      });

      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        setError(data.message);
        setLoading(false);
        return;
      }

      setAllUsers(data);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.log(error.message);
      setError(error.message)
      setLoading(false);
      return;
    }
  }

  useEffect(() => {
    fetchAllUsers();
  }, []);

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
            onClick={() => userStatusActionHandlerOnClick(user)}>
            {(user.is_active === "Yes") ? "Active" : "Disabled"}
          </button>
        </td>

        <td className='py-2 font-thin px-2 hidden lg:table-cell'>
          <span className=''>{moment(user.createdAt).fromNow()}</span>
        </td>

        <td className='p-2 '>
          <div className='flex justify-end gap-4'>
            <button className='font-medium text-blue-700 hover:text-blue-500'
              onClick={() => userEditHandlerOnClick(user)}>Edit</button>
            
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
            <AdminPagetitle title="All Users" />
          </div>
        </div>

        <div className='w-full bg-white h-fit px-2 md:px-6 py-4 shadow-lg rounded'>
          <table className='w-full mb-5'>
            <MyTableHeaderUsers />
            <tbody>
              {
                allUsers && allUsers.length > 0 ?
                  (
                    allUsers.map((user, index) => (
                      <MyTableRowUsers key={index + user._id} user={user} />
                    ))
                  ) : (
                    <>
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          No users found.
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

        <AdminDialogStatusAction open={openDialogStatusAction}
          setOpen={setOpenDialogStatusAction}
          userData={userDataStatusAction}
          allUsers={allUsers}
          setAllUsers={setAllUsers}
        />
        <AdminDialogEditUser open={openDialogEditUser}
          setOpen={setOpenDialogEditUser}
          userData={userDataEdit}
          allUsers={allUsers}
          setAllUsers={setAllUsers}
        />
      </>
    )
  )
}

export default AdminUsers