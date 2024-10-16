import React, { useState, Fragment, useEffect } from 'react'
import { useSelector } from 'react-redux';
import clsx from 'clsx'
import moment from "moment"
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { CgDetailsMore } from "react-icons/cg";
import { GoDash } from "react-icons/go";
import { FaBug, FaTasks, FaThumbsUp, FaUser } from "react-icons/fa";
import { GrInProgress } from "react-icons/gr";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
  MdOutlineDoneAll,
  MdOutlineMessage,
  MdTaskAlt,
} from "react-icons/md";
import { RxActivityLog } from "react-icons/rx";
import { FaTrash } from "react-icons/fa";

import { priority_styles, task_type, bgs_task_type, bgs_transparent, text_task_type } from '../utils/tableImports.js';
import {tasks} from "../assets/data.js"

import PageTitle from '../components/PageTitle.jsx';
import Loading from "../components/Loading.jsx"
import Tabs from "../components/Tabs.jsx"
import { getInitials } from '../utils/FullnameInitials.js';

const t_icons = {
    high: <MdKeyboardDoubleArrowUp />,
    medium: <MdKeyboardArrowUp />,
    normal: <GoDash />,
    low: <MdKeyboardArrowDown />,
};
  
const tabs = [
    {
      title: "Task Details",
      icon: <CgDetailsMore className='text-xl' size={24} />
    },
    {
      title: "Activities/Timeline",
      icon: <RxActivityLog className='text-lg' size={20} />
    }
];

const activitiy_types = {
    commented: (
      <div className='w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white'>
        <MdOutlineMessage className='text-xl'/>
      </div>
    ),
    started: (
      <div className='w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white'>
        <FaThumbsUp size={20} />
      </div>
    ),
    assigned: (
      <div className='w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white'>
        <FaUser className='text-xl'/>
      </div>
    ),
    bug: (
      <div className='text-red-600'>
        <FaBug size={24} />
      </div>
    ),
    completed: (
      <div className='w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white'>
        <MdOutlineDoneAll className='text-2xl' />
      </div>
    ),
    "in progress": (
      <div className='w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center text-white'>
        <GrInProgress  className='text-xl' />
      </div>
    )
}

const act_types = [
    "Started",
    "Completed",
    "In Progress",
    "Commented",
    "Bug",
    "Assigned",
];
  
