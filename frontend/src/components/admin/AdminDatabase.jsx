import React, { useState, useEffect } from "react";
import clsx from "clsx";

import Loading from "../Loading.jsx";
import AdminPageTitle from "./AdminPageTitle.jsx";

import { LuDatabaseBackup } from "react-icons/lu";
import { TbDatabaseX } from "react-icons/tb";

import { apiRequest } from "../../utils/apiReq.js";
import DialogDeleteBackup from "../dialog/DialogDeleteBackup.jsx";
import DialogRestoreBackup from "../dialog/DialogRestoreBackup.jsx";

const AdminDatabase = () => {
  const [filenames, setFilenames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [openDialogRestoreDatabase, setOpenDialogRestoreDatabase] =
    useState(false);
  const [openDialogDeleteBackup, setOpenDialogDeleteBackup] = useState(false);
  const [selectedFilename, setSelectedFilename] = useState(null);

  const restoreHandlerOnClick = (filename) => {
    setSelectedFilename(filename);
    setOpenDialogRestoreDatabase(true);
  };

  const deleteHandlerOnClick = (filename) => {
    setSelectedFilename(filename);
    setOpenDialogDeleteBackup(true);
  };

  const fetchBackups = async () => {
    try {
      setLoading(true);

      const res = await apiRequest(
        "http://localhost:8081/backend/utils/get-backups"
      );

      if (!res) return;

      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        setError(data.message);
        setLoading(false);
        return;
      }

      setFilenames(data);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.log(error);
      setError(error.message);
      setLoading(false);
      return;
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const MyTableHeaderBackups = () => {
    return (
      <thead className="border-b border-black">
        <tr className="text-black text-left">
          <th className="py-2">Filename</th>
        </tr>
      </thead>
    );
  };

  const MyTableRowBackups = ({ filename }) => {
    return (
      <>
        <tr className="text-black hover:bg-gray-200 border-b border-black">
          <td className="py-2">
            <p className="font-serif">{filename}</p>
          </td>

          <td className="p-2">
            <div className="flex justify-end gap-4">
              <button
                className="ml-1"
                onClick={() => restoreHandlerOnClick(filename)}
              >
                <LuDatabaseBackup className="text-xl text-blue-700 hover:text-blue-500" />
              </button>
              <button onClick={() => deleteHandlerOnClick(filename)}>
                <TbDatabaseX className="text-xl text-red-600 hover:text-red-400" />
              </button>
            </div>
          </td>
        </tr>
      </>
    );
  };

  return loading ? (
    <div>
      <Loading></Loading>
    </div>
  ) : (
    <>
      <div className="w-full bg-white rounded shadow-lg mb-8">
        <div className="flex items-center justify-between px-2 py-2">
          <AdminPageTitle title="Database Backups" />
        </div>
      </div>

      <div className="w-full bg-white h-fit px-2 md:px-6 py-4 shadow-lg rounded">
        <table className="w-full mb-5">
          <MyTableHeaderBackups />
          <tbody>
            {filenames && filenames.length > 0 ? (
              filenames.map((filename, index) => (
                <MyTableRowBackups key={index + filename} filename={filename} />
              ))
            ) : (
              <>
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No backups found.
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      <div>{error && <p className="text-red-500">{error}</p>}</div>

      <DialogDeleteBackup
        open={openDialogDeleteBackup}
        setOpen={setOpenDialogDeleteBackup}
        filenameData={selectedFilename}
        setFilenames={setFilenames}
      />

      <DialogRestoreBackup
        open={openDialogRestoreDatabase}
        setOpen={setOpenDialogRestoreDatabase}
        filenameData={selectedFilename}
      />
    </>
  );
};

export default AdminDatabase;
