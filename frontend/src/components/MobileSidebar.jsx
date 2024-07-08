import React, { useRef } from 'react'
import clsx from "clsx"
import { useState, Fragment } from 'react'
import { useDispatch, useSelector } from 'react-redux';

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'

import { IoMdClose } from "react-icons/io";

import { setOpenSidebar } from '../redux/user/userSlice';
import Sidebar from './Sidebar';

const MobileSidebar = () => {
    const { sidebarOpen } = useSelector((state) => state.user);
    const mobileMenuRef = useRef(null);
    const dispatch = useDispatch();

    const closeSidebar = () => {
        dispatch(setOpenSidebar(false));
    }

    return(
        <>
          <Transition
            show={sidebarOpen}
            as={Fragment}
            enter='transition ease-out duration-100'
                    enterFrom='transform opacity-0 scale-95'
                    enterTo='transform opacity-100 scale-100'
                    leave='transition ease-in duration-75'
                    leaveFrom='transform opacity-100 scale-100'
                    leaveTo='transform opacity-0 scale-95'
          >
                {(ref) => (
                    <div ref={(node) => (mobileMenuRef.current = node)}
                        className={clsx('md:hidden w-full h-full bg-[#f2f2f2] transition-all duration-700 transform',
                            sidebarOpen ? "translate-x-0" : "translate-x-full"
                        )} onClick={() => closeSidebar()}
                    >
                        <div className='bg-white sm:w-2/4 w-3/4 h-full py-5'>
                            <div className='w-full flex justify-end px-5'>
                                <button onClick={() => closeSidebar()} className='
                                hover:text-gray-300 z-[51]'>
                                    <IoMdClose size={25} />
                                </button>
                            </div>
                            <div className='-mt-11'>
                                <Sidebar></Sidebar>
                            </div>
                        </div>    
                    </div>
            )}
              
          </Transition>
        </>
    )
}

export default MobileSidebar