import React, { Fragment } from 'react'
import clsx from 'clsx'

import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'

import { MdCheck } from 'react-icons/md'
import { BsChevronExpand } from 'react-icons/bs'

const TaskSelectList = ({ lists, selected, setSelected }) => {
    return (
        <div className='w-full'>
            <Listbox value={selected} onChange={setSelected}>
                <div className='relative mt-1'>
                    <ListboxButton className="relative w-full cursor-default rounded pl-3 pr-10 text-left px-3 py-1
                    2xl:py-3 border border-black sm:text-sm min-h-6 min-w-40">
                        <span className='block truncate'>
                            {selected}
                        </span>
                        <span className='pointer-events-none absolute flex items-center inset-y-0 right-3'>
                            <BsChevronExpand className='h-5 w-5' aria-hidden="true" />
                        </span>
                    </ListboxButton>
                    <Transition
                        as={Fragment}
                        enter='transition ease-out duration-100'
                        enterFrom='transform opacity-0 scale-95'
                        enterTo='transform opacity-100 scale-100'
                        leave='transition ease-in duration-75'
                        leaveFrom='transform opacity-100 scale-100'
                        leaveTo='transform opacity-0 scale-95'
                    >
                        <ListboxOptions className="z-50 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white
                        py-1 sm:text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
                            {lists.map((list, index) => (
                                <ListboxOption key={index} value={list} className={({ active }) => clsx('relative cursor-default select-none py-2 pl-6 pr-4', active ? "bg-amber-100 text-amber-900" : "text-black")}>
                                    {({ selected }) => (<>
                                        <span className={clsx('block truncate', selected ? 'font-medium' : 'font-normal')}>
                                            {list}
                                        </span>
                                        {selected ? (
                                            <span className='absolute inset-y-0 right-3 flex items-center text-green-600'>
                                                <MdCheck className='h-5 w-5' aria-hidden='true' />
                                            </span>
                                        ) : null}
                                    </>)}
                                </ListboxOption>
                            ))}
                        </ListboxOptions>
                    </Transition>
                </div>
            </Listbox>
        </div>
    )
}

export default TaskSelectList