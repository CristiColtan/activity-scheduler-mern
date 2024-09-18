import React, {useState, Fragment, useEffect} from 'react'
import { useSelector } from 'react-redux';
import clsx from "clsx"
import moment from 'moment';

import Loading from './Loading.jsx';
import PageTitle from './PageTitle.jsx';

import { MdKeyboardArrowUp } from "react-icons/md";
import { MdKeyboardDoubleArrowUp } from "react-icons/md";
import { MdKeyboardArrowDown } from "react-icons/md";
import { FaTasks } from "react-icons/fa";
import { GoDash } from "react-icons/go";
import { MdOutlineRestore } from "react-icons/md";
import { FaDeleteLeft } from "react-icons/fa6";

import {tasks} from "../assets/data.js"

import { priority_styles, task_type, bgs } from '../utils/tableImports.js';

const TrashAdmin = () => {
    const t_icons = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    normal: <GoDash />,
    low: <MdKeyboardArrowDown />,
    };
    
    const [loading, setLoading] = useState(false);

    const MyTableHeader = () => {
    return (
        <thead className='border-b border-black'>
          <tr className='text-black text-left'>
            <th className='py-2'>Task Title</th>
            <th className='py-2'>Priority</th>      
            <th className='py-2'>Stage</th>
            <th className='py-2 px-2 hidden lg:block'>Modified on</th>
          </tr>
        </thead>
      )    
    }

    const MyTableRow = ({ task }) => {
        return (
            <tr className='border-b border-black text-black hover:bg-gray-200'>
                <td className='py-2 pr-2'>
                    <div className='flex items-center gap-3'>
                        <div className={clsx("w-4 h-4 rounded-full", task_type[task.stage])}>
                        </div>
                        <p className='w-full line-clamp-2 font-serif text-black'>
                            {task.title}
                        </p>
                    </div>
                </td>

                <td className='py-2 pr-2'>
                    <div className='flex gap-1 items-center'>
                        <span className={clsx("text-lg", priority_styles[task.priority])}>
                            {t_icons[task.priority]}
                        </span>
                        <span className='font-thin'>{task.priority}</span>
                    </div>
                </td>

                <td className='py-2'>
                    {task.stage}
                </td>

                <td className='py-2 font-thin hidden lg:table-cell'>
                    {new Date(task.date).toDateString()}
                </td>

                <td className='p-2'>
                    <div className='flex justify-end gap-3'>
                        <button>
                            <MdOutlineRestore
                                className='text-2xl text-blue-700 hover:text-blue-500' />    
                        </button>
                        <button>
                            <FaDeleteLeft
                            className='text-xl text-red-700 hover:text-red-500' />
                        </button>
                    </div>
                </td>
            </tr>
        )
    }

    return (
        loading ? (<div><Loading /></div>) : (
            <>
                <div className='w-full bg-white h-fit px-2 md:px-6 py-4 shadow-lg rounded mb-8'>
                    <div className='flex items-center justify-between'>
                        <PageTitle title="Admin" />
                        <div className='inline-flex gap-4 md:gap-6 items-center'>
                            <button className='text-blue-700 hover:text-blue-500 inline-flex items-center gap-1'>
                                {<MdOutlineRestore className='text-xl ' />} Restore All
                            </button>
                            <button className='text-red-700 hover:text-red-500 inline-flex items-center gap-1'>
                                {<FaDeleteLeft className='text-xl ' />} Delete All
                            </button>
                        </div>
                    </div>
                </div>
                <div className='w-full bg-white h-fit px-2 md:px-6 py-4 shadow-lg rounded'>
                    <table className='w-full mb-5'>
                        <MyTableHeader />
                        <tbody>
                            {
                                tasks.map((task, index) => (
                                    <MyTableRow task={task} key={index} />
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </>
        )
    )
}

export default TrashAdmin