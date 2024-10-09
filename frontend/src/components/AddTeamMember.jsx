import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { useSelector } from 'react-redux';
import { Dialog, DialogTitle } from "@headlessui/react"
import { useNavigate } from 'react-router-dom';

import MyModal from './MyModal'
import TaskAddUserList from './TaskAddUserList';

const AddTeamMember = ({ open, setOpen }) => {
    const [loading, setLoading] = useState(false);
    const [normalUsers, setNormalUsers] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);

    const [errorAddTeamMember, setErrorAddTeamMember] = useState(null);
    const navigate = useNavigate();

    const { currentUser, error } = useSelector((state) => state.user);

    const fetchNormalUsers = async () => {
        try {
            setLoading(true);
            let res;

            if (currentUser.is_team_manager === "Yes") {
                res = await fetch("http://localhost:8081/backend/team-manager/get/normal-users", {
                    credentials: "include",
                });
            }

            const data = await res.json();
            setNormalUsers(data);
        } catch (error) {
            console.log(error.message);
            setLoading(false);
            return;
        }
        setLoading(false);
    }

    useEffect(() => {
        if(open)
            fetchNormalUsers();
    }, [open]);

    const handleCancel = () => {
        setTeamMembers([]);
        setOpen(false);
    }

    const handleAddTeamMember = async () => {
        try {
            setLoading(true);
            //console.log("Team members before sent:", teamMembers);

            const res = await fetch("http://localhost:8081/backend/team-manager/add/team-member", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ membersID: teamMembers })
            });

            const data = await res.json();
            setLoading(false);

            navigate('/team');
            handleCancel();

        } catch (error) {
            console.error("Eroare adding team-member(s)!");
            setLoading(false);
            return;
        }
    }

    return (
        <>
            <MyModal open={open} setOpen={setOpen}>
                <DialogTitle as="h2" className="text-base font-semibold leading-6 text-black mb-4 pl-0">
                    ADD NEW TEAM MEMBER
                </DialogTitle>

                <TaskAddUserList team={teamMembers} setTeam={setTeamMembers} data={normalUsers}></TaskAddUserList>{
                    normalUsers && normalUsers.length > 0 ?
                        (
                            normalUsers.map((_, index) => (
                                <div key={index}>
                                    <br></br>
                                    <br></br>
                                </div>
                            ))
                        ) : (
                            <>
                            </>
                        )
                }

                <div className="w-full -mt-2 gap-4 flex">
                    <div className="w-full">
                        {/*add functionality of uploading photos!!*/}
                    </div>

                    <div className="w-full flex justify-between gap-4">
                        <button onClick={handleCancel}
                            className="px-3 py-2 rounded
                                bg-white text-black font-sans w-1/2
                                hover:bg-gray-300 transition duration-200
                                font-medium disabled:bg-gray-300
                                border-2 border-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            className="px-3 py-2 rounded w-1/2
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium disabled:bg-blue-500"
                            onClick={handleAddTeamMember}
                        >
                            {loading ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </div>
            </MyModal>
        </>
    )
}

export default AddTeamMember