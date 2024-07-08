import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Toaster from "sonner";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import Login from "./pages/Login";
import Guest from "./pages/Guest";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Menu from "./components/Menu";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Trash from "./pages/Trash.jsx";
import Profile from "./pages/Profile.jsx";

import { store, persistor } from "./redux/store.js";

function App() {
  return (
    <div className="w-full min-h-screen bg-[#f2f2f2]">
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/guest" />} />
              <Route path="/guest" element={<Guest />}></Route>
              <Route path="/login" element={<Login />}></Route>
              <Route path="/register" element={<Register />}></Route>
              <Route element={<PrivateRoute />}>
                <Route index path="/dashboard" element={<Dashboard />}></Route>
                <Route path="/trash" element={<Trash />}></Route>
                <Route path="/profile" element={<Profile />}></Route>
              </Route>
            </Routes>
            <Footer />
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </div>
  );
}

export default App;
