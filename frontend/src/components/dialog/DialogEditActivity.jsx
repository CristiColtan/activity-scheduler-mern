import React, { useEffect, useState } from 'react'

import { DialogTitle } from '@headlessui/react';

import MyModal from '../MyModal';

const DialogEditActivity = ({ open, setOpen, setActivities, taskID, activityIndex, activityData }) => {
    const [formData, setFormData] = useState({
        description: "",
    });
    const [loading, setLoading] = useState(false);
  
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    console.log("DialogEditActivity-FormData: ", formData);
    console.log("actData: ", activityData);
    
    const handleCancel = () => {
        setOpen(false);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.description === "") delete formData.description;

        try {
            setLoading(true);

            const res = await fetch(`http://localhost:8081/backend/task/edit-task-details-activity`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ formData: formData, taskID: taskID, activityIndex: activityIndex }),
            });

            const data = await res.json();
            if (data.success === false) {
                console.log(data.message);
                setLoading(false);
                return;
            }

            setActivities(data.activities);
            setLoading(false);
            setFormData({
                description: "",
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
                    UPDATE ACTIVITY
                </DialogTitle>
        
                <div className='mt-2 flex flex-col gap-10'>
          
                    <div className='w-full flex flex-col gap-1'>
                        <label htmlFor='description' className='font-normal text-base'>Description:</label>
                        <input type="text" id="description" onChange={handleChange} value={formData.description || ""}
                            className='bg-transparent px-3 py-0.5
                                    border border-gray-400 placeholder-gray-500
                                  text-gray-900 outline-none text-base w-full
                                    focus:ring-2 ring-blue-300 rounded'
                            placeholder={activityData?.description}>
                        </input>
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
                                description: "",
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

export default DialogEditActivity