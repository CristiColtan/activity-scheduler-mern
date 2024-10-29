import React, { useState, Fragment, useEffect } from 'react';
import clsx from 'clsx';

import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { BsChevronExpand } from 'react-icons/bs';
import { MdCheck } from 'react-icons/md';

import { getInitials } from '../utils/FullnameInitials.js';

const TaskAddUserList = ({ setTeam, team, data }) => {
    const [selectedUsers, setSelectedUsers] = useState([]);

    const handleChange = (el) => {
        const validUsers = el.filter(user => user && user._id);
        setSelectedUsers(validUsers);
        setTeam(validUsers.map((u) => u._id));
    };

    useEffect(() => {
        if (team.length < 1)
            data && setSelectedUsers([]);
        else
            setSelectedUsers(team);
    }, []);

    return (
        <div>
            <Listbox value={selectedUsers} onChange={handleChange} multiple>
                <div className="relative -mt-1">
                    <ListboxButton className="relative w-full cursor-default rounded pl-3 pr-10 text-left px-3 py-1
                    2xl:py-3 border border-black sm:text-sm min-h-6">
                        <span className="block truncate">
                            {selectedUsers.length > 0 ?
                                selectedUsers.map(user => `${user.first_name} ${user.last_name}`).join(", ") :
                                "No users selected"
                            }
                        </span>
                        <span className="pointer-events-none absolute flex items-center inset-y-0 right-3">
                            <BsChevronExpand className="h-5 w-5" aria-hidden="true" />
                        </span>
                    </ListboxButton>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <ListboxOptions className="z-50 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white
                        py-1 sm:text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
                            {data.length > 0 ? (
                                data.map(user => (
                                    <ListboxOption key={user._id} value={user}
                                        className={({ active }) => clsx('relative cursor-default select-none py-2 pl-6 pr-4', active ? "bg-amber-100 text-amber-900" : "text-black")}>
                                        {({ selected }) => (
                                            <>
                                                <div className={clsx("flex items-center gap-2 truncate", selected ? "font-medium" : "font-normal")}>
                                                    <div className="w-6 h-6 rounded-full text-white flex items-center justify-center bg-violet-600">
                                                        <span className="text-center text-[12px]">
                                                            {getInitials(user.first_name, user.last_name)}
                                                        </span>
                                                    </div>
                                                    <span>{user.first_name}{" "}{user.last_name}</span>
                                                </div>
                                                {selected && (
                                                    <span className="absolute inset-y-0 right-10 flex items-center text-green-600">
                                                        <MdCheck className="h-5 w-5" aria-hidden="true" />
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </ListboxOption>
                                ))
                            ) : (
                                <div className="py-2 pl-6 pr-4 text-black">No users available.</div>
                            )}
                        </ListboxOptions>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
}

export default TaskAddUserList;
