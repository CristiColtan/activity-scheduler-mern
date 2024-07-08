import React, { useEffect } from 'react'
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom";

import bgVideo from "../assets/tasks.gif"
import Navbar from '../components-guest/Navbar'
import Hero from '../components-guest/Hero'
import Services from '../components-guest/Services'
import Banner from '../components-guest/Banner'
import Banner2 from '../components-guest/Banner2' 
import Testimonials from '../components-guest/Testimonials'
import Footer from '../components-guest/Footer'

import AOS from "aos"
import "aos/dist/aos.css"

export default function Guest() {
  useEffect(() => {
    const img = document.getElementById("scroll");
    
    const prag = 900;

    const updateScrollDistance = () => {
      if (window.innerWidth < prag) {
        //console.log(window.innerWidth);
        return prag-550;
      }
      else {
        //console.log(window.innerWidth);
        return window.innerWidth / 6;
      }
        
    }

    let scrollDistance = updateScrollDistance();
    
    const checkScroll = () => {
      if (window.scrollY > scrollDistance) {
        img.classList.remove("fixed","top-0");
        img.classList.add("absolute"/*},`top-[${scrollDistance}px]`*/);
        img.style.top = `${scrollDistance}px`;
      }
      else {
        img.classList.remove("absolute"/*,`top-[${scrollDistance}px]`*/);
        img.classList.add("fixed", "top-0");
        img.style.top='0px'
      }
    };

    const handleResize = () => {
      scrollDistance = updateScrollDistance();
      checkScroll();
    };

    window.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', handleResize);
    };

  }, []);
  
  useEffect(() => {
    AOS.init({
      duration: 1200,
      easing:"ease-in-out",
    });
  }, []);

  const { currentUser } = useSelector((state) => state.user);

  console.log(currentUser);

  return currentUser ? (<Navigate to="/dashboard"></Navigate>) :
  (
    <div>
      <div className='h-[610px] relative'>
        <img id="scroll" className='fixed right-0 top-0 h-[610px] w-full
        object-cover z[-1]' src={bgVideo} alt=""></img>
        <Navbar></Navbar>
        <Hero></Hero>
      </div>
      <Services></Services>
      <Banner></Banner>
      <br></br>
      <Banner2></Banner2>
      <br></br>
      <br></br>
      <Testimonials></Testimonials>
      <Footer></Footer>
      <br></br>
    </div>
  );
}
