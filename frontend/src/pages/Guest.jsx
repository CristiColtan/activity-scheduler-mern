import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import Navbar from "../components-guest/Navbar";
import Hero from "../components-guest/Hero";
import Services from "../components-guest/Services";
import Banner from "../components-guest/Banner";
import Banner2 from "../components-guest/Banner2";
import Testimonials from "../components-guest/Testimonials";
import Footer from "../components-guest/Footer";

export default function Guest() {
  const { currentUser } = useSelector((state) => state.user);

  console.log(currentUser);

  return currentUser ? (
    <Navigate to="/dashboard"></Navigate>
  ) : (
    <div className="min-h-screen">
      <Navbar></Navbar>
      <Hero></Hero>
      <Services></Services>
      <Banner></Banner>
      <Banner2></Banner2>
      <Testimonials></Testimonials>
      <Footer></Footer>
    </div>
  );
}
