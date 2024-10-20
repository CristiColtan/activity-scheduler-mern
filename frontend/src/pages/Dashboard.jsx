import React, { Fragment, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import moment from 'moment'
import clsx from 'clsx'
import { Popover, PopoverPanel, PopoverButton, Transition } from '@headlessui/react'
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip,
  XAxis, YAxis
} from "recharts"

import { FaClipboardCheck } from "react-icons/fa";
import { LuClipboardEdit } from "react-icons/lu";
import { MdOutlinePendingActions } from "react-icons/md";
import { MdKeyboardArrowUp } from "react-icons/md";
import { MdKeyboardDoubleArrowUp } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";
import { FaTasks } from "react-icons/fa";
import { GoDash } from "react-icons/go";

import { priority_styles, task_type, bgs } from '../utils/tableImports.js';
import { getInitials } from '../utils/FullnameInitials.js'

import Loading from '../components/Loading.jsx'

export default function Dashboard() {
  const { currentUser } = useSelector((state) => state.user);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [Summary, setSummary] = useState(null);

  console.log("summary:", Summary);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      let res;

      if (currentUser.is_admin === "Yes") {
        res = await fetch(`http://localhost:8081/backend/admin/get-dashboard-statistics`, {
          credentials: "include",
        });
      }
      else if (currentUser.is_team_manager === "Yes") {
        res = await fetch(`http://localhost:8081/backend/team-manager/get/dashboard-statistics`, {
          credentials: "include",
        });
      }
      else {
        res = await fetch(`http://localhost:8081/backend/normal-user/get-dashboard-statistics`, {
          credentials: "include",
        });
      }

      const data = await res.json();

      if (data.success === false) {
        console.log(data.message);
        setError(data.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      setError(null);
      setSummary(data);
    } catch (error) {
      console.log(error.message);
      setError(error.message);
      setLoading(null);
      return;
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, [])


  const totals = Summary?.tasks || {};
  const last_month = Summary?.tasksLastMonth || {};

  const stats = [
    {
      _id: "1",
      label: "TOTAL TASKS",
      total: Summary?.nrTotalTasks || 0,
      icon: <FaTasks />,
      bg: "bg-[#1d4ed8]",
      lastmonth: Summary?.nrTotalTasksLastMonth || 0,
    },
    {
      _id: "2",
      label: "COMPLETED TASKS",
      total: totals["completed"] || 0,
      icon: <FaClipboardCheck />,
      bg: "bg-[#0f766e]",
      lastmonth: last_month["completed"] || 0,
    },
    {
      _id: "3",
      label: "TASKS IN PROGRESS ",
      total: totals["in progress"] || 0,
      icon: <LuClipboardEdit />,
      bg: "bg-[#f59e0b]",
      lastmonth: last_month["in progress"] || 0,
    },
    {
      _id: "4",
      label: "TO-DO",
      total: totals["to do"],
      icon: <MdOutlinePendingActions />,
      bg: "bg-[#be185d]" || 0,
      lastmonth: last_month["to do"] || 0,
    },
  ];

  const MyTaskTable = ({ tasks }) => {
    const t_icons = {
      high: <MdKeyboardDoubleArrowUp />,
      medium: <MdKeyboardArrowUp />,
      normal: <GoDash />,
      low: <MdKeyboardArrowDown />,
    };

    const MyUserInfo = ({ user, index }) => {
      return (
        <>
          <div className='px-4'>
            <Popover className='relative'>
                <>
                  <PopoverButton className='group inline-flex items-center outline-none'> 
                    <span className='text-white font-medium'>
                      {getInitials(user?.first_name, user?.last_name)}
                    </span>
                  </PopoverButton>
                  <Transition
                    as={Fragment}
                    enter='transition ease-out duration-100'
                    enterFrom='transform opacity-0 scale-95'
                    enterTo='transform opacity-100 scale-100'
                    leave='transition ease-in duration-75'
                    leaveFrom='transform opacity-100 scale-100'
                    leaveTo='transform opacity-0 scale-95'
                  >
                    <PopoverPanel className='absolute left-1/2 z-10 mt-3 w-120 max-w-sm -translate-x-2/3 transform px-4 sm:px-0'>
                      <div className='flex items-center gap-4 rounded-lg shadow-lg bg-white ring-1 ring-gray-900/5'>
                        <div className={clsx('w-14 h-14 text-white rounded-full flex items-center justify-center text-2xl mx-1',
                          bgs[index % bgs.length]
                        )}>
                          <span className='text-white font-medium'>{getInitials(user?.first_name, user?.last_name)}</span>
                        </div>

                        <div className='flex flex-col gap-y-1 mx-1'>
                        <p className='text-black font-serif text-base'>{user?.first_name + " " + user?.last_name}</p>
                        <span className='text-gray-700 font-serif'>{user?.title}</span>
                        <span className='text-gray-700 font-serif'>{user?.email}</span>
                        </div>
                      </div>
                    </PopoverPanel>
                  </Transition>
                </>
            </Popover>
          </div>
        </>
      )
    } 

    const MyTableHeader = () => {
      return (
        <thead className='border-b border-black'>
          <tr className='text-black text-left'>
            <th className='py-2'>Task Title</th>
            <th className='py-2'>Priority</th>
            <th className='py-2'>Team</th>
            <th className='py-2 hidden md:block'>Created</th>
          </tr>
        </thead>
      )
    }

    const MyTableRow = ({task}) => {
      return (
        <>
          <tr className='border-b border-black text-black hover:bg-gray-200'>
            <td className='py-2'>
              <div className='flex items-center gap-2'>
                <div className={clsx("w-4 h-4 rounded-full", task_type[task?.stage])} />
                <p className='font-serif'>{task?.title}</p>
              </div>
            </td>

            <td className='py-2'>
              <div className='flex items-center gap-1'>
                <span className={clsx("text-xl",priority_styles[task?.priority])}>
                  {t_icons[task?.priority]}
                </span>
                <span className='font-thin'>{task?.priority}</span>
              </div>
            </td>

            <td className='py-2'>
              <div className='flex'>
                {task.team.map((m, index) => (
                  <div key={index} className={clsx("w-7 h-7 rounded-full text-white items-center justify-center text-sm flex -mr-1",
                    bgs[index % bgs.length]
                  )}>
                    <MyUserInfo user={m} index={index} />
                  </div>  
                ))}
              </div>  
            </td>

            <td className='py-2 hidden md:block'>
              <span className='font-thin'>{moment(task?.createdAt).fromNow()}</span>
            </td>
          </tr>
        </>
      )
    }

    return (
      <>
        <div className='w-full md:w-2/3 bg-white px-2 md:px-4 pt-4 pb-4 shadow-lg rounded'>
          <table className='w-full mb-5'>
            <MyTableHeader />
            <tbody className=''>
              {
                (tasks && tasks.length > 0) ? (
                  tasks.map((task, id) => (
                    <MyTableRow key={id} task={task} />
                  ))) :
                  (<>
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-lg">
                          No tasks available.
                        </td>
                      </tr>
                    </>)
              }
            </tbody>
          </table>
        </div>
      </>
    )
  }

  const MyUserTable = ({ users }) => {
    const MyTableHeaderUsers = () => {
      return (
        <thead className='border-b border-black'>
          <tr className='text-black text-left'>
            <th className='py-2'>Name</th>
            <th className='py-2'>Status</th>
            <th className='py-2 px-2'>Created</th>
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
                <span className='text-center'>{getInitials(user?.first_name, user?.last_name)}</span>
              </div>
              <div>
                <p className='font-serif'>{user?.first_name + " " + user?.last_name}</p>
                <span className='font-thin'>{user?.role}</span>
              </div>
            </div>
          </td>

          <td className='py-2'>
            <p className={clsx('w-fit px-3 py-1 rounded-full font-serif', user?.is_active === "Yes" ? "bg-blue-200" : "bg-yellow-200")}>
              {user?.is_active === "Yes" ? "Active" : "Disabled"}
            </p>
          </td>

          <td className='py-2 font-thin px-2'>
            {moment(user?.createdAt).fromNow()}
          </td>
        </tr>
      )
    }

    return (
      <>
        <div className='w-full md:w-1/3 bg-white h-fit px-2 md:px-6 py-4 shadow-lg rounded'>
          <table className='w-full mb-5'>
            <MyTableHeaderUsers />
            <tbody>
              {
                (users && users.length > 0) ? (
                  users.map((user, index) => (
                    <MyTableRowUsers key={index + user._id} user={user} />
                  ))) : (<>
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-lg">
                        {(currentUser.is_team_manager === "No" && currentUser.is_admin === "No") ?
                          "You have no special rights to see other users!" : "No users available."}
                      </td>
                    </tr>
                  </>)
              }
            </tbody>
          </table>
        </div>
      </>
    )
  }

  const MyChart = () => {
    return (
      <ResponsiveContainer width={"100%"} height={300}>
        <BarChart width={150} height={40} data={Summary.graphData}>
          <XAxis dataKey="name"></XAxis>
          <YAxis dataKey="total"></YAxis>
          <Tooltip></Tooltip>
          <Legend></Legend>
          <CartesianGrid strokeDasharray={"3 3"}></CartesianGrid>
          <Bar dataKey="total" fill="#1d4ed8"></Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const MyDashCard = ({ icon, bg, label, count, lastmonth  }) => {
    return (
      <div className='w-full h-32 bg-white shadow-md p-5 rounded-md flex items-center justify-between'>
        <div className='h-full flex flex-1 flex-col justify-between'>
          <p className='font-serif text-black'>{label}</p>
          <span className='text-2xl font-semibold'>{count}</span>
          <span className='font-thin'>{lastmonth} last month</span>
        </div>
        <div className={clsx("text-xl w-10 flex h-10 rounded-full items-center justify-center text-white", bg)}>
          {icon}
        </div>
      </div>
    )
  }

  return (
    loading ? (<div><Loading /></div>) : (
      Summary ? (
        <div className='h-full py-4'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-5'>
            {
              stats.map(({ icon, bg, label, total, lastmonth }, index) => (
                <MyDashCard key={index} icon={icon} bg={bg} label={label} count={total} lastmonth={lastmonth} />
              ))
            }
          </div>

          <div className='w-full bg-white p-4 my-16 rounded shadow-md'>
            <h4 className='font-serif font-medium text-xl'>Chart by Priority</h4>
            <MyChart />
          </div>

          <div className='w-full flex flex-col md:flex-row gap-4 2xl:gap-10 py-4'>
            <MyTaskTable tasks={Summary.allTasks} />
            <MyUserTable users={Summary.allUsers} />
          </div>

          {error && <p className='text-red-500 text-4xl'>{error}</p>}
        </div>
      ) : (<p className='font-sans mt-10 text-2xl flex justify-center'>No data available</p>)
    )
  )
}
