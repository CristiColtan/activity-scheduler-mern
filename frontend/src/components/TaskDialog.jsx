import React, { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { useSelector } from "react-redux";

import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";

import { FaRegFolderOpen } from "react-icons/fa6";
import { MdOutlineEdit } from "react-icons/md";
import { FaCopy } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";

import DialogDeleteConfirmTask from "./dialog/DialogTrashConfirmTask";
import DialogDuplicateTask from "./dialog/DialogDuplicateTask";

import { apiRequest } from "../utils/apiReq.js";

const TaskDialog = ({ task, tasks, setTasks }) => {
  const [openDialogDelete, setOpenDialogDelete] = useState(false);
  const [openDialogDuplicate, setOpenDialogDuplicate] = useState(false);

  const { currentUser } = useSelector((state) => state.user);

  const navigate = useNavigate();

  const duplicateHandlerOnClick = () => {
    setOpenDialogDuplicate(true);
  };

  const deleteHandlerOnClick = () => {
    setOpenDialogDelete(true);
  };

  const items = [
    {
      label: "Open Task",
      icon: <FaRegFolderOpen className="h-5 w-5 mr-2" aria-hidden="true" />,
      onClick: () => navigate(`/task/${task._id}`),
    },
    {
      label: "Edit Task",
      icon: <MdOutlineEdit className="h-5 w-5 mr-2" aria-hidden="true" />,
      onClick: () => navigate(`/edit-task/${task._id}`),
    },
    {
      label: "Duplicate",
      icon: <FaCopy className="h-5 w-5 mr-2" aria-hidden="true" />,
      onClick: () => duplicateHandlerOnClick(),
    },
    {
      label: "Trash",
      icon: <MdDelete className="h-5 w-5 mr-2" aria-hidden="true" />,
      onClick: () => deleteHandlerOnClick(),
    },
  ];

  return (
    <>
      <div>
        <Menu as="div" className="relative inlin-block text-left">
          <MenuButton className="inline-flex w-full justify-center rounded px-4 py-1 font-serif">
            <BsThreeDots />
          </MenuButton>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <MenuItems
              className="absolute p-4 right-0 mt-2 w-52 origin-top-right divide-y divide-gray
            rounded bg-white shadow-lg ring-1 ring-black/5 focus:outline-none z-10"
            >
              {items.map((el, index) => (
                <MenuItem key={el.label + index}>
                  {({ active }) => (
                    <button
                      onClick={el.onClick}
                      disabled={
                        currentUser.is_admin === "No" &&
                        currentUser.is_team_manager === "No" &&
                        el.label !== "Open Task"
                      }
                      className={clsx(
                        "flex w-full items-center rounded px-2 py-1.5 text-base hover:bg-gray-200",
                        {
                          "disabled:cursor-not-allowed disabled:text-gray-400":
                            el.label === "Edit Task",
                          "disabled:cursor-not-allowed disabled:text-red-400 text-red-600":
                            el.label === "Trash",
                          "disabled:cursor-not-allowed disabled:text-blue-400 text-blue-600":
                            el.label === "Duplicate",
                        }
                      )}
                    >
                      {el.icon}
                      <p className="font-sans mt-0.5">{el.label}</p>
                    </button>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Transition>
        </Menu>
      </div>

      <DialogDeleteConfirmTask
        open={openDialogDelete}
        setOpen={setOpenDialogDelete}
        taskData={task}
        tasks={tasks}
        setTasks={setTasks}
      />
      <DialogDuplicateTask
        open={openDialogDuplicate}
        setOpen={setOpenDialogDuplicate}
        taskData={task}
        tasks={tasks}
        setTasks={setTasks}
      />
    </>
  );
};

export default TaskDialog;
