import React from 'react'

import bgVideo from "../assets/tasks.gif"
import Navbar from '../components-guest/Navbar'
import Hero from '../components-guest/Hero'
import Services from '../components-guest/Services'
import Banners from '../components-guest/Banners'

export default function Guest() {
  return (
    <div>
      <div className='h-[610px] relative'>
        <img className='fixed right-0 top-0 h-[610px] w-full
        object-cover z[-1]' src={bgVideo} alt=""></img>
        <Navbar></Navbar>
        <Hero></Hero>
      </div>
      <Services></Services>
      <Banners></Banners>
      <br></br>
    </div>
  )
}
