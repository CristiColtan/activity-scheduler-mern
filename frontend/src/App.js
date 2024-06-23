import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Toaster from "sonner";

import Login from "./pages/Login";
import Guest from "./pages/Guest";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Menu from "./components/Menu";
import Register from "./pages/Register";

function App() {
  return (
    <div className="w-full min-h-screen bg-[#f2f2f2]">
      <BrowserRouter>
        <Routes>
          <Route path="/guest" element={<Guest />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/register" element={<Register />}></Route>
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
