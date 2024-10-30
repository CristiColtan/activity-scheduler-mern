import React, { useState, Fragment, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx'
import moment from "moment"
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import PageTitle from '../components/PageTitle.jsx';
import Loading from "../components/Loading.jsx";
import TabsProfile from "../components/TabsProfile.jsx";
import { getInitials } from '../utils/FullnameInitials.js';

import { ImProfile } from "react-icons/im";
import { MdRoomPreferences } from "react-icons/md";
import { CiEdit } from "react-icons/ci";

import { updateUserStart, updateUserFailure, updateUserSuccess } from "../redux/user/userSlice.js" 

const tabs = [{
  title: "Personal Details",
  icon: <ImProfile className='text-lg' size={20} />
},
{
  title: "Preferences",
  icon: <MdRoomPreferences className='text-lg' size={20} />
  
}];

const Profile = () => {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [errorProfile, setErrorProfile] = useState(null);

  const [selected, setSelected] = useState(0);
  const [formData, setFormData] = useState({});

  const [editableFields, setEditableFields] = useState({
    first_name: false,
    last_name: false,
    username: false,
    email: false,
    title: false,
    role: false,
    gender: false,
    city: false,
    //...
  });
  
  const handleEditToggle = (field) => {
    setEditableFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  console.log("FormData", formData);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.first_name === "") delete formData.first_name;
    if (formData.last_name === "") delete formData.last_name;
    if (formData.email === "") delete formData.email;
    if (formData.username === "") delete formData.username;
    if (formData.title === "") formData.title = "Unknown";
    if (formData.role === "") formData.role = "Unknown";
    if (formData.city === "") formData.city = "Unknown";
    if (formData.gender === "") formData.gender = "Unknown";

    try {
      dispatch(updateUserStart());
      
      const res = await fetch(`http://localhost:8081/backend/normal-user/update-my-profile/${currentUser._id}`, {
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
        dispatch(updateUserFailure(data.message));
        return;
      }
      
      dispatch(updateUserSuccess(data));
    
    } catch (error) {
      console.log(error.message);
      dispatch(updateUserFailure(error.message));
      return;
    }
  }

  //verify !!!
  //e-mail, username, firstname, lastname daca exista si e gol sa il scoti din form data, 
  //title, role, city, gender daca exista si e gol sa fie trecut la Unknown

  return (
    <>
      <div className='w-full flex flex-col gap-3 mb-4 overflow-y-hidden'>
        {loadingProfile ?
          (<div><Loading></Loading></div>) : (
            <>
              {errorProfile ?
                (<p className='text-red-500 text-4xl'>Something went wrong! {errorProfile}</p>) : (
                  <>
                    <div className='pl-1 w-full bg-white h-fit px-2 md:px-6 py-4 shadow-lg rounded mb-8'>
                      <PageTitle title="Account settings" />
                      <p className='font-serif'>Manage your CC Task experience</p>
                    </div>
                    <TabsProfile tabs={tabs} setSelected={setSelected}>
                      {
                        selected === 0 && (
                          <>
                            <p className='font-serif text-2xl'>Personal Details</p>
                            <p className='font-thin border-b-2 mb-4'>Update your info and find out how it's used</p>
                            
                            <div className='flex items-center justify-center border-t-2 flex-col mr-2'>
                              <div className='mt-2 w-16 h-16 rounded-full font-semibold text-2xl bg-blue-600 flex items-center justify-center text-white'>
                                <span className='text-center -mt-1'>{getInitials(currentUser?.first_name, currentUser?.last_name)}</span>
                              </div>

                              {/* 3 sections First Name */}
                              <div className='w-full grid grid-cols-3 gap-5 2xl:gap-8 overflow-y-auto border-t-2 mt-2'>
                                {/* left */}
                                <div className='space-y-6 p-4 bg-white shadow-lg text-center'>
                                  <span className='font-serif md:text-lg text-base'>First Name:</span>
                                </div>

                                {/* middle */}
                                <div className='space-y-6 p-4 bg-white shadow-lg text-center'>
                                  <input type="text" placeholder={currentUser.first_name} required id="first_name" onChange={handleChange}
                                    value={formData.first_name || ''} disabled={!editableFields.first_name}
                                    className='border py-1 px-2 w-full placeholder-black focus:ring-2 ring-blue-300 outline-none
                                            border-black focus:placeholder-gray-500 rounded justify-center disabled:cursor-not-allowed'>
                                  </input>
                                </div>

                                {/* right */}
                                <div className='space-y-6 p-4 bg-white shadow-lg  text-center'>
                                  <button className={clsx('text-blue-700 hover:text-blue-400 inline-flex items-center disabled:cursor-not-allowed disabled:text-blue-500 border-gray-500 translate-y-1',
                                    { 'text-blue-400 shadow-xl border border-gray-200 rounded': editableFields.first_name }
                                  )}
                                    onClick={() => handleEditToggle("first_name")}>
                                    {<CiEdit className='text-lg' size={26} />}
                                  </button>
                                </div>
                      
                              </div>

                              {/* 3 sections Last Name */}
                              <div className='w-full grid grid-cols-3 gap-5 2xl:gap-8 overflow-y-auto border-t-2 mt-2'>
                                {/* left */}
                                <div className='space-y-6 p-4 bg-white shadow-lg text-center'>
                                  <span className='font-serif md:text-lg text-base'>Last Name:</span>
                                </div>

                                {/* middle */}
                                <div className='space-y-6 p-4 bg-white shadow-lg text-center'>
                                  <input type="text" placeholder={currentUser.last_name} required id="last_name" onChange={handleChange}
                                    value={formData.last_name || ''} disabled={!editableFields.last_name}
                                    className='border py-1 px-2 w-full placeholder-black focus:ring-2 ring-blue-300 outline-none
                                            border-black focus:placeholder-gray-500 rounded justify-center disabled:cursor-not-allowed'>
                                  </input>
                                </div>

                                {/* right */}
                                <div className='space-y-6 p-4 bg-white shadow-lg text-center'>
                                  <button className={clsx('text-blue-700 hover:text-blue-400 inline-flex items-center disabled:cursor-not-allowed disabled:text-blue-500 border-gray-500 translate-y-1',
                                    { 'text-blue-400 shadow-xl border border-gray-200 rounded': editableFields.last_name }
                                  )}
                                    onClick={() => handleEditToggle("last_name")}>
                                    {<CiEdit className='text-lg' size={26} />}
                                  </button>
                                </div>
                      
                              </div>

                              {/* 3 sections Username */}
                              <div className='w-full grid grid-cols-3 gap-5 2xl:gap-8 overflow-y-auto border-t-2 mt-2'>
                                {/* left */}
                                <div className='space-y-6 p-4 bg-white shadow-lg text-center'>
                                  <span className='font-serif md:text-lg text-base'>Username:</span>
                                </div>

                                {/* middle */}
                                <div className='space-y-6 p-4 bg-white shadow-lg text-center'>
                                  <input type="text" placeholder={currentUser.username} required id="username" onChange={handleChange}
                                    value={formData.username || ''} disabled={!editableFields.username}
                                    className='border py-1 px-2 w-full placeholder-black focus:ring-2 ring-blue-300 outline-none
                                            border-black focus:placeholder-gray-500 rounded justify-center disabled:cursor-not-allowed'>
                                  </input>
                                </div>

                                {/* right */}
                                <div className='space-y-6 p-4 bg-white shadow-lg text-center'>
                                  <button className={clsx('text-blue-700 hover:text-blue-400 inline-flex items-center disabled:cursor-not-allowed disabled:text-blue-500 border-gray-500 translate-y-1',
                                    { 'text-blue-400 shadow-xl border border-gray-200 rounded': editableFields.username }
                                  )}
                                    disabled={currentUser.is_admin === "No"}
                                    onClick={() => handleEditToggle("username")}
                                  >
                                    {<CiEdit className='text-lg' size={26} />}
                                  </button>
                                </div>
                      
                              </div>

                              {/* 3 sections E-mail */}
                              <div className='w-full grid grid-cols-3 gap-5 2xl:gap-8 overflow-y-auto border-t-2 mt-2'>
                                {/* left */}
                                <div className='space-y-6 p-4 bg-white shadow-lg text-center'>
                                  <span className='font-serif md:text-lg text-base'>E-mail:</span>
                                </div>

                                {/* middle */}
                                <div className='space-y-6 p-4 bg-white shadow-lg text-center'>
                                  <input type="text" placeholder={currentUser.email} required id="email" onChange={handleChange}
                                    value={formData.email || ''} disabled={!editableFields.email}
                                    className='border py-1 px-2 w-full placeholder-black focus:ring-2 ring-blue-300 outline-none
                                            border-black focus:placeholder-gray-500 rounded justify-center disabled:cursor-not-allowed'>
                                  </input>
                                </div>

                                {/* right */}
                                <div className='space-y-6 p-4 bg-white shadow-lg text-center'>
                                  <button className={clsx('text-blue-700 hover:text-blue-400 inline-flex items-center disabled:cursor-not-allowed disabled:text-blue-500 border-gray-500 translate-y-1',
                                    { 'text-blue-400 shadow-xl border border-gray-200 rounded': editableFields.email }
                                  )}
                                    onClick={() => handleEditToggle("email")}
                                    disabled={currentUser.is_admin === "No"}
                                  >
                                    {<CiEdit className='text-lg' size={26} />}
                                  </button>
                                </div>
                      
                              </div>

                              {/* 3 sections Title */}
                              <div className='w-full grid grid-cols-3 gap-5 2xl:gap-8 overflow-y-auto border-t-2 mt-2'>
                                {/* left */}
                                <div className='space-y-6 p-4 bg-white shadow-lg text-center'>
                                  <span className='font-serif md:text-lg text-base'>Title:</span>
                                </div>

                                {/* middle */}
                                <div className='space-y-6 p-4 bg-white shadow-lg text-center'>
                                  <input type="text" placeholder={currentUser.title} required id="title" onChange={handleChange}
                                    value={formData.title || ''} disabled={!editableFields.title}
                                    className='border py-1 px-2 w-full placeholder-black focus:ring-2 ring-blue-300 outline-none
                                            border-black focus:placeholder-gray-500 rounded justify-center disabled:cursor-not-allowed'>
                                  </input>
                                </div>

                                {/* right */}
                                <div className='space-y-6 p-4 bg-white shadow-lg  text-center'>
                                  <button className={clsx('text-blue-700 hover:text-blue-400 inline-flex items-center disabled:cursor-not-allowed disabled:text-blue-400 border-gray-500 translate-y-1',
                                    { 'text-blue-400 shadow-xl border border-gray-200 rounded': editableFields.title }
                                  )}
                                    disabled={currentUser.is_admin === "No"}
                                    onClick={() => handleEditToggle("title")}>
                                    {<CiEdit className='text-lg' size={26} />}
                                  </button>
                                </div>
                      
                              </div>

                              {/* 3 sections Role */}
                              <div className='w-full grid grid-cols-3 gap-5 2xl:gap-8 overflow-y-auto border-t-2 mt-2'>
                                {/* left */}
                                <div className='space-y-6 p-4 bg-white shadow-lg text-center'>
                                  <span className='font-serif md:text-lg text-base'>Role:</span>
                                </div>

                                {/* middle */}
                                <div className='space-y-6 p-4 bg-white shadow-lg text-center'>
                                  <input type="text" placeholder={currentUser.role} required id="role" onChange={handleChange}
                                    value={formData.role || ''} disabled={!editableFields.role}
                                    className='border py-1 px-2 w-full placeholder-black focus:ring-2 ring-blue-300 outline-none
                                            border-black focus:placeholder-gray-500 rounded justify-center disabled:cursor-not-allowed'>
                                  </input>
                                </div>

                                {/* right */}
                                <div className='space-y-6 p-4 bg-white shadow-lg  text-center'>
                                  <button className={clsx('text-blue-700 hover:text-blue-400 inline-flex items-center disabled:cursor-not-allowed disabled:text-blue-400 border-gray-500 translate-y-1',
                                    { 'text-blue-400 shadow-xl border border-gray-200 rounded': editableFields.role }
                                  )}
                                    disabled={currentUser.is_admin === "No"}
                                    onClick={() => handleEditToggle("role")}>
                                    {<CiEdit className='text-lg' size={26} />}
                                  </button>
                                </div>
                      
                              </div>

                              {/* 3 sections Gender */}
                              <div className='w-full grid grid-cols-3 gap-5 2xl:gap-8 overflow-y-auto border-t-2 mt-2'>
                                {/* left */}
                                <div className='space-y-6 p-4 bg-white shadow-lg text-center'>
                                  <span className='font-serif md:text-lg text-base'>Gender:</span>
                                </div>

                                {/* middle */}
                                <div className='space-y-6 p-4 bg-white shadow-lg text-center'>
                                  <input type="text" placeholder={currentUser.gender} required id="gender" onChange={handleChange}
                                    value={formData.gender || ''} disabled={!editableFields.gender}
                                    className='border py-1 px-2 w-full placeholder-black focus:ring-2 ring-blue-300 outline-none
                                            border-black focus:placeholder-gray-500 rounded justify-center disabled:cursor-not-allowed'>
                                  </input>
                                </div>

                                {/* right */}
                                <div className='space-y-6 p-4 bg-white shadow-lg  text-center'>
                                  <button className={clsx('text-blue-700 hover:text-blue-400 inline-flex items-center disabled:cursor-not-allowed disabled:text-blue-400 border-gray-500 translate-y-1',
                                    { 'text-blue-400 shadow-xl border border-gray-200 rounded': editableFields.gender }
                                  )}
                                    onClick={() => handleEditToggle("gender")}>
                                    {<CiEdit className='text-lg' size={26} />}
                                  </button>
                                </div>
                      
                              </div>

                              {/* 3 sections City */}
                              <div className='w-full grid grid-cols-3 gap-5 2xl:gap-8 overflow-y-auto border-t-2 mt-2'>
                                {/* left */}
                                <div className='space-y-6 p-4 bg-white shadow-lg text-center'>
                                  <span className='font-serif md:text-lg text-base'>City:</span>
                                </div>

                                {/* middle */}
                                <div className='space-y-6 p-4 bg-white shadow-lg text-center'>
                                  <input type="text" placeholder={currentUser.city} required id="city" onChange={handleChange}
                                    value={formData.city || ''} disabled={!editableFields.city}
                                    className='border py-1 px-2 w-full placeholder-black focus:ring-2 ring-blue-300 outline-none
                                            border-black focus:placeholder-gray-500 rounded justify-center disabled:cursor-not-allowed'>
                                  </input>
                                </div>

                                {/* right */}
                                <div className='space-y-6 p-4 bg-white shadow-lg  text-center'>
                                  <button className={clsx('text-blue-700 hover:text-blue-400 inline-flex items-center disabled:cursor-not-allowed disabled:text-blue-400 border-gray-500 translate-y-1',
                                    { 'text-blue-400 shadow-xl border border-gray-200 rounded': editableFields.city }
                                  )}
                                    onClick={() => handleEditToggle("city")}>
                                    {<CiEdit className='text-lg' size={26} />}
                                  </button>
                                </div>
                      
                              </div>

                              {/* 3 sections Submit */}
                              <div className='w-full grid grid-cols-3 gap-5 2xl:gap-8 overflow-y-auto  mt-2'>
                                {/* left */}
                                <div className='space-y-6 p-4 text-center'>
                                </div>

                                {/* middle */}
                                <div className='space-y-6 p-4 text-center'>
                                </div>

                                {/* right */}
                                <div className='space-y-6 p-4 bg-white text-center'>
                                  <button className='bg-blue-600 hover:bg-blue-400 inline-flex items-center disabled:cursor-not-allowed 
                                  disabled:bg-blue-400 border px-5 py-2.5 translate-y-1 text-white rounded font-sans font-medium'
                                    disabled={loading === true}
                                    onClick={handleSubmit}>
                                    {loading ? "Submitting..." : "Submit"}
                                  </button>
                                </div>
                      
                              </div>

                            </div>
                            {error &&
                              (<p className='text-red-500 text-4xl'>Something went wrong! {error}</p>)}
                          </>
                        )
                      }
                      {selected === 1 && (
                        <div className='flex items-center justify-center'>
                          bbb
                        </div>
                      )}
                    </TabsProfile>
                    <div className='w-full flex flex-col md:flex-row gap-5 2xl:gap-8 overflow-y-auto'>
                      {/*left */}
                      <div className='w-full md:w-1/2 space-y-6'>
                        <div className='flex items-center gap-5'>
                          
                        </div>
                      </div>
                      {/*right */}
                    </div>
                  </>
                )
              }
            </>
          )}
      </div>
    </>
  )
}

export default Profile