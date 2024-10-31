import React, { useState, Fragment, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx'
import moment from "moment"
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import PageTitle from '../components/PageTitle.jsx';
import Loading from "../components/Loading.jsx";
import TabsProfile from "../components/TabsProfile.jsx";
import { getInitials } from '../utils/FullnameInitials.js';

import { FaUsers } from "react-icons/fa";
import { FaTasks } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import { FaTeamspeak } from "react-icons/fa";
import AdminUsers from '../components/admin/AdminUsers.jsx';

const tabs = [{
  title: "Users",
  icon: <FaUsers className='text-lg' size={20} />
},{
  title: "Tasks",
  icon: <FaTasks className='text-lg' size={20} />
},{
  title: "Notifications",
  icon: <IoIosNotifications className='text-lg' size={20} />
},{
  title: "Team Managers",
  icon: <FaTeamspeak className='text-lg' size={20} />
}];

const Settings = () => {
  const { currentUser } = useSelector((state) => state.user);

  const [loadingSettings, setLoadingSettings] = useState(false);
  const [errorSettings, setErrorSettings] = useState(null);

  const [selected, setSelected] = useState(0);

  const [selectedUsers, setSelectedUsers] = useState(0);
  const [selectedTasks, setSelectedTasks] = useState(0);
  const [selectedNotifications, setSelectedNotifications] = useState(0);
  const [selectedTeamMs, setSelectedTeamMs] = useState(0);

  return (
    <>
      <div className='w-full flex flex-col gap-3 mb-4 overflow-y-hidden'>
        {loadingSettings ?
          (<div><Loading></Loading></div>) : (
            <>
              {errorSettings ?
                (<p className='text-red-500 text-4xl'>Something went wrong! {errorSettings}</p>) : (
                  <>
                    <div className='pl-1 w-full bg-white h-fit px-2 md:px-6 py-4 shadow-lg rounded mb-8'>
                      <PageTitle title="Admin Page" />
                      <p className='font-serif'>Manage everything</p>
                    </div>

                    <TabsProfile tabs={tabs} setSelected={setSelected}>
                      {selected === 0 && (
                        <>
                          <AdminUsers />
                        </>
                      )}
                      {selected === 1 && (
                        <>
                          2
                        </>
                      )}
                      {selected === 2 && (
                        <>
                          3
                        </>
                      )}
                      {selected === 3 && (
                        <>
                          4
                        </>
                      )}
                    </TabsProfile>
                  </>
                )
              }
            </>
          )
        }
      </div>
    </>
  )
}

export default Settings