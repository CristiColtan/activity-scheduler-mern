import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { DialogTitle } from "@headlessui/react";
import { toast } from "react-toastify";

import MyModal from "../MyModal.jsx";
import Loading from "../Loading.jsx";

import { updateUserSuccess } from "../../redux/user/userSlice.js";

const DialogSetUp2Fa = ({ open, setOpen }) => {
  const dispatch = useDispatch();

  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [error, setError] = useState(null);

  const [code, setCode] = useState("");

  const handleChange = (e) => {
    setCode(e.target.value);
  };

  const handleCancel = () => {
    setOpen(false);
    setQRCode("");
    setError(null);
  };

  const [QRCode, setQRCode] = useState("");
  const [secret, setSecret] = useState("");

  const [verified, setVerified] = useState(false);

  const generateQR = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:8081/backend/mfa/generate-qr/${currentUser._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success === false) {
        setError(data.message);
        setLoading(false);
        return;
      }

      setQRCode(data.qr_code);
      setSecret(data.secret);
      setLoading(false);
      setError(null);
      dispatch(updateUserSuccess(data.user));
    } catch (error) {
      console.log(error.message);
      setError(error.message);
      setLoading(false);
      return;
    }
  };

  const verifyMFA = async () => {
    try {
      setLoadingVerify(true);

      const res = await fetch(
        `http://localhost:8081/backend/mfa/first-verify-totp/${currentUser._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ token: code }), //6 digit from user
        }
      );

      const data = await res.json();

      if (data.success === false) {
        setError(data.message);
        setLoadingVerify(false);
        return;
      }

      setVerified(true);
      setLoadingVerify(false);
      setError(null);

      toast.success("2FA has been successfully ENABLED!", {
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
      setLoadingVerify(false);
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
          SET UP 2FA
        </DialogTitle>

        {error && <span className="text-red-500">{error}</span>}

        <div className="mt-2 flex flex-col gap-10">
          <div className="w-full flex flex-col gap-1">
            <label htmlFor="hours" className="font-normal text-base">
              Scan the following QR code with your 2FA app:
            </label>
          </div>

          {QRCode ? (
            <div className="flex justify-center items-center w-full">
              <img src={QRCode} size={400} />
            </div>
          ) : loading ? (
            <Loading />
          ) : (
            <div className="w-full flex justify-center items-center gap-4">
              <button
                onClick={() => generateQR()}
                className="px-3 py-1 rounded w-1/2
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium disabled:bg-blue-500"
              >
                Generate QR
              </button>
            </div>
          )}

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
              onClick={() => verifyMFA()}
              disabled={loadingVerify}
              className="px-3 py-1 rounded w-1/2
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium disabled:bg-blue-500"
            >
              {loadingVerify ? "Submitting" : "Submit"}
            </button>
          </div>
        </div>
      </MyModal>
    </>
  );
};

export default DialogSetUp2Fa;
