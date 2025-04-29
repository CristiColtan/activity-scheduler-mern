import React, { useState } from "react";
import { useSelector } from "react-redux";
import { DialogTitle } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

import MyModal from "./MyModal";

import { proxy } from "../utils/deployment.js";
import { apiRequest } from "../utils/apiReq.js";

const EditUser = ({ open, setOpen, data }) => {
  const [formData, setFormData] = useState({});

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleCancel = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  console.log(formData);

  const { currentUser } = useSelector((state) => state.user);

  const handleEditUser = async (userID) => {
    try {
      setLoading(true);
      let res;

      if (currentUser.is_team_manager === "Yes") {
        res = await apiRequest(
          `${proxy}/backend/team-manager/edit/team-member/${userID}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );
      }
      if (currentUser.is_admin === "Yes") {
        res = await apiRequest(
          `${proxy}/backend/admin/edit/team-manager/${userID}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );
      }

      if (!res) return;

      setLoading(false);
      navigate("/team");
      handleCancel();
    } catch (error) {
      console.error("Eroare edit team-member!");
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
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="title" className="font-normal text-base">
              Title:
            </label>
            <input
              type="text"
              id="title"
              onChange={handleChange}
              className="bg-transparent px-3 py-0.5
                                    border border-gray-400 placeholder-gray-500
                                  text-gray-900 outline-none text-base w-full
                                    focus:ring-2 ring-blue-300 rounded"
              placeholder={data?.title}
            ></input>
          </div>
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="role" className="font-normal text-base">
              Role:
            </label>
            <input
              type="text"
              id="role"
              onChange={handleChange}
              className="bg-transparent px-3 py-0.5
                                    border border-gray-400 placeholder-gray-500
                                  text-gray-900 outline-none text-base w-full
                                    focus:ring-2 ring-blue-300 rounded"
              placeholder={data?.role}
            ></input>
          </div>
        </div>

        <br></br>
        <br></br>

        <div className="w-full -mt-2 gap-4 flex">
          <div className="w-full">{/*blank*/}</div>

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
              onClick={() => handleEditUser(data._id)}
            >
              {loading ? "Submitting" : "Submit"}
            </button>
          </div>
        </div>
      </MyModal>
    </>
  );
};

export default EditUser;
