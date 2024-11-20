import React, { useState } from 'react'

import { DialogTitle } from '@headlessui/react';

import MyModal from '../MyModal';

const DialogEditSubtask = ({ open, setOpen, subtasks, setSubtasks, taskID, subtaskIndex, subtaskData }) => {
    const [formData, setFormData] = useState({
        title: "",
        date: "",
    });
    
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };
    
    const handleCancel = () => {
        setOpen(false);
    }
    
    console.log("DialogEditSubtask-FormData: ", formData);
    console.log("subtaskData: ", subtaskData);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.title === "") delete formData.title;
        if (formData.date === "") delete formData.date;
        
        try {
            setLoading(true);

            const res = await fetch('http://localhost:8081/backend/task/edit-task-details-subtask', {
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

            setSubtasks(data.subtasks);
            setLoading(false);
            setFormData({
                title: "",
                date: "",
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
                    className="text-base font-semibold leading-6 text-black mb-2 pl-0">
                    UPDATE SUBTASK
                </DialogTitle>
        
                <div className=' flex flex-col'>
          
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

export default DialogEditSubtask