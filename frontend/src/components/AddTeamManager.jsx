import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { DialogTitle } from "@headlessui/react";
import { useNavigate } from "react-router-dom";

import MyModal from "./MyModal";
import TaskAddUserList from "./TaskAddUserList";

import { apiRequest } from "../utils/apiReq.js";

const AddTeamManager = ({ open, setOpen }) => {
  const [loading, setLoading] = useState(false);
  const [normalUsers, setNormalUsers] = useState([]);
  const [teamManagers, setTeamManagers] = useState([]);

  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const fetchNormalUsers = async () => {
    try {
      setLoading(true);
      let res;

      if (currentUser.is_admin === "Yes") {
        res = await apiRequest(
          "http://localhost:8081/backend/admin/get/normal-users"
        );
      }

      if (!res) return;

      const data = await res.json();
      setNormalUsers(data);
    } catch (error) {
      console.log(error.message);
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) fetchNormalUsers();
  }, [open]);

  const handleCancel = () => {
    setTeamManagers([]);
    setOpen(false);
  };

  const handleAddTeamManager = async () => {
    try {
      setLoading(true);

      const res = await apiRequest(
        "http://localhost:8081/backend/admin/add/team-manager",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ membersID: teamManagers }),
        }
      );

      if (!res) return;

      setLoading(false);
      navigate("/team");
      handleCancel();
    } catch (error) {
      console.error("Eroare adding team-manager(s)!");
      setLoading(false);
      return;
    }
  };

  return (
    <>
      <MyModal open={open} setOpen={setOpen}>
        <DialogTitle
          as="h2"
          className="text-base font-semibold leading-6 text-black mb-4 pl-0"
        >
          ADD NEW TEAM MANAGER
        </DialogTitle>

        <TaskAddUserList
          team={teamManagers}
          setTeam={setTeamManagers}
          data={normalUsers}
        ></TaskAddUserList>
        {normalUsers && normalUsers.length > 0 ? (
          normalUsers.map((_, index) => (
            <div key={index}>
              <br></br>
              <br></br>
            </div>
          ))
        ) : (
          <></>
        )}

        <div className="w-full -mt-2 gap-4 flex">
          <div className="w-full">
            {/*add functionality of uploading photos!!*/}
          </div>

          <div className="w-full flex justify-between gap-4">
            <button
              onClick={handleCancel}
              className="px-3 py-2 rounded
                                bg-white text-black font-sans w-1/2
                                hover:bg-gray-300 transition duration-200
                                font-medium disabled:bg-gray-300
                                border-2 border-gray-400"
            >
              Cancel
            </button>
            <button
              className="px-3 py-2 rounded w-1/2
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium disabled:bg-blue-500"
              onClick={handleAddTeamManager}
            >
              {loading ? "Submitting" : "Submit"}
            </button>
          </div>
        </div>
      </MyModal>
    </>
  );
};

export default AddTeamManager;
