import React from 'react'
import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';
import MobileSidebar from './MobileSidebar.jsx';

export default function PrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);

  return currentUser ?
    (
      <div className='w-full h-screen flex flex-col md:flex-row'>
        <div className='w-1/5 h-screen bg-white sticky top-0 hidden md:block'>
          <Sidebar></Sidebar>
        </div>
        <MobileSidebar></MobileSidebar>
        <div className='flex-1 overflow-y-auto'>
          <Navbar></Navbar>
          <div className='p-4 2xl:px-10'>
            <Outlet />
          </div>
        </div>
      </div>
    )
    : (<Navigate to="/guest" />);
}
