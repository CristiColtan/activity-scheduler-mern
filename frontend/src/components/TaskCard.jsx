import React, { useState, Fragment } from 'react'
import { useSelector } from 'react-redux';
import clsx from 'clsx'

import { priority_styles, task_type, bgs } from '../utils/tableImports.js';
import { formatDate } from '../utils/formateDate.js'
import { Popover, PopoverPanel, PopoverButton, Transition } from '@headlessui/react'
import { getInitials2 } from '../utils/FullnameInitials.js';

import { MdKeyboardArrowUp } from "react-icons/md";
import { MdKeyboardDoubleArrowUp } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";
import { FaTasks } from "react-icons/fa";
import { GoDash } from "react-icons/go";
import { LiaCommentSolid } from "react-icons/lia";
import { IoMdAdd, IoMdAttach } from "react-icons/io";
import { IoListOutline } from "react-icons/io5";
import { BsListTask } from "react-icons/bs";

import TaskDialog from './TaskDialog.jsx';
import TaskAddSubTask from './TaskAddSubTask.jsx';

//don t forget to change getinitials2 with getinitials
const TaskCard = ({ task }) => {
    const MyUserInfo = ({ user, index }) => {
      return (
        <>
          <div className='px-4'>
            <Popover className='relative'>
                <>
                  <PopoverButton className='group inline-flex items-center outline-none'> 
                    <span className='text-white font-medium'>
                      {getInitials2(user.name)}
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
                          <span className='text-white font-medium'>{getInitials2(user.name)}</span>
                        </div>

                        <div className='flex flex-col gap-y-1 mx-1'>
                        <p className='text-black font-serif text-base'>{user.name}</p>
                        <span className='text-gray-700 font-serif'>{user.title}</span>
                        <span className='text-gray-700 font-serif'>{user.email}</span>
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

    const t_icons = {
      high: <MdKeyboardDoubleArrowUp />,
      medium: <MdKeyboardArrowUp />,
      normal: <GoDash />,
      low: <MdKeyboardArrowDown />,
    };

    const { currentUser, loading, error } = useSelector((state) => state.user);
    const [open, setOpen] = useState(false);

  return (
    <>
        <div className='w-full h-fit bg-white shadow-lg rounded p-4'>
            <div className='w-full flex justify-between'>
                <div className={clsx("flex flex-1 gap-1.5 items-center font-medium -ml-0.5",
                    priority_styles[task.priority]
                )}>
                    <span className='text-xl'>{t_icons[task.priority]}</span>
                    <span className='text-black font-thin'>{task.priority} priority</span>
                </div> {/* sa nu uiti de is admin */ }
                {(currentUser.is_admin || currentUser.is_tmanager) && <TaskDialog task={task}></TaskDialog>}
                {/*sa nu uiti de confirmation dialog si useraction dialog! */}   
            </div>

            <>
                <div className='flex items-center gap-2'>
                    <div className={clsx("w-4 h-4 rounded-full", task_type[task.stage])}
                    />
                    <h4 className='text-black line-clamp-1 font-serif'>{task.title}</h4>  
                </div>
                <span className='font-thin text-black'>
                    {formatDate(new Date(task.date))}
                </span>  
            </>

            <div className='w-full border-t border-gray-400 my-2'>
                <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center gap-3 mt-1'>
                        <div className='flex gap-1 items-center font-thin text-black'>
                            <LiaCommentSolid className='text-lg' />
                            <span className='font-thin'>{task.activities.length}</span>  
                        </div>
                        <div className='flex gap-1 items-center font-thin text-black'>
                            <IoMdAttach className='text-lg' />
                            <span className='font-thin'>{task.assets.length}</span>  
                        </div>
                        <div className='flex gap-1 items-center font-thin text-black'>
                            <FaTasks className='text-lg' />
                            <span className='font-thin'>{task.subTasks.length}</span>  
                        </div>  
                    </div>
                    <div className='flex flex-row-reverse mt-1'>
                        {task.team.map((m, index)=>(
                            <div key={index} className={clsx("w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                                bgs[index % bgs.length])}>
                                <MyUserInfo user={m} index={index} />
                            </div>
                        ))}
                    </div>
                </div>  
                {task.subTasks.length > 0 ? (
                    <div className='py-4 border-t border-gray-400 -mt-1'>
                        <h5 className='font-serif line-clamp-1 text-black'>
                            {task.subTasks[0].title}      
                        </h5>
                        <div className='px-4 py-1 space-x-8'>  
                            <span className='text-black font-thin'>
                                {formatDate(new Date(task.subTasks[0].date))}
                            </span>
                            <span className='bg-blue-600/10 px-2 py-1 rounded-lg text-blue-700 font-thin hover:text-blue-400'>
                                {task.subTasks[0].tag}      
                            </span>
                        </div>
                    </div>  
                ) : (
                    <div className='py-4 border-t border-gray-200'>
                        <span className='text-black'>No Subtasks!</span>
                    </div>          
                  )}
                  <div className='w-full pb-2'>
                      <button onClick={() => setOpen(true)} disabled={(currentUser.is_admin || currentUser.is_tmanager) ? false : true}
                          className='w-full flex gap-4 items-center text-sm text-black font-normal disabled:cursor-not-allowed
                          disabled:text-gray-400 hover:bg-gray-200 rounded py-0.5'>
                          <IoMdAdd className='text-lg mt-0.5'/>
                          <span>ADD SUB-TASK</span>
                      </button>
                </div>
            </div>  
        </div>
      {/*add sub task function*/}
      <TaskAddSubTask open={open} setOpen={setOpen} id={task._id} />
    </>
  )
}

export default TaskCard