import React, { useEffect, useState } from 'react'

import { DialogTitle } from '@headlessui/react';

import MyModal from '../MyModal';
import TaskSelectList from '../TaskSelectList';

const DialogSetRoleTaskDetails = ({ open, setOpen, editRoleData, taskId, userId, team, setTeam }) => {
    const [loading, setLoading] = useState(false);
    const [eroare, setEroare] = useState(null);

    const [rolesList, setRolesList] = useState([]);

    const fetchRoles = async () => {
        try {
            setLoading(false);

            const res = await fetch("http://localhost:8081/backend/task/get-user-roles", {
                credentials: "include",
            });

            const data = await res.json();
            if (data.success === false) {
                console.log(data.message);
                setLoading(false);
                setEroare(data.message);
                return;
            }

            setRolesList(data);
            setLoading(false);
            setEroare(null);

        } catch (error) {
            console.log(error.message);
            setEroare(error.message);
            setLoading(false);
            return;
        }
    }

    const [rolee, setRolee] = useState(editRoleData || []);
    
    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        setRolee(editRoleData);
    }, [open, editRoleData]);

    const handleCancel = () => {
        setOpen(false);
        setEroare(null);
    }

    console.log("UserRoles: ", rolesList);
    console.log("RolAles", rolee);
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(false);

            const res = await fetch("http://localhost:8081/backend/task/edit-user-role-on-task", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ role: rolee, userId: userId, taskId: taskId }),
            });
            
            const data = await res.json();
            if (data.success === false) {
                console.log(data.message);
                setLoading(false);
                setEroare(data.message);
                return;
            }

            setTeam((prevTeam) => prevTeam.map((member) => member._id === userId ?
                { ...member, roles: [{ task: taskId, role: rolee }] } : member));
            setLoading(false);
            setEroare(null);
            handleCancel();
        } catch (error) {
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
                    EDIT USER ROLE
                </DialogTitle>
                {eroare && <span className='text-red-500'>{eroare}</span>}
        
                <div className='mt-2 flex flex-col gap-10'>
                    <TaskSelectList lists={rolesList} selected={rolee} setSelected={setRolee} />
                </div>

                {
                    rolesList && rolesList.length > 0 ? (
                        rolesList.slice(0, 6).map((_, index) => (
                            <div key={index}>
                                <br></br>
                                <br></br>
                            </div>
                        ))
                    ) : (<></>)
                }

                <div className="w-full -mt-2 gap-4 flex">
                    <div className="w-full">
                        {/* blank */}
                    </div>

                    <div className="w-full flex justify-between gap-4">
                        <button onClick={() => {
                            setOpen(false);
                            setEroare(null);
                            setRolee(editRoleData);
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

export default DialogSetRoleTaskDetails