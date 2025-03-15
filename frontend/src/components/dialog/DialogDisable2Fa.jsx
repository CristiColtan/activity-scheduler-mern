import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { DialogTitle } from "@headlessui/react";
import { toast } from "react-toastify";

import MyModal from "../MyModal.jsx";
import Loading from "../Loading.jsx";

import { updateUserSuccess } from "../../redux/user/userSlice.js";

const DialogDisable2Fa = ({ open, setOpen }) => {
  const dispatch = useDispatch();

  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [code, setCode] = useState("");

  const handleChange = (e) => {
    setCode(e.target.value);
  };

  const handleCancel = () => {
    setOpen(false);
    setError(null);
  };

  const handleDisable = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:8081/backend/mfa/disable-totp/${currentUser._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ token: code }),
        }
      );

      const data = await res.json();

      if (data.success === false) {
        setError(data.message);
        setLoading(false);
        return;
      }

      setLoading(false);
      setError(null);

      toast.success("2FA has been successfully DISABLED!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });

      dispatch(updateUserSuccess(data));

      setOpen(false);
    } catch (error) {
      console.log(error.message);
      setError(error.message);
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
          DISABLE 2FA
        </DialogTitle>

        {error && <span className="text-red-500">{error}</span>}

        <div className="mt-4 flex flex-col gap-10">
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="hours" className="font-normal text-base">
              Please enter the 6-digit code from your 2FA app:
            </label>
            <input
              type="text"
              id="code"
              onChange={handleChange}
              value={code}
              className="bg-transparent px-3 py-0.5
                                    border border-gray-400 placeholder-gray-500
                                  text-gray-900 outline-none text-base w-full
                                    focus:ring-2 ring-blue-300 rounded"
              placeholder={"Type here..."}
            ></input>
          </div>
        </div>

        <br></br>
        <br></br>

        <div className="w-full -mt-2 gap-4 flex">
          <div className="w-full">{/* blank */}</div>

          <div className="w-full flex justify-between gap-4">
            <button
              onClick={handleCancel}
              className="px-3 py-1 rounded
                                bg-white text-black font-sans w-1/2
                                hover:bg-gray-300 transition duration-200
                                font-medium disabled:bg-gray-300
                                border-2 border-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDisable()}
              disabled={loading}
              className="px-3 py-1 rounded w-1/2
                                bg-red-700 text-white font-sans
                                hover:bg-red-500 transition duration-200
                                font-medium disabled:bg-red-500"
            >
              {loading ? "Disabling..." : "Disable"}
            </button>
          </div>
        </div>
      </MyModal>
    </>
  );
};

export default DialogDisable2Fa;
