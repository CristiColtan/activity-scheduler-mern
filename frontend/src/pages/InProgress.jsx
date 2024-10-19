import React, {useEffect, useState} from 'react'
import { useNavigate, useParams} from 'react-router-dom';
import { useSelector } from 'react-redux';

import { MdGridView } from "react-icons/md";

import Loading from '../components/Loading.jsx';
import TaskTitle from '../components/TaskTitle.jsx';
import BoardView from '../components/BoardView.jsx';

import { task_type } from '../utils/tableImports.js';

const InProgress = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [Tasks, setTasks] = useState([]);
  
    const navigate = useNavigate();

    const tabs = [{ title: "Board View", icon: <MdGridView /> }]

    const { currentUser } = useSelector((state) => state.user);

    console.log("Tasks: ", Tasks);

    const fetchInProgressTasks = async () => {
        try {
            setLoading(true);

            const res = await fetch("http://localhost:8081/backend/task/get-all-in-progress-tasks", {
                credentials: "include",
            });

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
        fetchInProgressTasks();
    }, [])
    
    return (
        loading ? (<div><Loading /></div>) : (
            <div className='w-full'>
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
                    </div>
                </div>

                <div className='w-full py-0 mb-2'>
                    <div className=' rounded gap-4 flex justify-between'>
                        <TaskTitle label="In Progress" classes={task_type["in progress"]} />
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

export default InProgress