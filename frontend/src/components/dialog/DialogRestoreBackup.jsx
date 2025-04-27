import React, { useState } from "react";
import { DialogTitle } from "@headlessui/react";
import { toast } from "react-toastify";

import { FaQuestion } from "react-icons/fa";

import MyModal from "../MyModal.jsx";

import { apiRequest } from "../../utils/apiReq.js";

const DialogRestoreBackup = ({ open, setOpen, filenameData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log("FILENAME SELECTED: ", filenameData);

  const handleCancel = () => {
    setOpen(false);
  };

  const restoreBackup = async () => {
    try {
      setLoading(true);

      const res = await apiRequest(
        `http://localhost:8081/backend/utils/restore-backup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filename: filenameData }),
        }
      );

      if (!res) return;

      const data = await res.json();

      if (data.success === false) {
        console.log(data.message);
        setError(data.message);
        return;
      }

      setLoading(false);
      setError(null);
      toast.success("You restored a backup successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      handleCancel();
    } catch (error) {
      console.log(error.message);
      setError(error.message);
      setLoading(null);
      return;
    }
  };

  return (
    <>
      <MyModal open={open} setOpen={setOpen}>
        <div className="py-4 w-full flex flex-col gap-4 items-center justify-center">
          <DialogTitle as="h3">
            <p className="p-3 rounded-full text-blue-600 bg-blue-200">
              <FaQuestion className="text-5xl" />
            </p>
          </DialogTitle>

          {error && <p className="text-red-600 font-semibold">{error}</p>}

          {filenameData && (
            <p className="text-center text-black mt-1 font-serif md:text-lg text-base">
              Are you sure you want to restore{" "}
              <span className="font-bold">{filenameData}</span> ?
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
              className="px-6 py-2 rounded mr-5 font-sans font-semibold text-white bg-blue-600
            hover:bg-blue-400"
              onClick={() => restoreBackup()}
            >
              {loading ? "Restoring..." : "Restore"}
            </button>
          </div>
        </div>
      </MyModal>
    </>
  );
};

export default DialogRestoreBackup;
