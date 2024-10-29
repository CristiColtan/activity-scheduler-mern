import React from 'react'
import { useState, Fragment } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { FaUser } from "react-icons/fa";
import { MdLogout } from "react-icons/md";

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'

import { getInitials } from '../utils/FullnameInitials.js';
import { signOutUserFailure, signOutUserStart, signOutUserSuccess } from '../redux/user/userSlice.js';

const UserAvatar = () => {
    const [open, setOpen] = useState(false);

    const { currentUser } = useSelector((state) => state.user);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            dispatch(signOutUserStart());
            const res = await fetch("http://localhost:8081/backend/auth/signout");

            const data = await res.json();
            if (data.success === false) {
                dispatch(signOutUserFailure(data.message));
                return;
            }

            dispatch(signOutUserSuccess(data));
        }
        catch (error) {
            dispatch(signOutUserFailure(error.message));
        }
    }

    return (
        <div>
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <MenuButton className="w-10 h-10 2xl:w-12 2xl:h-12 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500">
                        <span className='text-white font-medium'>
                            {getInitials(currentUser.last_name, currentUser.first_name)}
                        </span>
                    </MenuButton>
                </div>
                <Transition
                    as={Fragment}
                    enter='transition ease-out duration-100'
                    enterFrom='transform opacity-0 scale-95'
                    enterTo='transform opacity-100 scale-100'
                    leave='transition ease-in duration-75'
                    leaveFrom='transform opacity-100 scale-100'
                    leaveTo='transform opacity-0 scale-95'
                >
                    <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right divide-gray-100
                        rounded-md bg-white shadow-2xl ring-1 ring-gray-900/5 focus:outline-none">
                        <div className='p-4'>
                            <MenuItem className="hover:bg-gray-100">
                                {({ active }) => (
                                    <button onClick={() => {
                                        setOpen(true);
                                        navigate('/profile');
                                    }
                                    } className='text-black group flex w-full
                                    items-center rounded-md px-2 py-2 font-sans font-normal'>
                                        <FaUser className='mr-2' aria-hidden='true'></FaUser>
                                        Profile
                                    </button>
                                )}
                            </MenuItem>
                            <MenuItem className="hover:bg-gray-100">
                                {({ active }) => (
                                    <button onClick={handleSignOut} className='text-red-700 group flex w-full
                                    items-center rounded-md px-2 py-2 font-sans font-normal'>
                                        <MdLogout className='mr-2' aria-hidden='true'></MdLogout>
                                        Sign Out
                                    </button>
                                )}
                            </MenuItem>
                        </div>
                    </MenuItems>

                </Transition>
            </Menu>
        </div>
    )
}

export default UserAvatar