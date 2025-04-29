import React, { useState } from "react";
import { DialogTitle } from "@headlessui/react";

import { FaQuestion } from "react-icons/fa";

import MyModal from "../MyModal.jsx";

import { proxy } from "../../utils/deployment.js";
import { apiRequest } from "../../utils/apiReq.js";

const DialogDeleteBackup = ({ open, setOpen, setFilenames, filenameData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCancel = () => {
    setOpen(false);
  };

  const deleteBackup = async () => {
    try {
      setLoading(true);

      const res = await apiRequest(`${proxy}/backend/utils/delete-backup`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename: filenameData }),
      });

      if (!res) return;

      const data = await res.json();

      if (data.success === false) {
        console.log(data.message);
        setError(data.message);
        return;
      }

      setLoading(false);
      setError(null);
      setFilenames((prevFilenames) =>
        prevFilenames.filter((f) => f !== filenameData)
      );
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
            <p className="p-3 rounded-full text-red-600 bg-red-200">
              <FaQuestion className="text-5xl" />
            </p>
          </DialogTitle>

          {error && <p className="text-red-600 font-semibold">{error}</p>}

          {filenameData && (
            <p className="text-center text-black mt-1 font-serif md:text-lg text-base">
              Are you sure you want to delete{" "}
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
              className="px-6 py-2 rounded mr-5 font-sans font-semibold text-white bg-red-600
            hover:bg-red-400"
              onClick={() => deleteBackup()}
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </MyModal>
    </>
  );
};

export default DialogDeleteBackup;
