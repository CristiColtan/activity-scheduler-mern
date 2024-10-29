import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import Select from "react-select"

import { getInitials } from '../utils/FullnameInitials';

const controlStyles = {
  base: "border rounded-lg bg-white hover:cursor-pointer",
  focus: "border-primary-600 ring-1 ring-primary-500",
  nonFocus: "border-black hover:border-black",
};
const placeholderStyles = "text-gray-500 pl-1 py-0.5";
const selectInputStyles = "pl-1 py-0.5";
const valueContainerStyles = "p-1 gap-1";
const singleValueStyles = "leading-7 ml-1";
const multiValueStyles =
  "bg-gray-100 rounded items-center py-0.5 pl-2 pr-1 gap-1.5";
const multiValueLabelStyles = "leading-6 py-0.5";
const multiValueRemoveStyles =
  "border border-gray-200 bg-white hover:bg-red-50 hover:text-red-800 text-gray-500 hover:border-red-300 rounded-md";
const indicatorsContainerStyles = "p-1 gap-1";
const clearIndicatorStyles =
  "text-gray-500 p-1 rounded-md hover:bg-red-50 hover:text-red-800";
const indicatorSeparatorStyles = "bg-gray-300";
const dropdownIndicatorStyles =
  "p-1 hover:bg-gray-100 text-gray-500 rounded-md hover:text-black";
const menuStyles = "p-1 mt-2 border border-gray-200 bg-white rounded-lg";
const groupHeadingStyles = "ml-3 mt-2 mb-1 text-gray-500 text-sm";
const optionStyles = {
  base: "flex justify-between items-center px-3 py-2 rounded hover:cursor-pointer font-base",
  focus: "bg-amber-100 active:bg-amber-200 text-black active:text-amber-900",
  selected: "after:mr-3 after:content-['✔'] after:text-green-500 text-black font-medium after:justify-end after:flex after:-translate-y-6",
};
const noOptionsMessageStyles =
  "text-gray-500 p-2 bg-gray-50 border border-dashed border-gray-200 rounded-sm";

const TaskAddUserListEdit2 = ({ updatedTeam, setUpdatedTeam, team, data }) => {

    const [selectedUsers, setSelectedUsers] = useState([]);

    const simplifiedTeam = team.map(member => ({
        label: (
            <div className="flex items-center">
                <div className="w-6 h-6 rounded-full text-white flex items-center justify-center bg-violet-600 mr-2">
                    <span className="text-center text-[12px]">
                        {getInitials(member.first_name, member.last_name)}
                    </span>
                </div>
                <span>{`${member.first_name} ${member.last_name}`}</span>
            </div>
        ),
        value: member._id,
    }));

    const simplifiedData = data.map(member => ({
        label: (
            <div className="flex items-center">
                <div className="w-6 h-6 rounded-full text-white flex items-center justify-center bg-violet-600 mr-2">
                    <span className="text-center text-[12px]">
                        {getInitials(member.first_name, member.last_name)}
                    </span>
                </div>
                <span>{`${member.first_name} ${member.last_name}`}</span>
            </div>
        ),
        value: member._id,
    }));

    useEffect(() => {
        setSelectedUsers(simplifiedTeam);
    }, [data, team]);
    
    useEffect(() => {
        setUpdatedTeam(selectedUsers.map(user => user.value));
    }, [selectedUsers]);

    return (
        <>
            <Select options={simplifiedData} isMulti={true} closeMenuOnSelect={false} hideSelectedOptions={false}
                onChange={(choice) => setSelectedUsers(choice)} value={selectedUsers} unstyled styles={{
                    input: (base) => ({
                        ...base,
                        "input:focus": {
                            boxShadow: "none",
                        },
                    }),
                    multiValueLabel: (base) => ({
                        ...base,
                        whiteSpace: "normal",
                        overflow: "visible",
                    }),
                    control: (base) => ({
                        ...base,
                        transition: "none",
                    }),
                }}
                classNames={{
                    control: ({ isFocused }) =>
                        clsx(
                            isFocused ? controlStyles.focus : controlStyles.nonFocus,
                            controlStyles.base,
                        ),
                    placeholder: () => placeholderStyles,
                    input: () => selectInputStyles,
                    valueContainer: () => valueContainerStyles,
                    singleValue: () => singleValueStyles,
                    multiValue: () => multiValueStyles,
                    multiValueLabel: () => multiValueLabelStyles,
                    indicatorsContainer: () => indicatorsContainerStyles,
                    indicatorSeparator: () => indicatorSeparatorStyles,
                    menu: () => menuStyles,
                    groupHeading: () => groupHeadingStyles,
                    option: ({ isFocused, isSelected }) =>
                        clsx(
                            isFocused && optionStyles.focus,
                            isSelected && optionStyles.selected,
                            optionStyles.base,
                        ),
                    noOptionsMessage: () => noOptionsMessageStyles,
                }}
                formatOptionLabel={(option) => (
                    <div className="flex items-center w-full justify-between">
                        {option.label}
                
                    </div>
                )}
                placeholder="Select users..."
            />
            
        </>
    )
}

export default TaskAddUserListEdit2