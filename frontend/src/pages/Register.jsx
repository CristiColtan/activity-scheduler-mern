import React, { useState } from "react";
import { useSelector } from "react-redux";

import { MdTask } from "react-icons/md";
import { useNavigate } from "react-router-dom";

import OAuth from "../components/OAuth.jsx";

import { proxy } from "../utils/deployment.js";

import "../styles/Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error2, setError] = useState(null);
  const [formData, setFormData] = useState({});

  const { error } = useSelector((state) => state.user);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const validatePassword = (password) => {
    const pattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return pattern.test(password);
  };

  console.log(formData);

  const handleSubmit = async (event) => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();
      let isValid = true;
      if (formData.password !== formData.confirmpas) {
        isValid = false;
        setError("Passwords not matching!");
      }

      //if (!validatePassword(formData.password)) {
      //  isValid = false;
      //  setError("Password doesn't match the regex!");
      //}

      setValidated(isValid);

      if (isValid === true) {
        console.log("Valid!");
        try {
          setLoading(true);

          const res = await fetch(`${proxy}/backend/auth/signup`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });

          const data = await res.json();
          if (data.success === false) {
            setLoading(false);
            setError(data.message);
            return;
          }

          setLoading(false);
          console.log(data);
          setShowAlert(true);
          setError(null);
          navigate("/login");
        } catch (error) {
          setLoading(false);
          console.error(error);
          setError(error.message);
        }
      } else {
        console.log("Invalid!");
      }

      console.log(error2);
      console.log(validated);
      console.log(showAlert);
    }
  };

  return (
    <div className="min-h-screen py-20 lg:py-24">
      <div className="container mx-auto ">
        <div className="w-10/12 lg:w-8/12 flex lg:flex-row flex-col mx-auto lg:gap-10">
          <div className="lg:w-1/2 w-full flex justify-center items-center text-center flex-col p-12 lg:py-30">
            <h1 className="mb-4 text-3xl lg:text-4xl font-black text-blue-700">
              Welcome!
            </h1>
            <p
              className="flex flex-col gap-0 md:gap-4 text-5xl xl:text-7xl
                            transition-transform duration-500 transform px-6
                            py-2 hover:scale-125 font-bold text-gray-800 font-serif
                            shadow-outer text-shadoww mb-4"
            >
              <span>CCTask</span>
            </p>
            <p className="flex flex-col gap-0 md:gap-4 text-3xl md:text-4xl font-black text-center text-blue-700 mb-4">
              <span>Cloud-Based</span>
              <span>Task Manager</span>
            </p>
            <MdTask className="text-blue-700 text-9xl" />
          </div>
          <div className="lg:w-1/2 w-full py-8 px-12 register-container overflow-hidden rounded-xl bg-white">
            <h2 className="font-serif text-3xl mb-4 text-blue-700">Register</h2>
            <p className="font-thin mb-4 lg:text-lg">
              Create your account. It's free and only takes a minute!
            </p>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-5">
                <input
                  type="text"
                  placeholder="First Name"
                  required
                  onChange={handleChange}
                  id="first_name"
                  className="border py-1 px-2 placeholder-black focus:ring-2 ring-blue-300 outline-none
                    border-black focus:placeholder-gray-500 rounded-lg"
                ></input>
                <input
                  type="text"
                  placeholder="Last Name"
                  required
                  onChange={handleChange}
                  id="last_name"
                  className="border py-1 px-2 placeholder-black focus:ring-2 ring-blue-300 outline-none
                    border-black focus:placeholder-gray-500 rounded-lg"
                ></input>
              </div>
              <div className="mt-5">
                <input
                  type="text"
                  placeholder="Username"
                  required
                  onChange={handleChange}
                  id="username"
                  className="border py-1 px-2 w-full placeholder-black focus:ring-2 ring-blue-300 outline-none
                    border-black focus:placeholder-gray-500 rounded-lg"
                ></input>
              </div>
              <div className="mt-5">
                <input
                  type="text"
                  placeholder="E-mail"
                  required
                  onChange={handleChange}
                  id="email"
                  className="border py-1 px-2 w-full placeholder-black focus:ring-2 ring-blue-300 outline-none
                    border-black focus:placeholder-gray-500 rounded-lg"
                ></input>
              </div>
              <div className="mt-5">
                <input
                  type="password"
                  placeholder="Password"
                  required
                  onChange={handleChange}
                  id="password"
                  className="border py-1 px-2 w-full placeholder-black focus:ring-2 ring-blue-300 outline-none
                    border-black focus:placeholder-gray-500 rounded-lg"
                ></input>
              </div>
              <div className="mt-5">
                <input
                  type="password"
                  placeholder="Confirm password"
                  required
                  onChange={handleChange}
                  id="confirmpas"
                  className="border py-1 px-2 w-full placeholder-black focus:ring-2 ring-blue-300 outline-none
                    border-black focus:placeholder-gray-500 rounded-lg"
                ></input>
              </div>
              <div className="mt-5">
                <input className="" type="checkbox" required></input>
                <span className="font-thin ml-1">
                  I accept the
                  <a className="text-blue-700 font-bold hover:text-blue-500 transition duration-200">
                    {" "}
                    Terms of Use{" "}
                  </a>{" "}
                  &
                  <a className="text-blue-700 font-bold hover:text-blue-500 transition duration-200">
                    {" "}
                    Privacy Policy
                  </a>{" "}
                  terms
                </span>
              </div>
              <div className="mt-5">
                <button
                  type="submit"
                  className="w-full bg-blue-700 px-3 py-2 mb-3.5 text-white font-sans font-medium
                hover:bg-blue-500 transition duration-200 rounded-lg"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Register"}
                </button>
                <OAuth></OAuth>
              </div>
              <p className="mt-5 text-lg font-serif">
                Already have an account?
                <button
                  className="ml-3 text-blue-700 hover:text-blue-500 transition duration-200 font-medium"
                  onClick={handleLoginClick}
                >
                  Login
                </button>
              </p>
              <div>
                {error2 && (
                  <p className="text-red-500 font-base font-sans">{error2}</p>
                )}
              </div>
              <div>
                {error && (
                  <p className="text-red-500 font-base font-sans">
                    Can't sign in with google! {error}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
