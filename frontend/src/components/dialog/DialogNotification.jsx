import React from 'react'
import { useNavigate } from 'react-router-dom';

import { DialogTitle } from '@headlessui/react';

import MyModal from '../MyModal.jsx';

import { HiBellAlert } from "react-icons/hi2";
import { BiSolidMessage } from "react-icons/bi";

const icons = {
  alert: (<HiBellAlert className='text-black md:text-5xl text-3xl'></HiBellAlert>),
  message:(<BiSolidMessage className='text-black md:text-5xl text-3xl'></BiSolidMessage>)
}

const DialogNotification = ({ open, setOpen, notifications, setNotifications, notifData }) => {
    const navigate = useNavigate();

    const handleCancel = () => {
        setOpen(false);
    }

    const markAsRead = async (NotifID) => {
        try {
            const res = await fetch(`http://localhost:8081/backend/notif/mark-as-read/${NotifID}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            const data = await res.json();
            if (data.success === false) {
                console.log(data.message);
                return;
            }

            setNotifications(prevNotifications => prevNotifications.filter(n => n._id !== NotifID));
            handleCancel();
        } catch (error) {
            console.log(error.message);
            return;
        }
    }

    return (
        <>
            <MyModal open={open} setOpen={setOpen}>
                <div className='py-4 w-full flex flex-col gap-4 items-center justify-center'>
                    <DialogTitle as='h3'>
                        <p className='p-3 rounded-full text-black bg-gray-200'>
                            {icons[notifData?.type]}
                        </p>
                    </DialogTitle>
                    <p className='text-center text-black font-bold font-sans md:text-xl text-lg'>
                        {notifData?.type.toUpperCase()}
                    </p>

                    <p className='text-center text-black mt-1 font-serif md:text-lg text-base'>
                        {notifData?.text}
                    </p>

                    <div className='py-3 flex justify-between gap-4 bg-white w-auto'>
                        
                        <button className='px-6 py-2 rounded font-sans border-2 border-gray-400 bg-white ml-5
            hover:bg-gray-300 font-semibold' onClick={() => {
                                markAsRead(notifData._id);
                                navigate(`/task/${notifData.task}`);
                            }}>
                            View
                        </button>
                      
                        <button className='px-6 py-2 rounded font-sans border-2 border-gray-400 bg-white ml-5
            hover:bg-gray-300 font-semibold' onClick={() => markAsRead(notifData._id)}>
                            Mark as read
                        </button>
                    </div>
                </div>
            </MyModal>
        </>
    )
}

export default DialogNotification