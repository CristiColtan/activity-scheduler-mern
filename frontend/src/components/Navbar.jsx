import React, { useState } from 'react'
import clsx from "clsx"

import { IoIosMenu } from "react-icons/io";
import { useDispatch } from 'react-redux';

import { FaSearch } from "react-icons/fa";

import { setOpenSidebar } from '../redux/user/userSlice.js';

import UserAvatar from './UserAvatar.jsx';
import Notifications from './Notifications.jsx';

const Navbar = () => {
    const dispatch = useDispatch()

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className='flex justify-between items-center bg-white px-4 py-3 2xl:py-4 sticky z-10 top-0'>
            <div className='flex items-center justify-between gap-4'>
                <button>
                    <IoIosMenu className='text-2xl font-medium text-black block md:hidden
                    hover:text-gray-400'
                        onClick={() => dispatch(setOpenSidebar(true))} />
                </button>
                <div className='w-64 2xl:w-[400px] flex items-center py-2 px-3 gap-2 rounded-full bg-[#f2f2f2]'>
                    <FaSearch className={clsx('text-black search-icon', isHovered ? "text-gray-400" : "text-black")}></FaSearch>
                    <input type="text" placeholder='Search...'
                        className='bg-[#f2f2f2] flex-1 outline-none placeholder:text-gray-500 text-black'
                        onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                    </input>
                </div>
            </div>
            <div className='flex gap-2 items-center'>
                <Notifications></Notifications>
                <br></br>
                <UserAvatar></UserAvatar>
            </div>
        </div>
    )
}

export default Navbar