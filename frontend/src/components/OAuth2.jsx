import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

import { app } from "../utils/firebase.js";
import { signInSuccess, signInFailure } from "../redux/user/userSlice.js";

const OAuth2 = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);
      const res = await fetch("http://localhost:8081/backend/auth/signgoogle", {
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

      dispatch(signInSuccess(data));
      navigate("/");
    } catch (error) {
      console.log("Couldn't sign in with google", error);
    }
  };

  return (
    <button
      className="px-3 py-2 rounded-lg font-medium
      w-full bg-red-700 text-white font-sans
    hover:bg-red-500 transition duration-200"
      onClick={handleGoogleClick}
    >
      Continue with google
    </button>
  );
};

export default OAuth2;