const TaskDetails = () => {
  const params = useParams();
  const [selected, setSelected] = useState(0);

  const [Task, setTask] = useState({});
  const [loading, setLoading] = useState(false);
  const [Error, setError] = useState(null);
  const [activities, setActivities] = useState([]);

  const { currentUser, error } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);

        const res = await fetch(`http://localhost:8081/backend/task/get/${params.id}`, {
          credentials: "include",
        });

        const data = await res.json();

        if (data.success === false) {
          setError(data.message);
          setLoading(false);
          return;
        }

        setTask(data);
        setActivities(data.activities);
        setLoading(false);
        setError(null);
      } catch (error) {
        console.log(error.message);
        setError(error.message);
        setLoading(false);
        return;
      }
    }
    
    fetchTask();
  }, [params.id]);

  console.log(Task)

  return (
    <div className='w-full flex flex-col gap-3 mb-4 overflow-y-hidden'>
      {loading ? (<div><Loading /></div>) : (
        <>
          {Error ? (<p className='text-red-500 text-4xl'>Something went wrong! {Error}</p>) : (<>
            <div className='pl-1'><PageTitle title={Task?.title} /></div>
            <Tabs tabs={tabs} setSelected={setSelected}>
              {selected === 0 ? (
                <>
                  <div className='w-full flex flex-col md:flex-row gap-5 2xl:gap-8 overflow-y-auto'>
                    {/*left*/}
                    <div className='w-full md:w-1/2 space-y-6'>
                      <div className='flex items-center gap-5'>
                        <div className={clsx("flex gap-1 items-center font-serif px-3 py-1 rounded-full",
                          priority_styles[Task?.priority], bgs_transparent[Task?.priority]
                        )}>
                          <span className='text-xl'>{t_icons[Task?.priority]}</span>
                          <span className='font-thin uppercase'>{Task?.priority} priority</span>
                        </div>

                        <div className={clsx('flex items-center gap-1.5 rounded-full px-3 py-1',bgs_task_type[Task?.stage])}>
                          <div className={clsx("w-4 h-4 rounded-full", task_type[Task?.stage])}>
                          </div>
                          <span className={clsx('font-serif uppercase', text_task_type[Task?.stage])}>{Task?.stage}</span>
                        </div>

                        <div className={clsx('flex gap-1 items-center font-serif px-3 py-1 rounded-full bg-gray-400', {
                          'hidden' : Task?.is_trashed === "No" })}>
                            <FaTrash className=''/>
                            <span className='font-serif uppercase'>TRASHED</span>
                        </div>
                      </div>

                      <p className='font-thin'>Created at: {new Date(Task?.date).toDateString()} by
                        {" " + Task?.created_by?.first_name + " " + Task?.created_by?.last_name}</p>

                      <div className='flex items-center gap-8 px-4 py-2 border-y border-gray-500'>
                        <div className='space-x-2'>
                          <span className='font-serif'>Assets:{" "} <span>{" "}{Task.asseturls && Array.isArray(Task.asseturls) ? Task.asseturls.length : 0}</span></span>
                          <span className='text-gray-500 pl-2 pr-2'>|</span>
                          <span className='font-serif'>Sub-Tasks:{" "} <span>{" "}{Task.subtasks && Array.isArray(Task.subtasks) ? Task.subtasks.length : 0}</span></span>
                        </div>
                      </div>

                      <div className='space-y-1 py-4'>
                        <p className='font-thin'>TEAM</p>
                        <div className=''>
                          {Task.team && Task.team.length > 0 ? (
                            Task.team.map((m, index) => (
                              <div key={index} className='flex gap-4 py-2 items-center border-t border-gray-500'>
                                <div className='w-10 h-10 rounded-full text-base -mr-1 bg-blue-600 flex items-center justify-center text-white'>
                                  <span className='text-center'>{getInitials(m?.first_name, m?.last_name)}</span>
                                </div>

                                <div>
                                  <p className='text-lg font-serif'>
                                    {m?.first_name + " " + m?.last_name}
                                  </p>
                                  <span className='font-thin'>{m?.title}</span>
                                </div>
                              </div>
                            ))) : (<p className='text-lg font-serif border-t border-gray-500 py-2'>"No team members."</p>)
                          }
                        </div>
                      </div>

                      <div>
                        <p className='font-thin mb-1'>SUB-TASKS</p>
                        <div>
                          {
                            Task.subtasks && Task.subtasks.length > 0 ? (
                              Task.subtasks.map((subtask, index) => (
                                <div key={index} className='flex gap-3 border-t border-gray-500 py-2'>
                                  <div className='w-10 h-10 rounded-full flex items-center justify-center bg-violet-100'>
                                    <MdTaskAlt className='text-violet-600' size={24} />
                                  </div>

                                  <div>
                                    <div className='flex gap-2 items-center'>
                                      <span className='font-thin'>{new Date(subtask?.date).toDateString()}</span>
                                      <span className='px-2 py-0.5 text-center text-sm rounded-full bg-violet-100 text-violet-700 font-semibold'>
                                        {subtask?.tag}
                                      </span>
                                    </div>
                                    <p className='font-serif'>{subtask?.title}</p>
                                  </div>
                                </div>
                              ))) : (<p className='text-lg font-serif border-t border-gray-500 py-2'>No subtasks available.</p>)
                          }
                        </div>
                      </div>
                    </div>
                    {/*right*/}
                    <div className='w-full md:w-1/2 space-y-6 p-2'>
                      <p className='text-lg font-semibold'>ASSETS</p>
                      <div className='w-full grid grid-cols-2 gap-4'>
                        {
                          Task.asseturls && Task.asseturls.length > 0 ? (
                          Task.asseturls.map((asset, index) => (
                          <img key={index} src={asset} alt={Task?.title}
                            className='w-full rounded h-28 md:h-36 2xl:h-52 cursor-pointer transition-all duration-700 hover:scale-125 hover:z-50'></img>
                        ))) : (<p className='text-lg font-serif py-2'>No assets available.</p>)}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                    <Activities activity={activities} id={params.id} setActivities={setActivities} />
                </>
              )}
            </Tabs>
          </>)}
          {/* add task */}
        </>)}
    </div>
  )
}

