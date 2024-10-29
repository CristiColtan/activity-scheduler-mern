import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import PageTitle from '../components/PageTitle'
import TaskAddUserList from '../components/TaskAddUserList'
import TaskSelectList from '../components/TaskSelectList'

import { task_list_stage } from "../utils/tableImports.js"
import { task_list_priority } from "../utils/tableImports.js"

import { IoMdImages } from "react-icons/io";

import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import {app} from "../utils/firebase.js"

const CreateTask = () => {
    const [files, setFiles] = useState([]);
    const [team, setTeam] = useState([]);
    const [stage, setStage] = useState(task_list_stage[0] || []);
    const [priority, setPriority] = useState(task_list_priority[1] || []);
    const [allUsers, setAllUsers] = useState([]);

    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);

    const [Error, setError] = useState(null);
    const [imageUploadError, setImageUploadError] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        date: "",
        priority: "normal",
        stage: "todo",
        activities: [],
        subtasks: [],
        asseturls: [],
        team: [],
        is_trashed: "No",
        created_by: null
    });

    console.log(formData);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            let res;

            if (currentUser.is_team_manager === "Yes") {
                res = await fetch("http://localhost:8081/backend/team-manager/get/my-team", {
                    credentials: "include",
                });
            }
            else if (currentUser.is_admin === "Yes") {
                res = await fetch("http://localhost:8081/backend/admin/get/all-users", {
                    credentials: "include",
                });
            }

            const data = await res.json();
            setAllUsers(data);
            setLoading(false);
        } catch (error) {
            console.log(error.message);
            setError(error);
            setLoading(false);
            return;
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    console.log(files);
    console.log(team);
    console.log(stage);
    console.log(priority);
    console.log(allUsers);

    const handleImageSubmit = (e) => {
        if (files.length > 0 && files.length + formData.asseturls.length < 7) {
            setUploading(true);
            setImageUploadError(null);

            const promises = [];
            for (let i = 0; i < files.length; i++) {
                promises.push(storeImage(files[i]));
            }

            Promise.all(promises).then((urls) => {
                setFormData({
                    ...formData, asseturls: formData.asseturls.concat(urls),
                });

                setImageUploadError(null);
                setUploading(false);
            })
                .catch((err) => {
                    setImageUploadError(err + "Image upload failed! (2MB MAX/image)");
                    setUploading(false);
                })
        } else {
            setImageUploadError("You can upload maximum 6 assets!");
            setUploading(false);
        }
    }

    const storeImage = async (file) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage(app);
            const fileName = new Date().getTime() + file.name;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on("state_changed", (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
            }, (error) => {
                reject(error);
            }, () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                })
            })
        })
    }
    
    const handleRemoveImage = (index) => {
        setFormData({ ...formData, asseturls: formData.asseturls.filter((_, i) => i !== index), });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (team.length < 1)
                return setError("You must assign at least one member!");

            setLoading(true);
            setError(null);

            formData.created_by = currentUser._id;
            formData.priority = priority.toLowerCase();
            formData.stage = stage.toLowerCase();
            formData.team = team;

            const res = await fetch("http://localhost:8081/backend/task/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(formData),
            })

            const data = await res.json();
            setLoading(false);
            navigate(`/task/${data._id}`)
            
        } catch (error) {
            console.log(error.message);
            setError(error);
            setLoading(false);
            return;
        }
    }

    return (
        <div className='w-full bg-white h-fit px-2 md:px-6 py-2 shadow-lg rounded mb-8'>
            <PageTitle title="Create Task" />
            <br></br>
            <div className="w-full flex flex-col md:flex-row gap-12 2xl:gap-8 overflow-y-auto px-2 py-2">
                <div className='w-full md:w-1/2 flex flex-col justify-center md:justify-start'>
                    <input type="text" placeholder='Task Title' required id="title" onChange={handleChange}
                        className='border py-1 px-2 placeholder-black focus:ring-2 ring-blue-300 outline-none
                    border-black focus:placeholder-gray-500 rounded min-w-[300px] md:min-w-[250px] mb-5'>
                    </input>
                    <label htmlFor='username' className='font-thin text-base mb-2'>Assign Task to:</label>
                    <TaskAddUserList setTeam={setTeam} team={team} data={allUsers} />
                    <div className='flex gap-4 mt-5'>
                        <div className='w-full'>{/*left*/}
                            <label className='font-thin text-base mb-2'>Task Stage:</label>
                            <TaskSelectList lists={task_list_stage} selected={stage} setSelected={setStage} />
                        </div>
                        <div className='w-full'>{/*right*/}
                            <label className='font-thin text-base mb-2'>Priority:</label>
                            <TaskSelectList lists={task_list_priority} selected={priority} setSelected={setPriority} />
                        </div>
                    </div>
                    <div className='flex gap-4 mt-5'>
                        <div className='w-full'>
                            <label className='font-thin text-base mb-2'>Task Date:</label>
                            <input type="date" required id='date' onChange={handleChange}
                                className='border py-1 px-2 placeholder-black focus:ring-2 ring-blue-300 outline-none
                            border-black focus:placeholder-gray-500 rounded mb-5 mt-1 w-full'>
                            </input>
                        </div>
                        <div className='w-full flex items-center justify-center'>
                            <label className='flex items-center gap-1 text-base cursor-pointer hover:text-blue-500 mt-1'>
                                <input type='file' multiple id='imgUpload' className='hidden' accept='image/*'
                                    onChange={(e) => setFiles(e.target.files)}></input>
                                <IoMdImages className='text-lg' />
                                <span className='pl-2'>Add Assets</span>
                            </label>
                        </div>
                    </div>
                    <div className='w-full mt-5 gap-4 flex'>
                        <div className='w-full'>
                            <p className='font-sans text-lg'>{files.length} Assets</p>
                        </div>
                        <div className='w-full flex justify-between gap-4'>
                            <button disabled={uploading}
                                className='px-3 py-2 rounded
                                bg-blue-700 text-white font-sans w-1/2
                                hover:bg-blue-500 transition duration-200
                                font-medium disabled:bg-blue-500'
                                onClick={handleImageSubmit}>
                                {uploading ? "Uploading..." : "Upload"}
                            </button>
                            <button disabled={uploading || loading}
                                className='px-3 py-2 rounded w-1/2
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium disabled:bg-blue-500'
                                onClick={handleSubmit}>
                                {loading ? "Submitting..." : "Submit"}
                            </button>
                        </div>
                    </div>
                </div>
                <div className='w-full md:w-1/2 flex flex-col justify-center md:justify-start'>
                    {formData.asseturls.length > 0 && formData.asseturls.map((url, index) => (
                        <div key={index} className='w-full flex justify-center items-center gap-10 mb-5'>
                            <img src={url} alt='Asset image'
                                className='w-1/2 rounded h-28 md:h-36 2xl:h-52 cursor-pointer
                                transition-all duration-500 hover:scale-110 hover:z-50 border-black border-2'>
                            </img>
                            <button className='px-6 py-2 rounded 
                                bg-red-500 text-white font-sans
                                hover:bg-red-300 transition duration-200
                                font-medium' onClick={() => handleRemoveImage(index)}>
                                Delete
                            </button>
                        </div>
                    ))}
                    <br></br>
                    <br></br>
                    {imageUploadError && <p className='text-red-500'>{imageUploadError}</p>}
                </div>
            </div>
            {Error && <p className='text-red-500'>{Error}</p>}
        </div>
    )
}

export default CreateTask