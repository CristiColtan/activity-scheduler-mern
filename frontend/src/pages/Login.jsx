import React from 'react'

import "../styles/Login.css"

import {Input} from "@headlessui/react"

export default function Login() {
    return (
      
      <div className='w-full min-h-screen flex items-center justify-center flex-col lg:flex-row'>
          <div className='w-full md:w-auto flex gap-0 md:gap-40 flex-col md:flex-row items-center justify-center'>
                <div className='h-full w-full lg:w-2/3 flex flex-col items-center justify-center'>
                    <div className='pt-10 w-full md:max-w-lg 2xl:max-w-3xl flex flex-col items-center justify-center
                gap-5 md:gap-y-10 '>
                        <span className='flex gap-1 py-1 px-3 border rounded-full text-sm md:text-xl
                         border-blue-700 text-blue-600 font-medium'>
                            Organize your life simple and efficient!
                        </span>
                        <p className='flex flex-col gap-0 md:gap-4 text-4xl md:text-6xl 
                         font-black text-center text-blue-700'>
                            <span>Coud-Based</span> 
                            <span>Task Manager</span>
                        </p>
                        <p className='flex flex-col gap-0 md:gap-4 text-5xl md:text-7xl
                        transition-transform duration-500 transform px-6
                        py-2 hover:scale-125 font-bold text-gray-800 font-serif
                        shadow-outer text-shadoww'>
                            <span>CCTask</span>
                        </p>
                    </div>
                </div>
                <div className='w-full md:w-1/3 p-4 md:p-1 flex flex-col
                justify-center items-center'>
                    <form className='w-full md:w-[400px] flex flex-col
                    gap-y-8 bg-white px-10 pt-14 pb-14 login-container'>
                        <div>
                            <p className='text-blue-600 text-3xl font-bold font-serif
                            text-center'>
                                Welcome back!
                            </p>
                            <p className='text-blue-500 text-xl font-bold font-serif
                            text-center py-2'>
                                Keep all your credentials safe!
                            </p>
                        </div>

                        <div className='flex flex-col gap-y-5'>
                            <div className='w-full flex flex-col gap-1'>
                                <label htmlFor='username' className='font-medium
                                text-base'>Username</label>
                                <input type="text" id="username" required
                                    className='bg-transparent px-3 py-2.5 2xl:py-3
                                border border-gray-400 placeholder-gray-500
                                text-gray-900 outline-none text-base w-full
                                focus:ring-2 ring-blue-300 rounded-full'></input>
                            </div>
                            <div className='w-full flex flex-col gap-1'>
                                <label htmlFor='password' className='font-medium
                                text-base'>Password</label>
                                <input type="password" id="password" required
                                    className='bg-transparent px-3 py-2.5 2xl:py-3
                                border border-gray-400 placeholder-gray-500
                                text-gray-900 outline-none text-base w-full
                                focus:ring-2 ring-blue-300 rounded-full'></input>
                            </div>
                            <button className='px-3 py-2 rounded-full
                                w-full bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium'>
                            Login</button>
                            <button className='px-3 py-2 rounded-full font-medium
                                w-full bg-red-700 text-white font-sans
                                hover:bg-red-500 transition duration-200'>
                            Continue with google</button>
                        </div>
                    </form>
                </div>
          </div>
      </div>
  )
}
