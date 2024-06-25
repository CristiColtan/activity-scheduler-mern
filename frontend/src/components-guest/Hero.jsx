import React from 'react'

const Hero = () => {
  return (
      <div className='bg-white/20 h-full relative z-49 pl-8 pt-6'>
          <div className='h-full flex justify-center items-center p-4'>
              <div className='container grid grid-cols-1
              sm:grid-cols-2 gap-4'>
                  <div className=' translate-y-60 lg:translate-y-0 space-y-4 pb-10'>
                      <h1 className='text-4xl lg:text-5xl font-bold
                      font-serif'>
                          Simplify your day!</h1>
                      <p className='font-serif lg:text-xl lg:pr-52'>
                          Organize your tasks, collaborate with your team and never
                          miss a deadline again!
                      </p>
                  </div>
                  <div></div>
              </div>
          </div>
      </div>
  )
}

export default Hero