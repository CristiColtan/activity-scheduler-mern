import React from 'react'

import { Tab, TabGroup, TabList, TabPanels } from '@headlessui/react'
import { setSelectedTab } from '../../redux/user/userSlice.js';

import { useDispatch, useSelector } from 'react-redux';

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

const AdminTabs = ({ tabs, setSelected, children }) => {
    const dispatch = useDispatch();
    const selectedTabIndex = useSelector((state) => state.user.selectedAdminTasksTab);

    const handleTabClick = (index) => {
        dispatch(setSelectedTab(index));
    }

  return (
        <div className=' w-full p-1 sm:px-0 rounded mb-2'>
            <TabGroup>
                <TabList className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 rounded-xl px-3 py-1 pt-2 -mb-1'>
                    {
                        tabs.map((tab, index) => (
                            <Tab key={tab.title} onClick={() => handleTabClick(index)}
                                className={({ selected }) => classNames("justify-center rounded w-full sm:w-fit flex items-center outline-none gap-2 px-3 py-2.5 text-base font-medium leading-5 bg-gray-100 shadow-lg",
                                    selectedTabIndex === index ? "text-blue-700 border-b-2 border-blue-600 border-l-2 border-l-black/20 border-t-2 border-t-black/20 border-r-2 border-r-black/20 hover:text-blue-400 hover:border-b-blue-400" :
                                        "text-black hover:text-blue-800"
                                )}>
                                {tab.icon}
                                <span>{tab.title}</span>
                            </Tab>
                        ))
                    }
                </TabList>
                <TabPanels className="w-full pl-3 mt-5">
                    {children}
                </TabPanels>
            </TabGroup>
        </div>
    )
}

export default AdminTabs