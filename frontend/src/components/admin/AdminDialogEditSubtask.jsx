import React, { useEffect, useState } from 'react'

import { DialogTitle } from '@headlessui/react';

import MyModal from '../MyModal';

const AdminDialogEditSubtask = ({ open, setOpen, allTasks, setAllTasks, taskID, subtaskIndex, subtaskData }) => {
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        tag: "",
    });
    
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };
    
    const handleCancel = () => {
        setOpen(false);
    }
    
    console.log("AllTasks-DialogEditSubtask-FormData: ", formData);
    console.log("subtaskData: ", subtaskData);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.title === "") delete formData.title;
        if (formData.date === "") delete formData.date;
        if (formData.tag === "") delete formData.tag;

        try {
            setLoading(true);

            const res = await fetch('http://localhost:8081/backend/admin/edit/subtask', {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ formData: formData, taskID: taskID, subtaskIndex: subtaskIndex }),
            });

            const data = await res.json();
            if (data.success === false) {
                console.log(data.message);
                setLoading(false);
                return;
            }

            setAllTasks((prevTasks) =>
                prevTasks.map((task) =>
                    (task._id === data._id) ? {
                        ...task, subtasks: task.subtasks.map((subtask, index) =>
                            (index === subtaskIndex) ?
                                {
                                    ...subtask,
                                    title: formData.title || subtask.title,
                                    date: formData.date || subtask.date,
                                    tag: formData.tag || subtask.tag,
                                } : subtask)
                    } : task));
            
            setLoading(false);
            setFormData({
                title: "",
                date: "",
                tag: "",
            });
            handleCancel();
        } catch (error) {
            console.error(error.message);
            setLoading(false);
            return;
        }
    }

    return (
        <>
            <MyModal open={open} setOpen={setOpen}>
                <DialogTitle as="h2"
                    className="text-base font-semibold leading-6 text-black mb-4 pl-0">
                    UPDATE SUBTASK
                </DialogTitle>
        
                <div className='mt-2 flex flex-col'>
          
                    <div className='flex gap-4 mt-5'>
                        <div className='w-full'>
                            <label className='font-thin text-base mb-2'>Title:</label>
                            <input type="text" id="title" onChange={handleChange}
                                value={formData.title || ""}
                                className='border py-1 px-2 placeholder-black focus:ring-2 ring-blue-300 outline-none
                            border-black focus:placeholder-gray-500 rounded mt-1 w-full'
                                placeholder={subtaskData?.title}>
                            </input>
                        </div>
                    </div>
          
                    <div className='flex gap-4 mt-5'>
                        <div className='w-full'>
                            <label className='font-thin text-base mb-2'>Tag:</label>
                            <input type="text" id="tag" onChange={handleChange} value={formData.tag || ""}
                                className='border py-1 px-2 placeholder-black focus:ring-2 ring-blue-300 outline-none
                            border-black focus:placeholder-gray-500 rounded mt-1 w-full'
                                placeholder={subtaskData?.tag}>
                            </input>
                        </div>
                    </div>

                    <div className='flex gap-4 mt-5'>
                        <div className='w-full'>
                            <label className='font-thin text-base mb-2'>Subtask Date:</label>
                            <input type="date" required id='date' onChange={handleChange} value={formData.date ? formData.date.split('T')[0] : subtaskData?.date?.split('T')[0] || ""}
                                className='border py-1 px-2 placeholder-black focus:ring-2 ring-blue-300 outline-none
                            border-black focus:placeholder-gray-500 rounded mb-5 mt-1 w-full'>
                            </input>
                        </div>
                    </div>
                    
                </div>

                <br></br>
            
                <div className="w-full -mt-2 gap-4 flex">
                    <div className="w-full">
                        {/* blank */}
                    </div>

                    <div className="w-full flex justify-between gap-4">
                        <button onClick={() => {
                            setOpen(false);
                            setFormData({
                                title: "",
                                date: "",
                                tag: "",
                            });
                        }}
                            className="px-3 py-1 rounded
                                bg-white text-black font-sans w-1/2
                                hover:bg-gray-300 transition duration-200
                                font-medium disabled:bg-gray-300
                                border-2 border-gray-400"
                        >
                            Cancel
                        </button>
                        <button disabled={loading}
                            className="px-3 py-1 rounded w-1/2
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium disabled:bg-blue-500"
                            onClick={handleSubmit}
                        >
                            {loading ? "Submitting" : "Submit"}
                        </button>
                    </div>
                </div>

            </MyModal>
        </>
    )
}

export default AdminDialogEditSubtask