import React, { useState } from "react";
import { DialogTitle } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

import { FaQuestion } from "react-icons/fa";

import MyModal from "../MyModal.jsx";

import { proxy } from "../../utils/deployment.js";
import { apiRequest } from "../../utils/apiReq.js";

const DialogDeleteConfirmTeamMember = ({ open, setOpen, userData }) => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleCancel = () => {
    setOpen(false);
  };

  const handleRemoveFromTeam = async (userID) => {
    try {
      setLoading(true);

      const res = await apiRequest(
        `${proxy}/backend/team-manager/remove/team-member/${userID}`,
        {
          method: "DELETE",
        }
      );

      if (!res) return;

      setLoading(false);
      navigate("/team");
      handleCancel();
    } catch (error) {
      console.error("Eroare removing team-member!");
      setLoading(false);
      return;
    }
  };

  return (
    <>
      <MyModal open={open} setOpen={setOpen}>
        <div className="py-4 w-full flex flex-col gap-4 items-center justify-center">
          <DialogTitle as="h3">
            <p className="p-3 rounded-full text-red-600 bg-red-200">
              <FaQuestion className="text-5xl" />
            </p>
          </DialogTitle>

          {userData && (
            <p className="text-center text-black mt-1 font-serif md:text-lg text-base">
              Are you sure you want to remove{" "}
              <span className="font-bold">{userData.username}</span> 's account
              from your team?
            </p>
          )}

          <div className="py-3 flex justify-between gap-4 bg-white w-auto">
            <button
              className="px-6 py-2 rounded font-sans border-2 border-gray-400 bg-white ml-5
            hover:bg-gray-300 font-semibold"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 rounded mr-5 font-sans font-semibold text-white bg-red-600
            hover:bg-red-400"
              onClick={() => handleRemoveFromTeam(userData._id)}
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </MyModal>
    </>
  );
};

export default DialogDeleteConfirmTeamMember;
