import React from 'react'

import { Tab, TabGroup, TabList, TabPanels } from '@headlessui/react'

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}
export default function TabsProfile  ({ tabs, setSelected, children }) {
 return (
        <div className='shadow-lg w-full p-1 sm:px-0 bg-white rounded mb-2'>
         <TabGroup>
             <div className='flex w-full flex-col sm:flex-row gap-4 sm:gap-0'>
                <TabList className='w-full sm:w-1/3 flex flex-col space-y-4 rounded-xl px-3 py-1 pt-2 -mb-1'>
                    {
                        tabs.map((tab, index) => (
                            <Tab key={tab.title} onClick={() => setSelected(index)}
                                className={({ selected }) => classNames("rounded w-full flex items-center outline-none gap-2 px-3 py-2.5 text-base font-medium leading-5 bg-gray-100 shadow-lg justify-center",
                                    selected ? "text-blue-700 border-b-2 border-blue-600 border-l-2 border-l-black/20 border-t-2 border-t-black/20 border-r-2 border-r-black/20 hover:text-blue-400 hover:border-b-blue-400" :
                                        "text-black hover:text-blue-800"
                                )}>
                                {tab.icon}
                                <span>{tab.title}</span>
                            </Tab>
                        ))
                    }
                </TabList>
                <TabPanels className="w-full pl-3 mt-5 md:ml-4 mr-2">
                    {children}
                 </TabPanels>
             </div>
            </TabGroup>
        </div>
    )
}
