import React from 'react'

const Navbar = () => {
  return (
      <div className='fixed top-0 right-0 w-full z-50 
      bg-blue/10 backdrop-blur-md py-8 pl-8 pr-4'>
          <div className='container'>
              <div className='flex items-center justify-between'>
                  <div className='flex'>
                      <p className='flex flex-col gap-0 md:gap-4 text-5xl md:text-7xl
                        transition-transform duration-500 transform px-6
                        py-2 hover:scale-125 font-bold text-gray-800 font-serif
                        shadow-outer text-shadoww pr-16'>
                            <span>CCTask</span>
                        </p>
                  </div>
                  <div className=' text-black-600 hidden md:block'>
                      <ul className='flex gap-6 text-xl md:text-2xl items-center py-5
                       md:py-8 font-medium font-sans pr-8'>
                          <li>
                              <a href="#">About</a>
                          </li>
                          <li>
                              <a href="#">Features</a>
                          </li>
                          <li>
                              <a href="#">Testimonials</a>
                          </li>
                      </ul>                      
                  </div>
                  <div className='flex gap-6 pl-4'>
                      <button className='border-2 bg-sky-900/90 text-white border-sky-900 px-3 py-1 rounded-lg
                      text-xl font-medium  hover:bg-sky-600 transition duration-200
                      font-sans'>Login</button>
                      <button className='border-2 bg-sky-900/90 text-white border-sky-900 px-3 py-1 rounded-lg
                      text-xl font-medium  hover:bg-sky-600 transition duration-200
                      font-sans'>Register</button>
                  </div>
              </div>
          </div>
      </div>
  )
}

export default Navbar