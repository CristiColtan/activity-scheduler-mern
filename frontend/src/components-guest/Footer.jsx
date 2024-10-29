import React from 'react'

import { FaLocationDot } from "react-icons/fa6";
import { IoIosMailUnread } from "react-icons/io";
import { MdAddIcCall } from "react-icons/md";

const Footer = () => {
    return (
        <div className='bg-gray-400/95 text-black px-3 lg:-translate-y-24'>
            <div className='max-w-[1200px] mx-auto ' data-aos="fade-up" data-aos-delay="200">
                <div className='grid sm:grid-cols-3 py-5 px-2 gap-6 justify-center items-center xs:flex'>
                    <div className='justify-center items-center xs:flex text-center pb-2'>
                        <h1 className='font-bold font-sans text-xl mb-2'>Organize your life!</h1>
                      
                        <p className='font-thin mb-2'> Get the
                            <span className='text-white font-medium'>{" "}newest updates</span> on e-mail!
                        </p>
                        <div className='flex flex-col items-center'>
                            <div className=' gap-3'>
                                <input type="text" id="email-updates"
                                    className='bg-gray-300 py-1 px-1 border border-gray-400 
                                text-gray-900 outline-none text-base w-1/3 
                                focus:ring-2 ring-white inline-block' placeholder='E-mail'>
                                </input>
                                <button className='px-1 py-1 rounded-md font-medium
                                 bg-gray-300 text-black font-sans
                                hover:bg-gray-200 transition duration-200'>
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className='justify-center items-center xs:flex text-center'>
                        <h1 className='font-bold font-sans text-xl mb-2'>Links</h1>
                        <ul className='text-white font-medium font-sans flex flex-col'>
                            <li>
                                <a href="#1">About</a>
                            </li>
                            <li>
                                <a href="#3">Features</a>
                            </li>
                            <li>
                                <a href="#4">Testimonials</a>
                            </li>
                            <li>
                                <a href="/login">Login</a>
                            </li>
                        </ul>
                    </div>
                    <div className='justify-center items-center xs:flex text-center pb-4'>
                        <h1 className='font-bold font-sans text-xl
                      mb-2'>Contact Us</h1>
                        <div className='flex items-center justify-center pb-1 gap-2 font-thin'>
                            <FaLocationDot className='text-lg text-white' />
                            <p>Bucharest, Romania</p>
                        </div>
                        <div className='flex items-center justify-center pb-1 gap-2 font-thin'>
                            <MdAddIcCall className='text-lg text-white font-thin' />
                            <p>(+40) 0767 555 432</p>
                        </div>
                        <div className='flex items-center justify-center pb-1 gap-2 font-thin'>
                            <IoIosMailUnread className='text-xl translate-y-0.5 text-white' />
                            <p>cctask@gmail.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Footer