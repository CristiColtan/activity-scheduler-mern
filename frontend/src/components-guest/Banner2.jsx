import React from 'react'

import { MdOutlineDevicesOther } from "react-icons/md";

const Banner2 = () => {
  return (
      <div className='text-black pb-12 pl-8 pr-8 relative lg:-translate-y-24 lg:translate-x-6'>
        <div className='container bg-gray-100/85 px-4 py-2 rounded-xl banner-container pt-6 pb-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 items-center'>
            <div className='space-y-3 xl:pr-36 p-4 border-r-2 border-b-2 border-b-sky-900 border-r-sky-900'>         
              <p className='font-medium font-sans text-2xl' data-aos="fade-up" data-aos-delay="300">
                Cross-Platform Compatibility!
              </p>
              <p className='font-thin text-base' data-aos="fade-up" data-aos-delay="500" >     
                The interface ensures optimal usability and readability
                across all devices.
              </p>
            </div>
            <div data-aos="zoom-in" className='flex justify-center'>
              <MdOutlineDevicesOther className='text-9xl' />
            </div>
          </div>              
        </div>  
      </div>
  )
}

export default Banner2