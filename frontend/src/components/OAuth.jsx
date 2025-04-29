import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import clsx from "clsx";

import { app } from "../utils/firebase.js";
import { signInSuccess, signInFailure } from "../redux/user/userSlice.js";

import DialogLoginTOTPGoogle from "./dialog/DialogLoginTOTPGoogle.jsx";

import { proxy } from "../utils/deployment.js";

const OAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [openTOTP, setOpenTOTP] = useState(false);
  const [formData, setFormData] = useState({});

  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);

      setFormData({
        name: result.user.displayName,
        email: result.user.email,
      });

      const res = await fetch(`${proxy}/backend/auth/signgoogle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
        }),
      });

      const data = await res.json();

      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }

      if (data.mfa_required === true) {
        setOpenTOTP(true);
      } else {
        dispatch(signInSuccess(data));
        console.log(data);
        navigate("/");
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
      return;
    }
  };

  return (
    <>
      <button
        className={clsx(
          "px-3 py-2 rounded-full font-medium w-full bg-red-700 text-white font-sans hover:bg-red-500 transition duration-200",
          location.pathname === "/login" ? "rounded-full" : "rounded-lg"
        )}
        onClick={handleGoogleClick}
      >
        Continue with google
      </button>
      <DialogLoginTOTPGoogle
        open={openTOTP}
        setOpen={setOpenTOTP}
        formData={formData}
      />
    </>
  );
};

export default OAuth;
