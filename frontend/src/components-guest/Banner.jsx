import React from 'react'

import { FaSyncAlt } from "react-icons/fa";
import { MdOutlineDevicesOther } from "react-icons/md";


const Banner = () => {
  return (
    <div className='text-white pb-12 bg-sky-900/85 pl-8 pr-8 relative'>
          <div className='container'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4
              items-center'>
                  <div>
                    <FaSyncAlt className='text-9xl'/>
                  </div>
                  <div className='space-y-3 xl:pr-36 p-4 border-r-2 border-b-2
                  border-b-black border-r-black'>
                      <p className='font-medium font-sans text-2xl'>
                          Real time syncronization!</p>
                      <p className='font-thin text-base'>Any changes made by a user are instantly reflected
                          across all connected devices and users.</p>
                  </div>
              </div>              
          </div>
          
    </div>
  )
}

export default Banner