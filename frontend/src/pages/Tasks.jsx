import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { setSearchTerm } from "../redux/search/searchSlice.js";

import { MdGridView } from "react-icons/md";

import Loading from "../components/Loading.jsx";

import { task_type } from "../utils/tableImports.js";

import TaskTitle from "../components/TaskTitle.jsx";
import BoardView from "../components/BoardView.jsx";

import { proxy } from "../utils/deployment.js";
import { apiRequest } from "../utils/apiReq.js";

const Tasks = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [Tasks, setTasks] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchTermRedux = useSelector((state) => state.search.searchTerm);

  const [showMore, setShowMore] = useState(false);
  console.log("SHOW MORE", showMore);

  const [sideBarData, setSideBarData] = useState({
    searchTerm: searchTermRedux || "",
    priority: "any-priority",
    status: "any-status",
    sort: "date",
    order: "desc",
  });
  console.log("SIDEBAR DATA", sideBarData);

  const tabs = [{ title: "Board View", icon: <MdGridView /> }];

  const handleCreateTaskClick = () => {
    navigate("/create-task");
  };

  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    setSideBarData({ ...sideBarData, searchTerm: searchTermRedux || "" });
  }, [searchTermRedux]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);

    const searchTermFromURL = urlParams.get("searchTerm");
    const priorityFromURL = urlParams.get("priority");
    const statusFromURL = urlParams.get("status");
    const sortFromURL = urlParams.get("sort");
    const orderFromURL = urlParams.get("order");

    if (
      searchTermFromURL ||
      priorityFromURL ||
      statusFromURL ||
      sortFromURL ||
      orderFromURL
    ) {
      setSideBarData({
        searchTerm: searchTermFromURL || "",
        priority: priorityFromURL || "any-priority",
        status: statusFromURL || "any-status",
        sort: sortFromURL || "date",
        order: orderFromURL || "desc",
      });
    }
    if (searchTermFromURL !== null && searchTermFromURL !== undefined)
      if (searchTermRedux !== searchTermFromURL) {
        dispatch(setSearchTerm(searchTermFromURL));
      }

    const fetchTasks = async () => {
      try {
        setLoading(true);
        setShowMore(false);

        const searchQuery = urlParams.toString();

        const res = await apiRequest(
          `${proxy}/backend/task/get-all-tasks?${searchQuery}`
        );

        if (!res) return;

        const data = await res.json();

        if (data.success === false) {
          console.log(data.message);
          setError(data.message);
          setLoading(false);
          return;
        }

        if (data.length === 9) {
          setShowMore(true);
        } else {
          setShowMore(false);
        }

        setTasks(data);

        setLoading(false);
        setError(null);
      } catch (error) {
        console.log(error.message);
        setError(error.message);
        setLoading(false);
        return;
      }
    };

    fetchTasks();
  }, [window.location.search]);

  const handleChange = (e) => {
    if (
      e.target.id === "any-priority" ||
      e.target.id === "high" ||
      e.target.id === "medium" ||
      e.target.id === "normal" ||
      e.target.id === "low"
    ) {
      setSideBarData({ ...sideBarData, priority: e.target.id });
    }

    if (
      e.target.id === "any-status" ||
      e.target.id === "completed" ||
      e.target.id === "to do" ||
      e.target.id === "in progress"
    ) {
      setSideBarData({ ...sideBarData, status: e.target.id });
    }

    if (e.target.id === "sort_order") {
      const sort = e.target.value.split("_")[0] || "date";
      const order = e.target.value.split("_")[1] || "desc";
      setSideBarData({ ...sideBarData, sort, order });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const urlParams = new URLSearchParams();
    urlParams.set("searchTerm", sideBarData.searchTerm);
    urlParams.set("priority", sideBarData.priority);
    urlParams.set("status", sideBarData.status);
    urlParams.set("sort", sideBarData.sort);
    urlParams.set("order", sideBarData.order);

    const searchQuery = urlParams.toString();
    navigate(`/tasks?${searchQuery}`);
  };

  const handleShowMore = async () => {
    const tasksNumber = Tasks.length;
    const startIndex = tasksNumber;

    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("startIndex", startIndex);
    const searchQuery = urlParams.toString();

    const res = await apiRequest(
      `${proxy}/backend/task/get-all-tasks?${searchQuery}`
    );

    if (!res) return;

    const data = await res.json();
    if (data.length < 9) {
      setShowMore(false);
    }

    setTasks([...Tasks, ...data]);
  };

  return loading ? (
    <div>
      <Loading />
    </div>
  ) : (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-[3fr_3fr_2fr_1fr] gap-5 bg-white p-2 shadow-lg rounded">
        <div className="">
          <h2 className="text-lg font-serif mb-1 ml-4">Priority</h2>
          <div className="flex flex-wrap gap-4 font-serif">
            <div className="flex items-center gap-1 ml-1">
              <input
                className="size-4"
                type="checkbox"
                id="any-priority"
                onChange={handleChange}
                checked={sideBarData.priority === "any-priority"}
              ></input>
              <span>any</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                className="size-4"
                type="checkbox"
                id="high"
                onChange={handleChange}
                checked={sideBarData.priority === "high"}
              ></input>
              <span>high</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                className="size-4"
                type="checkbox"
                id="medium"
                onChange={handleChange}
                checked={sideBarData.priority === "medium"}
              ></input>
              <span>medium</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                className="size-4"
                type="checkbox"
                id="normal"
                onChange={handleChange}
                checked={sideBarData.priority === "normal"}
              ></input>
              <span>normal</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                className="size-4"
                type="checkbox"
                id="low"
                onChange={handleChange}
                checked={sideBarData.priority === "low"}
              ></input>
              <span>low</span>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-serif mb-1 ml-4">Status</h2>
          <div className="flex flex-wrap gap-4 font-serif">
            <div className="flex items-center gap-1 ml-1">
              <input
                className="size-4"
                type="checkbox"
                id="any-status"
                onChange={handleChange}
                checked={sideBarData.status === "any-status"}
              ></input>
              <span className="">any</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                className="size-4"
                type="checkbox"
                id="completed"
                onChange={handleChange}
                checked={sideBarData.status === "completed"}
              ></input>
              <span>completed</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                className="size-4"
                type="checkbox"
                id="to do"
                onChange={handleChange}
                checked={sideBarData.status === "to do"}
              ></input>
              <span>to do</span>
            </div>
            <div className="flex items-center gap-1">
              <input
                className="size-4"
                type="checkbox"
                id="in progress"
                onChange={handleChange}
                checked={sideBarData.status === "in progress"}
              ></input>
              <span>in progress</span>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-serif mb-1 ml-4">Sort</h2>
          <div className="flex flex-wrap gap-4 font-serif">
            <select
              id="sort_order"
              onChange={handleChange}
              value={`${sideBarData.sort}_${sideBarData.order}`}
              className="px-2 py-1 rounded-lg bg-gray-100"
            >
              <option value="date_desc">Latest</option>
              <option value="date_asc">Oldest</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={handleSearch}
            className="px-3 py-2 rounded-lg
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium"
          >
            Search
          </button>
        </div>
      </div>

      <div className="w-full py-6">
        <div className="flex space-x-6 p-1 px-5 justify-between bg-white rounded shadow-lg">
          {tabs.map((tab, index) => (
            <div
              key={tab.title + index}
              className="w-fit flex items-center outline-none gap-2 px-2 py-2.5 text-base font-medium
                              leading-5 bg-gray-100 text-blue-700 border-b-2 border-l-2 border-l-black/20 border-blue-600 rounded
                              shadow-lg -ml-1 border-t-2 border-t-black/20 border-r-2 border-r-black/20 hover:text-blue-400
                              hover:border-b-blue-400"
            >
              {tab.icon}
              <span>{tab.title}</span>
            </div>
          ))}
          {(currentUser.is_admin === "Yes" ||
            currentUser.is_team_manager === "Yes") && (
            <button
              className="px-3 py-2 rounded-lg
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium"
              onClick={handleCreateTaskClick}
            >
              <span>+ Create Task</span>
            </button>
          )}
        </div>
      </div>

      <div className="w-full py-0 mb-2">
        <div className=" rounded gap-4 flex justify-between">
          <TaskTitle label="To Do" classes={task_type["to do"]} />
          <TaskTitle label="In Progress" classes={task_type["in progress"]} />
          <TaskTitle label="Completed" classes={task_type.completed} />
        </div>
      </div>

      {Tasks && Tasks.length > 0 ? (
        <BoardView tasks={Tasks} setTasks={setTasks} />
      ) : error ? (
        <p className="text-red-500 text-4xl"> {error}</p>
      ) : (
        <p className="font-sans mt-10 text-2xl flex justify-center">
          No tasks available.
        </p>
      )}
      <div className="w-full py-0 mb-2">
        <div className="flex justify-center">
          {showMore && (
            <button
              className="px-3 py-2 rounded-lg
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium"
              onClick={handleShowMore}
            >
              Show More
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
