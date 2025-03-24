import React, { useState, Fragment, useEffect, useMemo } from "react";
import clsx from "clsx";
import moment from "moment";
import {
  Popover,
  PopoverPanel,
  PopoverButton,
  Transition,
} from "@headlessui/react";

import Loading from "../Loading.jsx";
import AdminPagetitle from "./AdminPageTitle.jsx";

import { HiBellAlert } from "react-icons/hi2";
import { BiSolidMessage } from "react-icons/bi";
import { FaSort } from "react-icons/fa";

import { getInitials } from "../../utils/FullnameInitials.js";

import { apiRequest } from "../../utils/apiReq.js";

const AdminNotificationsLog = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "asc",
  }); //configuration (can't sort multiple items at once)
  //console.log("sortconfig", sortConfig);

  const sortedNotifications = useMemo(() => {
    if (sortConfig.key) {
      return [...notifications].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.key === "createdAt") {
          return sortConfig.direction === "desc"
            ? new Date(aValue) - new Date(bValue)
            : new Date(bValue) - new Date(aValue);
        }

        if (sortConfig.key === "type") {
          const order =
            sortConfig.direction === "asc"
              ? ["message", "alert"]
              : ["alert", "message"];

          return order.indexOf(aValue) - order.indexOf(bValue);
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return notifications;
  }, [notifications, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  console.log("Notifications:", notifications);

  const fetchNotificationsLog = async () => {
    try {
      setLoading(true);

      const res = await apiRequest(
        "http://localhost:8081/backend/admin/get/notifications-log"
      );

      if (!res) return;

      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        setError(data.message);
        setLoading(false);
        return;
      }

      setNotifications(data);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.log(error.message);
      setError(error.message);
      setLoading(false);
      return;
    }
  };

  useEffect(() => {
    fetchNotificationsLog();
  }, []);

  const MyUserInfo = ({ user }) => {
    return (
      <>
        <div className="px-4">
          <Popover className="relative">
            <>
              <PopoverButton className="group inline-flex items-center outline-none">
                <span className="text-white font-medium">
                  {getInitials(user?.first_name, user?.last_name)}
                </span>
              </PopoverButton>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <PopoverPanel className="absolute left-1/2 z-10 mt-3 w-120 max-w-sm -translate-x-2/3 transform px-4 sm:px-0">
                  <div className="flex items-center gap-4 rounded-lg shadow-lg bg-white ring-1 ring-gray-900/5 py-2">
                    <div className="w-14 h-14 text-white rounded-full flex items-center justify-center text-2xl mx-1 bg-gray-400">
                      <span className="text-white font-medium">
                        {getInitials(user?.first_name, user?.last_name)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-y-1 mx-1">
                      <p className="text-black font-serif text-base">
                        {user?.first_name + " " + user?.last_name}
                      </p>
                      <span className="text-gray-700 font-serif">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          </Popover>
        </div>
      </>
    );
  };

  const MyTableHeaderNotif = () => {
    return (
      <thead className="border-b border-black">
        <tr className="text-black text-left">
          <th
            className="py-2 pr-4 pl-1 cursor-pointer flex items-center justify-center gap-1"
            onClick={() => handleSort("type")}
          >
            Type
            {sortConfig.key === "type" ? (
              <span>{sortConfig.direction === "asc" ? " ▲" : " ▼"} </span>
            ) : (
              <span>
                <FaSort />
              </span>
            )}
          </th>

          <th className="py-2 pr-4">Description</th>

          <th className="py-2 pr-4"></th>

          <th className="py-2">Sent to</th>

          <th
            className="py-2 hidden pr-3 cursor-pointer lg:flex lg:items-center lg:justify-center lg:gap-1"
            onClick={() => handleSort("createdAt")}
          >
            Created
            {sortConfig.key === "createdAt" ? (
              <span>{sortConfig.direction === "asc" ? " ▲" : " ▼"}</span>
            ) : (
              <span>
                <FaSort />
              </span>
            )}
          </th>
        </tr>
      </thead>
    );
  };

  const icons = {
    alert: (
      <HiBellAlert className="h-5 w-5 text-black group-hover:text-gray-400"></HiBellAlert>
    ),
    message: (
      <BiSolidMessage className="h-5 w-5 text-black group-hover:text-gray-400"></BiSolidMessage>
    ),
  };

  const MyTableRowNotifs = ({ notification }) => {
    return (
      <>
        <tr className="text-black hover:bg-gray-200 border-b border-black">
          <td className="pl-1 py-2 pr-4 flex items-center justify-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm bg-gray-400">
                <span className="text-center">{icons[notification.type]}</span>
              </div>
            </div>
          </td>

          <td className="py-2 pr-4 max-w-xs">
            <p className="font-sans hover:line-clamp-none line-clamp-2">
              {notification.text}
            </p>
          </td>

          <td className="py-2"></td>

          <td
            className={clsx(
              "py-2",
              notification.sent_to.length === 1 && "pl-3"
            )}
          >
            <div className="flex">
              {notification.sent_to.map((m, index) => (
                <div
                  key={m._id + index}
                  className="w-7 h-7 rounded-full text-white items-center justify-center text-sm flex -mr-1 bg-gray-400"
                >
                  <MyUserInfo user={m} />
                </div>
              ))}
            </div>
          </td>

          <td className="py-2 font-thin pr-3 hidden lg:flex lg:items-center lg:justify-center lg:gap-1">
            <span className="text-center">
              {moment(notification.createdAt).fromNow()}
            </span>
          </td>
        </tr>
      </>
    );
  };

  return loading ? (
    <div>
      <Loading />
    </div>
  ) : (
    <>
      <div className="w-full bg-white rounded shadow-lg mb-8">
        <div className="flex items-center justify-between px-2 py-2">
          <AdminPagetitle title="Notifications Log" />
        </div>
      </div>

      <div className="w-full bg-white px-2 md:px-4 pt-4 pb-4 shadow-lg rounded">
        <table className="w-full mb-5">
          <MyTableHeaderNotif />
          <tbody className="">
            {sortedNotifications && sortedNotifications.length > 0 ? (
              sortedNotifications.map((notification, index) => (
                <MyTableRowNotifs
                  key={notification._id + index}
                  notification={notification}
                />
              ))
            ) : (
              <>
                <tr>
                  <td colSpan="5" className="text-center py-4 text-lg">
                    No notification available.
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      <div>{error && <p className="text-red-500">{error}</p>}</div>
    </>
  );
};

export default AdminNotificationsLog;
