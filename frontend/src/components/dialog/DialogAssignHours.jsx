import React, { useEffect, useState } from "react";

import { DialogTitle } from "@headlessui/react";

import MyModal from "../MyModal";

import { apiRequest } from "../../utils/apiReq.js";

const DialogAssignHours = ({ open, setOpen, taskId, userId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    hours: 0,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const [hours, setHours] = useState(null);
  const [totalHours, setTotalHours] = useState(null);

  const fetchHours = async () => {
    try {
      setLoading(false);

      const res = await apiRequest(
        `http://localhost:8081/backend/normal-user/get-hours/${taskId}`
      );

      if (!res) return;

      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        setLoading(false);
        setError(data.message);
        return;
      }

      setHours(data.hours);
      setTotalHours(data.total_hours);
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
    fetchHours();
  }, [open]);

  const handleCancel = () => {
    setOpen(false);
    setFormData({ hours: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.hours === "") delete formData.hours;
    try {
      setLoading(true);

      const res = await apiRequest(
        "http://localhost:8081/backend/normal-user/assign-hours",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ taskId: taskId, formData: formData }),
        }
      );

      if (!res) return;

      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        setLoading(false);
        setError(data.message);
        return;
      }

      setLoading(false);
      setError(null);
      handleCancel();
    } catch (error) {
      console.error(error.message);
      setLoading(false);
      setError(error.message);
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
          LOG THE HOURS NUMBER YOU WANT TO SPEND TODAY
        </DialogTitle>

        {error && <span className="text-red-500">{error}</span>}

        <div className="mt-2 flex flex-col gap-10">
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="hours" className="font-normal text-base">
              Logged hours:
              <span className="font-thin ml-2 mr-5">
                {hours || "Nothing assigned today."}
              </span>
              Total logged hours:{" "}
              <span className="font-thin ml-1">{totalHours || "0"}</span>
            </label>
            <input
              type="number"
              id="hours"
              onChange={handleChange}
              value={formData.hours}
              className="bg-transparent px-3 py-0.5
                                    border border-gray-400 placeholder-gray-500
                                  text-gray-900 outline-none text-base w-full
                                    focus:ring-2 ring-blue-300 rounded"
              placeholder={hours || "Nothing assigned today."}
            ></input>
          </div>
        </div>

        <br></br>
        <br></br>

        <div className="w-full -mt-2 gap-4 flex">
          <div className="w-full">{/* blank */}</div>

          <div className="w-full flex justify-between gap-4">
            <button
              onClick={() => handleCancel()}
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

export default DialogAssignHours;
