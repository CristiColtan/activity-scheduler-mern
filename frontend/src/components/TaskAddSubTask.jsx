import React, { useState } from "react";
import { DialogTitle } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

import MyModal from "./MyModal";

const TaskAddSubTask = ({ open, setOpen, id, subTasks, setSubTasks }) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  console.log("form:", formData);

  const handleSubmit = async (e) => {
    try {
      setLoading(true);
      e.preventDefault();

      const res = await fetch(`http://localhost:8081/backend/task/add-subtask/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success === false) {
        console.log(data.message);
        setError(data.message);
        setLoading(false);
        return;
      }

      setSubTasks(data.subtasks);
      setLoading(false);
      setError(null);
      setOpen(false);
      navigate("/tasks");
    } catch (error) {
      console.log(error.message);
      setError(error.message);
      setLoading(false);
      return;
    }
  }

  return (
    <>
      <MyModal open={open} setOpen={setOpen}>
        <form className="px-5 py-3" onSubmit={handleSubmit}>
          <DialogTitle
            as="h2"
            className="text-base font-semibold leading-6 text-black mb-4 pl-0"
          >
            ADD SUB-TASK
          </DialogTitle>
          <div className="mt-2 flex flex-col gap-6">
            <input
              onChange={handleChange}
              type="text"
              placeholder="Sub-task Title"
              required
              id="title"
              className="border py-1 px-2 placeholder-black focus:ring-2 ring-blue-300 outline-none
                    border-black focus:placeholder-gray-500 rounded min-w-[300px] md:min-w-[250px] mb-5
                    placeholder:pl-2"
            ></input>
            <div className="flex items-center gap-4 -mt-5">
              <div className="w-full">
                <label className="font-thin text-base mb-2 pl-3">
                  Task Date:
                </label>
                <input
                  onChange={handleChange}
                  type="date"
                  required
                  id="date"
                  className="border py-1 px-2 placeholder-black focus:ring-2 ring-blue-300 outline-none       
                            border-black focus:placeholder-gray-500 rounded mb-5 mt-1 w-full"
                ></input>
              </div>
              <div className="w-full">
                <label className="font-thin text-base mb-2 pl-3">Tag:</label>
                <input
                  onChange={handleChange}
                  type="text"
                  required
                  id="tag"
                  className="border py-1 px-2 placeholder-black focus:ring-2 ring-blue-300 outline-none       
                            border-black focus:placeholder-gray-500 rounded mb-5 mt-1 w-full"
                ></input>
              </div>
            </div>
            <div className="w-full -mt-2 gap-4 flex">
              <div className="w-full">
                {/*blank*/}
              </div>

              <div className="w-full flex justify-between gap-4">
                <button onClick={(e) => {
                  e.preventDefault();
                  setOpen(false)
                }}
                  className="px-3 py-2 rounded
                                bg-white text-black font-sans w-1/2
                                hover:bg-gray-300 transition duration-200
                                font-medium disabled:bg-gray-300
                                border-2 border-gray-400"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="px-3 py-2 rounded w-1/2
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium disabled:bg-blue-500"
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </MyModal>
    </>
  );
}

export default TaskAddSubTask;
