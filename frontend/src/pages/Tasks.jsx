import React, {useEffect, useState} from 'react'
import { useNavigate, useParams} from 'react-router-dom';
import { Checkbox } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/16/solid'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { useSelector } from 'react-redux';

import { FaList } from "react-icons/fa";
import { MdGridView } from "react-icons/md";
import { MdAdd } from "react-icons/md";

import Loading from '../components/Loading.jsx';

import { priority_styles, task_type, bgs } from '../utils/tableImports.js';
import { tasks } from '../assets/data.js';
import TaskTitle from '../components/TaskTitle.jsx';
import BoardView from '../components/BoardView.jsx';

const Tasks = () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [enabled, setEnabled] = useState(true);
    const [error, setError] = useState(null);

    const [Tasks, setTasks] = useState([]);

    const params = useParams();
    const navigate = useNavigate();

    const tabs = [{ title: "Board View", icon: <MdGridView /> }]

    const handleCreateTaskClick = () => {
        navigate("/create-task");
    };

    const { currentUser } = useSelector((state) => state.user);

    console.log(Tasks);

    const fetchTasks = async () => {
        try {
            setLoading(true);

            const res = await fetch("http://localhost:8081/backend/task/get-all-tasks", {
                credentials: "include"
            })

            const data = await res.json();

            if (data.success === false) {
                console.log(data.message);
                setError(data.message);
                setLoading(false);
                return;
            }

            setTasks(data);
      
            setLoading(false);
            setError(null);
        } catch (error) {
            console.log(error.message);
            setError(error.message);
            setLoading(false);
            return;
        }
    }

    useEffect(() => {
        fetchTasks();
    },[])

    return (
        loading ? (<div><Loading /></div>) : (
            <div className='w-full'>
                <div className='grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr] gap-5 bg-white p-2 shadow-lg rounded'>
                    <div className=''>
                        <h2 className='text-lg font-serif mb-1 ml-4'>Priority</h2>
                        <div className='flex flex-wrap gap-4 font-serif'>
                            <div className='flex items-center gap-1 ml-1'>
                                <input className='size-4' type="checkbox"></input>
                                <span>any</span>
                            </div>
                            <div className='flex items-center gap-1'>
                                <input className='size-4' type="checkbox"></input>
                                <span>high</span>
                            </div>
                            <div className='flex items-center gap-1'>
                                <input className='size-4' type="checkbox"></input>
                                <span>medium</span>
                            </div>
                            <div className='flex items-center gap-1'>
                                <input className='size-4' type="checkbox"></input>
                                <span>normal</span>
                            </div>
                            <div className='flex items-center gap-1'>
                                <input className='size-4' type="checkbox"></input>
                                <span>low</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className='text-lg font-serif mb-1 ml-4'>Status</h2>
                        <div className='flex flex-wrap gap-4 font-serif'>
                            <div className='flex items-center gap-1 ml-1'>
                                <input className='size-4' type="checkbox"></input>
                                <span className=''>any</span>
                            </div>
                            <div className='flex items-center gap-1'>
                                <input className='size-4' type="checkbox"></input>
                                <span>completed</span>
                            </div>
                            <div className='flex items-center gap-1'>
                                <input className='size-4' type="checkbox"></input>
                                <span>to-do</span>
                            </div>
                            <div className='flex items-center gap-1'>
                                <input className='size-4' type="checkbox"></input>
                                <span>in progress</span>
                            </div>
                        </div>
                    </div>
                    <div className='flex items-center justify-center gap-3 flex-wrap'>
                        <button className='px-3 py-2 rounded-lg
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium'>
                            Search
                        </button>
                    </div>
                </div>

                <div className='w-full py-6'>
                    <div className='flex space-x-6 p-1 px-5 justify-between bg-white rounded shadow-lg'>
                        {
                            tabs.map((tab, index) => (
                                <div key={tab.title + index} className='w-fit flex items-center outline-none gap-2 px-2 py-2.5 text-base font-medium
                              leading-5 bg-gray-100 text-blue-700 border-b-2 border-l-2 border-l-black/20 border-blue-600 rounded
                              shadow-lg -ml-1 border-t-2 border-t-black/20 border-r-2 border-r-black/20 hover:text-blue-400
                              hover:border-b-blue-400'>
                                    {tab.icon}
                                    <span>{tab.title}</span>
                                </div>
                            ))
                        }
                        {
                            (currentUser.is_admin === "Yes" || currentUser.is_team_manager === "Yes") &&
                            <button className='px-3 py-2 rounded-lg
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium' onClick={handleCreateTaskClick}>
                                <span>+ Create Task</span>
                            </button>
                        }
                    </div>

                </div>

                <div className='w-full py-0 mb-2'>
                    <div className=' rounded gap-4 flex justify-between'>
                        <TaskTitle label="To Do" classes={task_type["to do"]} />
                        <TaskTitle label="In Progress" classes={task_type['in progress']} />
                        <TaskTitle label="Completed" classes={task_type.completed} />
                    </div>
                </div>

                {
                    (Tasks && Tasks.length > 0) ?
                        <BoardView tasks={Tasks} setTasks={setTasks} />
                    :
                        <p className='font-sans mt-10 text-2xl flex justify-center'>No tasks available</p>
                }
            </div>
        )
    )
}

export default Tasks