import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { DialogTitle } from "@headlessui/react";
import { toast } from "react-toastify";

import MyModal from "../MyModal.jsx";
import Loading from "../Loading.jsx";

import { proxy } from "../../utils/deployment.js";
import { apiRequest } from "../../utils/apiReq.js";

const DialogResetPassword = ({ open, setOpen }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [code, setCode] = useState("");
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChangeCode = (e) => {
    setCode(e.target.value);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleCancel = () => {
    setOpen(false);
    setFormData({ newPassword: "", confirmPassword: "", oldPassword: "" });
    setCode("");
    setError(null);
  };

  const [validated, setValidated] = useState(false);

  const resetPassword = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      let isValid = true;

      if (formData.newPassword !== formData.confirmPassword) {
        isValid = false;
        setError("Passwords not matching!");

        await apiRequest(`${proxy}/backend/utils/log-client-event`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            level: "warn",
            message: "User entered mismatching passwords in reset form",
          }),
        });
      }

      //regex validation

      setValidated(isValid);
      if (isValid === true) {
        try {
          setLoading(true);

          const body =
            currentUser?.mfa_enabled === "Yes"
              ? { ...formData, token: code }
              : formData;

          const res = await apiRequest(
            `${proxy}/backend/auth/reset-password/${currentUser._id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            }
          );

          if (!res) return;

          const data = await res.json();

          if (data.success === false) {
            setError(data.message);
            setLoading(false);
            return;
          }

          setLoading(false);
          setError(null);

          toast.success("Your password has been successfully UPDATED!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
          });

          setOpen(false);
        } catch (error) {
          console.log(error.message);
          setError(error.message);
          setLoading(false);
          return;
        }
      }
    }
  };

  return (
    <>
      <MyModal open={open} setOpen={setOpen}>
        <DialogTitle
          as="h2"
          className="text-base font-semibold leading-6 text-black mb-4 pl-0"
        >
          RESET PASSWORD
        </DialogTitle>

        {error && <span className="text-red-500">{error}</span>}
        <form onSubmit={resetPassword}>
          <div className="mt-2 flex flex-col gap-5">
            <div className="w-full flex flex-col gap-1">
              <label htmlFor="oldPassword" className="font-normal text-base">
                Introduce your old password:
              </label>
              <input
                required
                type="password"
                id="oldPassword"
                onChange={handleChange}
                value={formData.oldPassword}
                className="bg-transparent px-3 py-0.5
                                    border border-gray-400 placeholder-gray-500
                                  text-gray-900 outline-none text-base w-full
                                    focus:ring-2 ring-blue-300 rounded"
                placeholder={"Type here..."}
              ></input>
            </div>

            <div className="w-full grid grid-cols-2 gap-5">
              <div>
                <label htmlFor="newPassword" className="font-normal text-base">
                  Introduce your new password:
                </label>
                <input
                  required
                  type="password"
                  id="newPassword"
                  onChange={handleChange}
                  value={formData.newPassword}
                  className="bg-transparent px-3 py-0.5
                                    border border-gray-400 placeholder-gray-500
                                  text-gray-900 outline-none text-base w-full
                                    focus:ring-2 ring-blue-300 rounded"
                  placeholder={"Type here..."}
                ></input>
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="font-normal text-base"
                >
                  Confirm your new password:
                </label>
                <input
                  required
                  type="password"
                  id="confirmPassword"
                  onChange={handleChange}
                  value={formData.confirmPassword}
                  className="bg-transparent px-3 py-0.5
                                    border border-gray-400 placeholder-gray-500
                                  text-gray-900 outline-none text-base w-full
                                    focus:ring-2 ring-blue-300 rounded"
                  placeholder={"Type here..."}
                ></input>
              </div>
            </div>

            {currentUser?.mfa_enabled === "Yes" && (
              <div className="w-full flex flex-col gap-1">
                <label htmlFor="oldPassword" className="font-normal text-base">
                  Introduce your two-factor authentication code:
                </label>
                <input
                  type="text"
                  id="code"
                  onChange={handleChangeCode}
                  value={code}
                  className="bg-transparent px-3 py-0.5
                                    border border-gray-400 placeholder-gray-500
                                  text-gray-900 outline-none text-base w-full
                                    focus:ring-2 ring-blue-300 rounded"
                  placeholder={"Type here..."}
                ></input>
              </div>
            )}
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
                type="submit"
                disabled={loading}
                className="px-3 py-1 rounded w-1/2
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium disabled:bg-blue-500"
              >
                {loading ? "Submitting" : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </MyModal>
    </>
  );
};

export default DialogResetPassword;