const Activities = ({ activity, id, setActivities }) => {
  const [select, setSelect] = useState(act_types[0]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [Errorr, setErrorr] = useState(null);

  const navigate = useNavigate();
  const params = useParams();

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const res = await fetch(`http://localhost:8081/backend/task/add-activity/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type" : "application/json",
        },
        credentials: "include",
        body: JSON.stringify({type: select.toLowerCase(), description: text, date: new Date()}),
      });

      const data = await res.json();

      if (data.success === false) {
        setErrorr(data.message);
        setIsLoading(false);
        return;
      }

      setActivities(data.activities);
      
      setIsLoading(false);
      setErrorr(null);
      navigate(`/task/${id}`);
    } catch (error) {
      console.log(error.message);
      setErrorr(error.message);
      setIsLoading(false);
      return;
    }
   };

  return (
    <>
      <div className='w-full flex gap-10 2xl:gap-20 flex-col md:flex-row overflow-y-auto'>
        <div className='w-full md:w-1/2 pl-1'>
          <PageTitle title="Activities" />
          <div className='w-full mt-5'>
            {
              activity && activity.length > 0 ? (
              activity.map((item, index) => (
                <Fragment key={index + item}>
                  <Card  item={item} isConnected={index < activity.length - 1} />
                </Fragment>
              ))) : (<p className='text-lg font-serif'>No activities available.</p>)
            }
          </div>
        </div>

        <div className='w-full md:w-1/3 pl-1'>
          <PageTitle title="Add Activity" />
          <div className='w-full flex flex-wrap gap-5 mt-5'>
            {
              act_types.map((act, index) => (
                <div key={act + index} className='flex gap-2 items-center'>
                  <input type='checkbox' className='size-4' checked={select === act ? true : false} onChange={(e) => setSelect(act)}>
                  </input>
                  <p className='font-serif'>{act}</p>
                </div>
              ))
            }
            <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder=' Type here...'
              className='border border-black w-full mr-4 mb-5 rounded py-2 px-4'>
            </textarea>
            {isLoading ? (
              <Loading></Loading>
            ) : (
              <button className='px-3 py-2 rounded-lg
                                 bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium mb-2 -mt-6'
                onClick={handleSubmit}>
                Submit
              </button>
            )}
            {Errorr && <p className='text-red-500 text-4xl'>{Errorr}</p>}
          </div>
        </div>
      </div>
    </>
  )
}

const Card = ({ item, isConnected }) => {
  console.log(isConnected)
  return (
    <>
      <div className='flex space-x-4'>
        <div className='flex flex-col items-center flex-shrink-0'>
          <div className='w-10 h-10 flex items-center justify-center'>
            {activitiy_types[item?.type]}
          </div>

          <div className={clsx('w-full flex items-center  ml-10', isConnected ? "min-h-[70px]" : "min-h-[0px]")}>
            <div className='w-0.5 bg-gray-400 h-full'></div>
          </div>
        </div>

        <div className='flex flex-col gap-y-1 mb-8'>
          <p className='font-semibold'>{item?.by?.first_name + " " + item?.by?.last_name}</p>
          <div className='font-thin space-y-2'>
            <span className='capitalize mr-2'>{item?.type}</span>
            <span className='text-sm'>{moment(item?.date).fromNow()}</span>
          </div>

          <div className='text-gray-700'>
            {item?.description}
          </div>
        </div>
      </div>
    </>
  )
}
  
export default TaskDetails