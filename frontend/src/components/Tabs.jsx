import React from 'react'

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function Tabs({ tabs, setSelected, children }) {
    return (
        <div className='shadow-lg w-full p-1 sm:px-0 bg-white rounded mb-2'>
            <TabGroup>
                <TabList className='flex space-x-6 rounded-xl px-3 py-1 pt-2 -mb-1'>
                    {
                        tabs.map((tab, index) => (
                            <Tab key={tab.title} onClick={() => setSelected(index)}
                                className={({ selected }) => classNames("rounded w-fit flex items-center outline-none gap-2 px-3 py-2.5 text-base font-medium leading-5 bg-gray-100 shadow-lg",
                                    selected ? "text-blue-700 border-b-2 border-blue-600 border-l-2 border-l-black/20 border-t-2 border-t-black/20 border-r-2 border-r-black/20 hover:text-blue-400 hover:border-b-blue-400" :
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