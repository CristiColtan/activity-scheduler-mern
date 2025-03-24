import React, { useState, useEffect } from "react";

import Loading from "../Loading";
import AdminDialogAddRole from "./AdminDialogAddRole";

import { BsPersonSquare } from "react-icons/bs";
import { FaPlus } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";

import { apiRequest } from "../../utils/apiReq.js";

const AdminRoles = () => {
  const [roles, setRoles] = useState([]);
  const [openDialogAddRole, setOpenDialogAddRole] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log("AdminRoles:", roles);

  const deleteRole = async (rolee) => {
    try {
      setLoading(true);

      const res = await apiRequest(
        "http://localhost:8081/backend/admin/delete/role",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: rolee }),
        }
      );

      if (!res) return;

      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        setLoading(false);
        setError(data.message);
        return;
      }

      setRoles(data);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.log(error.message);
      setError(error.message);
      setLoading(false);
      return;
    }
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);

      const res = await apiRequest(
        "http://localhost:8081/backend/admin/get/roles"
      );

      if (!res) return;

      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        setLoading(false);
        setError(data.message);
        return;
      }

      setRoles(data);
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
    fetchRoles();
  }, []);

  return (
    <>
      <div className="w-full py-2">
        {loading ? (
          <div>
            <Loading />
          </div>
        ) : (
          <>
            {error ? (
              <p className="text-red-500 text-4xl">{error}</p>
            ) : (
              <div className="w-full py-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 xl:gap-10 px-6">
                {roles && roles.length > 0 ? (
                  <>
                    {roles.map((role, index) => (
                      <div
                        key={index}
                        className="h-fit border border-gray-300 bg-white shadow-lg rounded p-4 gap-8"
                      >
                        <div className="flex justify-between">
                          <div>{/*blank*/}</div>
                          <button
                            className="hover:bg-gray-200 rounded"
                            onClick={() => deleteRole(role)}
                          >
                            <IoClose className="text-xl" />
                          </button>
                        </div>
                        <div className="flex flex-col items-center justify-center text-center">
                          <BsPersonSquare className="text-5xl lg:text-7xl mb-2" />
                          <span
                            className="font-serif font-semibold mt-2 whitespace-normal overflow-hidden
                                                        line-clamp-1 lg:overflow-hidden lg:whitespace-pre lg:text-ellipsis
                                                        hover:overflow-visible hover:line-clamp-none"
                          >
                            {role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <p>No roles.</p>
                  </>
                )}
                <button
                  className="h-fit border border-gray-300 hover:bg-gray-100 bg-white 
                                shadow-lg rounded p-4 gap-6"
                  onClick={() => setOpenDialogAddRole(true)}
                >
                  <div className="flex items-center justify-center py-3">
                    <div className="text-center">
                      <FaPlus className="text-5xl lg:text-7xl mb-2" />
                      <span className="text-center font-serif font-thin mt-2">
                        Costum
                      </span>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <AdminDialogAddRole
        open={openDialogAddRole}
        setOpen={setOpenDialogAddRole}
        roles={roles}
        setRoles={setRoles}
      />
    </>
  );
};

export default AdminRoles;
