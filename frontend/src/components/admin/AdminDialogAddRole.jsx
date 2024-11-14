import React, { useState } from 'react'

import { DialogTitle } from '@headlessui/react';

import MyModal from '../MyModal';

const AdminDialogAddRole = ({ open, setOpen, roles, setRoles }) => {
    const [formData, setFormData] = useState({
        role: "",
    });

    const [loading, setLoading] = useState(false);
    const [eroare, setEroare] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleCancel = () => {
        setOpen(false);
    }
    
    console.log("AddRole-formData:", formData);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.role === "") delete formData.role;

        try {
            setLoading(false);

            const res = await fetch("http://localhost:8081/backend/admin/add/role", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ role: formData.role }),
            });

            const data = await res.json();
            if (data.success === false) {
                console.log(data.message);
                setLoading(false);
                setEroare(data.message);
                return;
            }
            
            setRoles(data);
            setLoading(false);
            setEroare(null);
            setFormData({
                role: "",
            });
            handleCancel();
        } catch (error) {
            console.log(error.message);
            setEroare(error.message);
            setLoading(false);
            return;
        }

    }

    return (
        <>
            <MyModal open={open} setOpen={setOpen}>
                <DialogTitle as="h2"
                    className="text-base font-semibold leading-6 text-black mb-4 pl-0">
                    ADD ROLE
                </DialogTitle>
                {eroare && <span className='text-red-500'>{eroare}</span>}
        
                <div className='mt-2 flex flex-col gap-10'>
                    <div className='w-full flex flex-col gap-1'>
                        <label htmlFor='role' className='font-normal text-base'>Role:</label>
                        <input type="text" id="role" onChange={handleChange} value={formData.role || ""}
                            className='bg-transparent px-3 py-0.5
                                    border border-gray-400 placeholder-gray-500
                                  text-gray-900 outline-none text-base w-full
                                    focus:ring-2 ring-blue-300 rounded'
                        placeholder='Role'>
                        </input>
                    </div>
                </div>

                <br></br>
                <br></br>

                <div className="w-full -mt-2 gap-4 flex">
                    <div className="w-full">
                        {/* blank */}
                    </div>

                    <div className="w-full flex justify-between gap-4">
                        <button onClick={() => {
                            setOpen(false);
                            setFormData({
                                role: "",
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

export default AdminDialogAddRole