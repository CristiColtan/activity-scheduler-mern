import "./App.css";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";

import Login from "./pages/Login";
import Guest from "./pages/Guest";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Trash from "./pages/Trash.jsx";
import Profile from "./pages/Profile.jsx";
import Tasks from "./pages/Tasks.jsx";
import Completed from "./pages/Completed.jsx";
import Team from "./pages/Team.jsx";
import PrivateRouteAdminTM from "./components/PrivateRouteAdminTM.jsx";
import TaskDetails from "./pages/TaskDetails.jsx";
import CreateTask from "./pages/CreateTask.jsx";
import EditTask from "./pages/EditTask.jsx";
import InProgress from "./pages/InProgress.jsx";
import ToDo from "./pages/ToDo.jsx";
import PrivateRouteAdmin from "./components/routes/PrivateRouteAdmin.jsx";
import Settings from "./pages/Settings.jsx";

import { store, persistor } from "./redux/store.js";

function App() {
  return (
    <>
      <div className="w-full min-h-screen bg-[#f2f2f2]">
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ToastContainer />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/guest" />} />
                <Route path="/guest" element={<Guest />}></Route>
                <Route path="/login" element={<Login />}></Route>
                <Route path="/register" element={<Register />}></Route>
                <Route element={<PrivateRoute />}>
                  <Route
                    index
                    path="/dashboard"
                    element={<Dashboard />}
                  ></Route>
                  <Route path="/profile" element={<Profile />}></Route>
                  <Route path="/tasks" element={<Tasks />}></Route>
                  <Route path="/completed" element={<Completed />}></Route>
                  <Route path="/in-progress" element={<InProgress />}></Route>
                  <Route path="/to-do" element={<ToDo />}></Route>
                  <Route path="/task/:id" element={<TaskDetails />}></Route>
                  <Route element={<PrivateRouteAdminTM />}>
                    <Route path="/team" element={<Team />}></Route>
                    <Route path="/trash" element={<Trash />}></Route>
                    <Route path="/create-task" element={<CreateTask />}></Route>
                    <Route path="/edit-task/:id" element={<EditTask />}></Route>
                    <Route element={<PrivateRouteAdmin />}>
                      <Route path="/settings" element={<Settings />}></Route>
                    </Route>
                  </Route>
                </Route>
              </Routes>
              {/* <Footer /> */}
            </BrowserRouter>
          </PersistGate>
        </Provider>
      </div>
    </>
  );
}

export default App;
