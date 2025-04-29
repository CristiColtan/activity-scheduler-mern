import React, { useState } from "react";

import { DialogTitle } from "@headlessui/react";

import MyModal from "../MyModal";

import { proxy } from "../../utils/deployment.js";
import { apiRequest } from "../../utils/apiReq.js";

const AdminDialogEditUser = ({
  open,
  setOpen,
  userData,
  allUsers,
  setAllUsers,
}) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleCancel = () => {
    setOpen(false);
  };

  console.log("AllUsers-DialogEdit-FormData", formData);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.first_name === "") delete formData.first_name;
    if (formData.last_name === "") delete formData.last_name;
    if (formData.email === "") delete formData.email;
    if (formData.username === "") delete formData.username;
    if (formData.city === "") delete formData.city;
    if (formData.gender === "") delete formData.gender;

    try {
      setLoading(true);

      const res = await apiRequest(
        `${proxy}/backend/admin/edit/user-fetch-users/${userData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res) return;

      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        setLoading(false);
        return;
      }

      setAllUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === data._id ? data : user))
      );
      setLoading(false);
      handleCancel();
      setFormData({});
    } catch (error) {
      console.error(error.message);
      setLoading(false);
      return;
    }
  };

  return (
    <>
      <MyModal open={open} setOpen={setOpen}>
        <DialogTitle
          as="h2"
          className="text-base font-semibold leading-6 text-black mb-4 pl-0"
        >
          UPDATE PROFILE
        </DialogTitle>

        <div className="mt-2 flex flex-col gap-6">
          <div className="flex flex-row gap-5">
            <div className="w-full flex flex-col gap-1">
              <label htmlFor="first_name" className="font-normal text-base">
                First Name:
              </label>
              <input
                type="text"
                id="first_name"
                onChange={handleChange}
                value={formData.first_name}
                className="bg-transparent px-3 py-0.5
                                    border border-gray-400 placeholder-gray-500
                                  text-gray-900 outline-none text-base w-full
                                    focus:ring-2 ring-blue-300 rounded"
                placeholder={userData?.first_name}
              ></input>
            </div>
            <div className="w-full flex flex-col gap-1">
              <label htmlFor="last_name" className="font-normal text-base">
                Last Name:
              </label>
              <input
                type="text"
                id="last_name"
                onChange={handleChange}
                value={formData.last_name}
                className="bg-transparent px-3 py-0.5
                                    border border-gray-400 placeholder-gray-500
                                  text-gray-900 outline-none text-base w-full
                                    focus:ring-2 ring-blue-300 rounded"
                placeholder={userData?.last_name}
              ></input>
            </div>
          </div>

          <div className="flex flex-row gap-5">
            <div className="w-full flex flex-col gap-1">
              <label htmlFor="username" className="font-normal text-base">
                Username:
              </label>
              <input
                type="text"
                id="username"
                onChange={handleChange}
                className="bg-transparent px-3 py-0.5
                                    border border-gray-400 placeholder-gray-500
                                  text-gray-900 outline-none text-base w-full
                                    focus:ring-2 ring-blue-300 rounded"
                placeholder={userData?.username}
              ></input>
            </div>
            <div className="w-full flex flex-col gap-1">
              <label htmlFor="email" className="font-normal text-base">
                E-mail:
              </label>
              <input
                type="text"
                id="email"
                onChange={handleChange}
                className="bg-transparent px-3 py-0.5
                                    border border-gray-400 placeholder-gray-500
                                  text-gray-900 outline-none text-base w-full
                                    focus:ring-2 ring-blue-300 rounded"
                placeholder={userData?.email}
              ></input>
            </div>
          </div>

          <div className="flex flex-row gap-5">
            <div className="w-full flex flex-col gap-1">
              <label htmlFor="city" className="font-normal text-base">
                City:
              </label>
              <input
                type="text"
                id="city"
                onChange={handleChange}
                className="bg-transparent px-3 py-0.5
                                    border border-gray-400 placeholder-gray-500
                                  text-gray-900 outline-none text-base w-full
                                    focus:ring-2 ring-blue-300 rounded"
                placeholder={userData?.city}
              ></input>
            </div>
            <div className="w-full flex flex-col gap-1">
              <label htmlFor="gender" className="font-normal text-base">
                Gender:
              </label>
              <input
                type="text"
                id="gender"
                onChange={handleChange}
                className="bg-transparent px-3 py-0.5
                                    border border-gray-400 placeholder-gray-500
                                  text-gray-900 outline-none text-base w-full
                                    focus:ring-2 ring-blue-300 rounded"
                placeholder={userData?.gender}
              ></input>
            </div>
          </div>
        </div>

        <br></br>
        <br></br>

        <div className="w-full -mt-2 gap-4 flex">
          <div className="w-full">{/* blank */}</div>

          <div className="w-full flex justify-between gap-4">
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1 rounded
                                bg-white text-black font-sans w-1/2
                                hover:bg-gray-300 transition duration-200
                                font-medium disabled:bg-gray-300
                                border-2 border-gray-400"
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 rounded w-1/2
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium disabled:bg-blue-500"
              onClick={handleSubmit}
            >
              {loading ? "Submitting" : "Submit"}
            </button>
          </div>
        </div>
      </MyModal>
    </>
  );
};

export default AdminDialogEditUser;
