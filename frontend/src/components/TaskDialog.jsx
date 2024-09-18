import React, { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';

import { FaRegFolderOpen } from "react-icons/fa6";
import { MdOutlineEdit } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import { FaCopy } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";

import TaskAddSubTask from './TaskAddSubTask';

const TaskDialog = ({ task }) => {
  const [openSubTask, setOpenSubTask] = useState(false);

  const navigate = useNavigate();

  const duplicateHandlerOnClick = () => { };
  const deleteHandlerOnClick = () => { };

  const items = [
    {
      label: "Open Task", 
      icon: <FaRegFolderOpen className='h-5 w-5 mr-2' aria-hidden='true' />,
      onClick: () => navigate('/task/1234'),
    },
    {
      label: "Edit Task",
      icon: <MdOutlineEdit className='h-5 w-5 mr-2' aria-hidden='true' />,
      onClick: () => navigate('/edit-task/1234'),
    },
    {
      label: "Add Sub-Task",
      icon: <IoMdAdd className='h-5 w-5 mr-2' aria-hidden='true' />,
      onClick: () => setOpenSubTask(true),
    },
    {
      label: <p className='text-blue-600'>Duplicate</p>,
      icon: <FaCopy className='h-5 w-5 mr-2 text-blue-600' aria-hidden='true' />,
      onClick: () => duplicateHandlerOnClick(),
    },
    {
      label: <p className='text-red-600'>Delete</p>,
      icon: <MdDelete className='h-5 w-5 mr-2 text-red-600' aria-hidden='true' />,
      onClick: () => deleteHandlerOnClick(),
    },
  ];

  return (
    <>
      <div>
        <Menu as='div' className='relative inlin-block text-left'>
          <MenuButton className='inline-flex w-full justify-center rounded px-4 py-1 font-serif'>
            <BsThreeDots/>
          </MenuButton>

          <Transition as={Fragment}
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <MenuItems className='absolute p-4 right-0 mt-2 w-52 origin-top-right divide-y divide-gray
            rounded bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10'>
              {
                items.map((el) => (
                  <MenuItem key={el.label}>
                    {({ active }) => (
                      <button onClick={el.onClick} className={clsx('flex w-full items-center rounded px-2 py-1.5 text-base hover:bg-gray-200')}>
                        {el.icon}
                        <p className='font-sans mt-0.5'>{el.label}</p>
                      </button>
                    )}
                  </MenuItem>
                ))
              }
              
            </MenuItems>
          </Transition>
        </Menu>
      </div>
      
      <TaskAddSubTask open={openSubTask}  setOpen={setOpenSubTask}/>
    </>
  )
}

export default TaskDialog