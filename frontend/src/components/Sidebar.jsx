import React from 'react'
import clsx from "clsx"
import { useSelector, useDispatch } from 'react-redux';
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { MdDashboard } from "react-icons/md";
import { BsListTask } from "react-icons/bs";
import { MdOutlineTaskAlt } from "react-icons/md";
import { MdOutlinePendingActions } from "react-icons/md";
import { IoIosSettings } from "react-icons/io";
import { MdOutlineGroupAdd } from "react-icons/md";
import { FaTrashAlt } from "react-icons/fa";
import { FaBarsProgress } from "react-icons/fa6";

import { setOpenSidebar } from '../redux/user/userSlice.js';

const linkData = [
    {
        label: "Dashboard",
        link: "dashboard",
        icon: <MdDashboard className='text-xl'/>
    },
    {
        label: "Tasks",
        link: "tasks",
        icon: <BsListTask className='text-xl'/>
    },
    {
        label: "Completed",
        link: "completed",
        icon: <MdOutlineTaskAlt className='text-xl'/>
    },
    {
        label: "In Progress",
        link: "in-progress",
        icon: <FaBarsProgress className='text-xl'/>
    },
    {
        label: "To Do",
        link: "to-do",
        icon: <MdOutlinePendingActions className='text-xl'/>
    },
    {
        label: "Team",
        link: "team",
        icon: <MdOutlineGroupAdd className='text-xl'/>
    },
    {
        label: "Trash",
        link: "trash",
        icon: <FaTrashAlt className='text-xl'/>
    },
]

const Sidebar = () => {
    const { currentUser } = useSelector((state) => state.user);

    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const path = location.pathname.split("/")[1];
    const sidebarLinks = (currentUser.is_admin === "Yes" || currentUser.is_team_manager === "Yes") ? linkData : linkData.slice(0, 5);

    const closeSidebar = () => {
        dispatch(setOpenSidebar(false));
    };

    const NavLink = ({ el }) => {
        return (
            <Link to={el.link} onClick={closeSidebar}
                className={
                    clsx("w-full lg:w-3/4 flex gap-2 px-3 py-2 rounded-full items-center text-black text-base hover:bg-[#2564ed2d]",
                        path === el.link.split("/")[0] ? "bg-blue-700 text-white hover:bg-blue-700" : "")
                }>
                {el.icon}
                <span className='font-medium'>{el.label}</span>
            </Link>
        )
    }

    return (
        <div className='w-full h-full flex flex-col gap-6 px-5 py-1'>
            <p className='flex flex-col gap-0 md:gap-4 lg:text-4xl text-3xl
                        transition-transform duration-500 transform lg:px-8
                        py-2 hover:scale-125 font-bold text-gray-800 font-serif
                        shadow-outer text-shadoww pr-16 px-4'>
                <span>CCTask</span>
            </p>
            <div className='flex-1 flex flex-col gap-y-5 py-8'>
                {
                    sidebarLinks.map((link) => (
                        <NavLink el={link} key={link.label}></NavLink>
                    ))
                }
            </div>
            <div className=''>
                <button className={clsx('w-full flex gap-2 p-2 items-center text-lg text-black')}
                    onClick={() => { navigate("/settings") }}>
                    <IoIosSettings className='text-xl' />
                    <span className='font-medium'>Settings</span>
                </button>
            </div>
        </div>
    )
}

export default Sidebar