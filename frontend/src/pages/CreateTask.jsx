import React, { useState } from 'react'

import PageTitle from '../components/PageTitle'
import TaskAddUserList from '../components/TaskAddUserList'
import TaskSelectList from '../components/TaskSelectList'

import { task_list_stage } from "../utils/tableImports.js"
import { task_list_priority } from "../utils/tableImports.js"

import { IoMdImages } from "react-icons/io";

const CreateTask = () => {
    const [team, setTeam] = useState([]);
    const [stage, setStage] = useState(task_list_stage[0] || []);
    const [priority, setPriority] = useState(task_list_priority[1] || []);

    const [uploading, setUploading] = useState(false);

    return (
        <div className='w-full bg-white h-fit px-2 md:px-6 py-2 shadow-lg rounded mb-8'>
            <PageTitle title="Add Task" />
            <br></br>
            <div className="w-full flex flex-col md:flex-row gap-12 2xl:gap-8 overflow-y-auto px-2 py-2">
                <div className='w-full md:w-1/2 flex flex-col justify-center md:justify-start'>
                    <input type="text" placeholder='Task Title' required id="title"
                        className='border py-1 px-2 placeholder-black focus:ring-2 ring-blue-300 outline-none
                    border-black focus:placeholder-gray-500 rounded min-w-[300px] md:min-w-[250px] mb-5'>
                    </input>
                    <label htmlFor='username' className='font-thin text-base mb-2'>Assign Task to:</label>
                    <TaskAddUserList setTeam={setTeam} team={team} />
                    <div className='flex gap-4 mt-5'>
                        <div className='w-full'>{/*left*/}
                            <label className='font-thin text-base mb-2'>Task Stage:</label>
                            <TaskSelectList lists={task_list_stage} selected={stage} setSelected={setStage}/>
                        </div>
                        <div className='w-full'>{/*right*/}
                            <label className='font-thin text-base mb-2'>Priority:</label>
                            <TaskSelectList lists={task_list_priority} selected={priority} setSelected={setPriority}/>
                        </div>
                    </div>
                    <div className='flex gap-4 mt-5'>
                        <div className='w-full'> 
                            <label className='font-thin text-base mb-2'>Task Date:</label>
                            <input type="date" required id='date'
                                className='border py-1 px-2 placeholder-black focus:ring-2 ring-blue-300 outline-none
                            border-black focus:placeholder-gray-500 rounded mb-5 mt-1 w-full'>
                            </input>
                        </div>
                        <div className='w-full flex items-center justify-center'>
                            <label className='flex items-center gap-1 text-base cursor-pointer hover:text-blue-500 mt-1'>
                                <input type='file' multiple id='imgUpload' className='hidden' accept='.jpg .jpeg .png'></input>
                                <IoMdImages className='text-lg'/>
                                <span className='pl-2'>Add Assets</span>
                            </label>
                        </div>
                    </div>
                    <div className='w-full mt-5 gap-4 flex'>
                        <div className='w-full'>
                            {/*add functionality of uploading photos!!*/}
                        </div>
                        <div className='w-full flex justify-between gap-4'>
                            <button disabled={uploading}
                            className='px-3 py-2 rounded
                                bg-blue-700 text-white font-sans w-1/2
                                hover:bg-blue-500 transition duration-200
                                font-medium disabled:bg-blue-500'>
                            {uploading ? "Uploading..." : "Upload"}
                            </button>
                            <button disabled={uploading}
                            className='px-3 py-2 rounded w-1/2
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium disabled:bg-blue-500'>
                            Submit
                            </button>
                        </div>
                    </div>
                </div>
                <div>
                    photos
                </div>
            </div>
        </div>
    )
}

export default CreateTask