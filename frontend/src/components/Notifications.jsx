import React, { useEffect } from 'react'
import moment from "moment"
import { useState, Fragment } from 'react'
import { Link } from 'react-router-dom';

import { Transition } from '@headlessui/react'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'

import { IoIosNotifications } from "react-icons/io";
import { HiBellAlert } from "react-icons/hi2";
import { BiSolidMessage } from "react-icons/bi";

import DialogNotification from './dialog/DialogNotification';

const icons = {
  alert: (<HiBellAlert className='h-5 w-5 text-black group-hover:text-gray-400'></HiBellAlert>),
  message:(<BiSolidMessage className='h-5 w-5 text-black group-hover:text-gray-400'></BiSolidMessage>)
}

const Notifications = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("http://localhost:8081/backend/notif/get", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setNotifications(data);
    } catch (error) {
      console.log(error.message);
      return;
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  console.log("NOTIFS", notifications);
  
  const readAllHandlerOnClick = async () => {
    try {
      const res = await fetch(`http://localhost:8081/backend/notif/mark-all-as-read`, {
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

      setNotifications([]);
      
    } catch (error) {
      console.log(error.message);
      return;
    }
  }

  const [notifData, setNotifData] = useState(null);
  const [openDialogNotify, setOpenDialogNotify] = useState(false);

  const viewHandlerOnClick = (item) => {
    setNotifData(item);
    setOpenDialogNotify(true);
  }

  console.log("Open:", openDialogNotify);
  console.log("notiData", notifData);
  
  const callsToAction = [
    { name: "Cancel" },
    {
      name: "Mark All Read",
      onClick: () => readAllHandlerOnClick(),
    },
  ];

  return (
    <Popover className="relative">
      <PopoverButton className="items-center inline-flex outline-none ml-1 -mr-2">
        <div className='group flex items-center w-6 h-8 justify-center text-black relative'>
          <IoIosNotifications className=' text-2xl group-hover:text-gray-500'></IoIosNotifications>
          {notifications?.length > 0 && (
            <span className='absolute top-0 -right-1 text-xs text-white font-semibold
              w-4 h-4 rounded-full bg-red-600'>
              {notifications?.length}
            </span>
          )}
        </div>
      </PopoverButton>
      <Transition
        as={Fragment}
        enter='transition ease-out duration-100'
        enterFrom='transform opacity-0 scale-95'
        enterTo='transform opacity-100 scale-100'
        leave='transition ease-in duration-75'
        leaveFrom='transform opacity-100 scale-100'
        leaveTo='transform opacity-0 scale-95'
      >
        <PopoverPanel className='absolute -right-16 md:-right-2 z-10 mt-5 flex w-screen max-w-max  px-4'>
          {({ close }) =>
            notifications?.length > 0 ? (
              <div className='w-screen max-w-md flex-auto overflow-hidden rounded-3xl 
                bg-white text-sm leading-6 shadow-2xl ring-1 ring-gray-900/5'>
                <div className='p-4'>
                  {notifications?.slice(0, 5).map((item, index) => (
                    <div
                      key={item._id + index}
                      className='group relative flex gap-x-4 rounded-lg p-4 hover:bg-gray-100'
                    >
                      <div className='mt-1 h-8 w-8 flex items-center justify-center rounded-lg group-hover:text-black'>
                        {icons[item.type]}
                      </div>

                      <div
                        className='cursor-pointer'
                        onClick={() => viewHandlerOnClick(item)}
                      >
                        <div className='flex items-center gap-3 font-medium font-sans text-gray-900 capitalize'>
                          <p> {item.type}</p>
                          <span className='text-xs font-thin lowercase'>
                            {moment(item.createdAt).fromNow()}
                          </span>
                        </div>
                        <p className='line-clamp-1 mt-1 text-gray-600'>
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='grid grid-cols-2 divide-x bg-gray-50'>
                  {callsToAction.map((item) => (
                    <Link
                      key={item.name}
                      onClick={
                        item?.onClick ? () => item.onClick() : () => close()
                      }
                      className='flex items-center justify-center gap-x-2.5 p-3 font-semibold text-blue-700 hover:bg-gray-200'
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>

                <DialogNotification open={openDialogNotify}
                  setOpen={setOpenDialogNotify}
                  notifications={notifications}
                  setNotifications={setNotifications}
                  notifData={notifData} />
              </div>
            ) : (
              <>
                <div className='w-screen max-w-md flex-auto overflow-hidden rounded-3xl 
                bg-white text-sm leading-6 shadow-2xl ring-1 ring-gray-900/5'>
                  <div className='p-4'>
                    <p>
                      No notifications.
                    </p>
                  </div>
                </div>
              </>
            )
          }
        </PopoverPanel>
      </Transition>
    </Popover>
  )
}

export default Notifications