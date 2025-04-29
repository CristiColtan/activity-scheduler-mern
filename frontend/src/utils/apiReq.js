import { toast } from "react-toastify";
import { proxy } from "./deployment.js";

export const refreshAccessToken = async () => {
  try {
    const res = await fetch(`${proxy}/backend/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();

    if (data.success === false) throw new Error(`${data.message}`);

    return data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};

export const apiRequest = async (url, options = {}) => {
  let response = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (response.status === 418) {
    try {
      const success = await refreshAccessToken();

      if (success) {
        response = await fetch(url, {
          ...options,
          credentials: "include",
        });
      } else {
        toast.error("Please log in again!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
        return;
      }
    } catch (error) {
      toast.error(`${error}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
      return;
    }
  }

  return response;
};
