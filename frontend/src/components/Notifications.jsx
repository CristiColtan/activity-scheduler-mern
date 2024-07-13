import React from 'react'
import moment from "moment"
import { useState, Fragment } from 'react'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'

import { IoIosNotifications } from "react-icons/io";
import { HiBellAlert } from "react-icons/hi2";
import { BiSolidMessage } from "react-icons/bi";

const data = [
  {
    _id: "65c5bbf3787832cf99f28e6d",
    team: [
      "65c202d4aa62f32ffd1303cc",
      "65c27a0e18c0a1b750ad5cad",
      "65c30b96e639681a13def0b5",
    ],
    text: "New task has been assigned to you and 2 others. The task priority is set a normal priority, so check and act accordingly. The task date is Thu Feb 29 2024. Thank you!!!",
    task: null,
    notiType: "alert",
    isRead: [],
    createdAt: "2024-02-09T05:45:23.353Z",
    updatedAt: "2024-02-09T05:45:23.353Z",
    __v: 0,
  },
   {
    _id: "65c5bbf3787832cf99f28e6d",
    team: [
      "65c202d4aa62f32ffd1303cc",
      "65c27a0e18c0a1b750ad5cad",
      "65c30b96e639681a13def0b5",
    ],
    text: "New task has been assigned to you and 2 others. The task priority is set a normal priority, so check and act accordingly. The task date is Thu Feb 29 2024. Thank you!!!",
    task: null,
    notiType: "alert",
    isRead: [],
    createdAt: "2024-02-09T05:45:23.353Z",
    updatedAt: "2024-02-09T05:45:23.353Z",
    __v: 0,
  },
];

 

const icons = {
  alert: (<HiBellAlert className='h-5 w-5 text-black group-hover:text-gray-400'></HiBellAlert>),
  message:(<BiSolidMessage className='h-5 w-5 text-black group-hover:text-gray-400'></BiSolidMessage>)
}

const Notifications = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  
  const readHandler = () => {
    
  }

  const viewHandler = () => {
    
  }
  
  const callsToAction = [
    { name: "Cancel", href: "#", icon: "" },
    {
      name: "Mark All Read",
      href: "#",
      icon: "",
      onClick: () => readHandler("all", ""),
    },
  ];

  return (
    <Popover className="relative">
      <PopoverButton className="items-center inline-flex outline-none ml-1 -mr-2">
        <div className='group flex items-center w-6 h-8 justify-center text-black relative'>
          <IoIosNotifications className=' text-2xl group-hover:text-gray-500'></IoIosNotifications>
            {data?.length > 0 && (
              <span className='absolute top-0 -right-1 text-xs text-white font-semibold
              w-4 h-4 rounded-full bg-red-600'>
                {data?.length}
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
              data?.length > 0 && (
              <div className='w-screen max-w-md flex-auto overflow-hidden rounded-3xl 
                bg-white text-sm leading-6 shadow-2xl ring-1 ring-gray-900/5'>
                  <div className='p-4'>
                    {data?.slice(0, 5).map((item, index) => (
                      <div
                        key={item._id + index}
                        className='group relative flex gap-x-4 rounded-lg p-4 hover:bg-gray-100'
                      >
                        <div className='mt-1 h-8 w-8 flex items-center justify-center rounded-lg group-hover:text-black'>
                          {icons[item.notiType]}
                        </div>

                        <div
                          className='cursor-pointer'
                          onClick={() => viewHandler(item)}
                        >
                          <div className='flex items-center gap-3 font-medium font-sans text-gray-900 capitalize'>
                            <p> {item.notiType}</p>
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
                </div>
              )
            }
          </PopoverPanel>
      </Transition>
    </Popover>
  )
}

export default Notifications