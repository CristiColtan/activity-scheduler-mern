import React from 'react'

import { FaSyncAlt } from "react-icons/fa";

import "../styles/Banner.css"

const Banner = () => {
  return (
    <section>
      <div className='text-black pb-12 pl-8 pr-8 relative lg:-translate-y-24 lg:translate-x-6'>
        <div className='container bg-gray-100/85 pt-6 pb-4 px-4 py-2 rounded-xl banner-container'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 items-center '>
            <div data-aos="zoom-in" className='flex justify-center'>
              <FaSyncAlt className='text-9xl' />
            </div>
            <div className='space-y-3 xl:pr-36 p-4 border-r-2 border-b-2 border-b-sky-900 border-r-sky-900'>
              <p className='font-medium font-sans text-2xl' data-aos="fade-up" data-aos-delay="300">
                Real time syncronization!
              </p>
              <p data-aos="fade-up" data-aos-delay="500" className='font-thin text-base'>
                Any changes made by a user are instantly reflected
                across all connected devices and users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Banner