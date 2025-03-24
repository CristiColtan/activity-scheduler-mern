import React, { useState, useEffect } from "react";
import clsx from "clsx";
import moment from "moment";

import Loading from "../Loading.jsx";
import AdminPagetitle from "./AdminPageTitle.jsx";
import AdminTaskTable from "./AdminTaskTable.jsx";

import { apiRequest } from "../../utils/apiReq.js";

const AdminTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log("AllTasks:", allTasks);

  const fetchAllTasks = async () => {
    try {
      setLoading(true);

      const res = await apiRequest(
        "http://localhost:8081/backend/admin/get/all-tasks-populated"
      );

      if (!res) return;

      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        setError(data.message);
        setLoading(false);
        return;
      }

      setAllTasks(data);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.log(error.message);
      setError(error.message);
      setLoading(false);
      return;
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  return loading ? (
    <div>
      <Loading />
    </div>
  ) : (
    <>
      <div className="w-full bg-white rounded shadow-lg mb-8">
        <div className="flex items-center justify-between px-2 py-2">
          <AdminPagetitle title="All Tasks" />
        </div>
      </div>

      <AdminTaskTable tasks={allTasks} setTasks={setAllTasks} />

      <div>{error && <p className="text-red-500">{error}</p>}</div>
    </>
  );
};

export default AdminTasks;
