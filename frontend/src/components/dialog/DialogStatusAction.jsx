import React, { useState } from "react";
import { DialogTitle } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

import { FaExclamation } from "react-icons/fa";

import MyModal from "../MyModal";

import { apiRequest } from "../../utils/apiReq.js";

const DialogStatusAction = ({ open, setOpen, userData }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCancel = () => {
    setOpen(false);
  };

  const handleSwitchStatus = async () => {
    try {
      setLoading(true);

      const res = await apiRequest(
        `http://localhost:8081/backend/admin/switch-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ memberID: userData._id }),
        }
      );

      if (!res) return;

      setLoading(false);
      navigate("/team");
      handleCancel();
    } catch (error) {
      console.error("Eroare switch status!");
      setLoading(false);
      return;
    }
  };

  return (
    <>
      <MyModal open={open} setOpen={setOpen}>
        <div className="py-4 w-full flex flex-col gap-4 items-center justify-center">
          <DialogTitle as="h3">
            <p className="p-3 rounded-full text-orange-500 bg-orange-200">
              <FaExclamation className="text-5xl" />
            </p>
          </DialogTitle>

          {userData &&
            (userData.is_active === "Yes" ? (
              <p className="text-center text-black mt-1 font-serif md:text-lg text-base">
                Are you sure you want to make{" "}
                <span className="font-bold">{userData.username}</span> 's
                account inactive?
              </p>
            ) : (
              <p className="text-center text-black mt-1 font-serif md:text-lg text-base">
                Are you sure you want to make{" "}
                <span className="font-bold">{userData.username}</span> 's
                account active?
              </p>
            ))}

          <div className="py-3 flex justify-between gap-4 bg-white w-auto">
            <button
              className="px-6 py-2 rounded font-sans border-2 border-gray-400 bg-white ml-5
            hover:bg-gray-300 font-semibold"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-6 py-2 rounded mr-5 font-sans font-semibold text-white bg-orange-500
            hover:bg-orange-300"
              onClick={handleSwitchStatus}
            >
              {loading ? "Proceeding..." : "Proceed"}
            </button>
          </div>
        </div>
      </MyModal>
    </>
  );
};

export default DialogStatusAction;
