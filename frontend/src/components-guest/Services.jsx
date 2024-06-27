import React from 'react'

import { FaLightbulb } from "react-icons/fa"
import { RiDiscountPercentFill } from "react-icons/ri"
import { MdWorkspacePremium } from "react-icons/md"

import Wave2 from "../assets/soundwave.mp4"

const ServiceData = [
    {
        title: "Easy to use!",
        content: "Intuitive interface!",
        description: "Navigation is straightforward and intuitive, with clearly labeled menu items and buttons. Users can easily find their way around the interface without needing to rely on instructions or help documentation.",
        icon: <FaLightbulb className='text-7xl'/>,
        delay: "300",
    },
    {
        title: "Completly free!",
        content: "Our app is free!",
        description: "The application is entirely free of charge, with no hidden costs or premium features requiring payment.",
        icon: <RiDiscountPercentFill className='text-7xl'/>,
        delay: "500",
    },
    {
        title: "Premium!",
        content: "Advanced functionalities!",
        description: "Automation features, such as task scheduling, workflow automation, and batch processing, help users save time and reduce manual effort.",
        icon: <MdWorkspacePremium className='text-7xl'/>,
        delay: "700",
    }
]

const Services = () => {
    return (
    <section id="2">
        <div className='text-white'>
            <div className='container pt-4'>
                <div className='min-h-[510px]'>
                    <div className='grid grid-cols-1 pt-6 md:pt-0 sm:grid-cols-3 gap-6 relative z-48 pl-8 pr-8 md:-mr-28'>
                        {ServiceData.map((data, index) => (
                            <div data-aos="fade-up" data-aos-delay={data.delay}
                                className=' min-h-[180px] flex flex-col items-center
                                rounded-xl bg-sky-900/85 backdrop-blur-sm lg:w-[400px]
                                text-center text-2xl py-6 px-3 w-full mx-auto'>
                                {data.icon}
                                <br></br>
                                <p className='font-serif'>{data.content}</p>
                                <br></br>
                                <p className='text-sm font-thin'>{data.description}</p>
                            </div>
                        ))} 
                    </div>
                    <br></br>
                    <video autoPlay loop muted disablePictureInPicture
                        className='h-[200px] w-full object-cover rounded-full
                        mix-blend-difference translate-x-0 md:translate-x-12 -translate-y-16
                        xl:-translate-y-4 z-46 hidden sm:block lg:hidden
                        xl:hidden 2xl:hidden relative'>
                        <source src={Wave2} type="video/mp4"/>
                    </video>

                    {/*<img className='h-[200px] w-full object-cover
                        mix-blend-difference translate-x-4 md:translate-x-12 -translate-y-16
                        xl:-translate-y-4 z-46 hidden sm:block relative' 
                        src={Wave} alt=""></img>*/}

                    <div className='sm:hidden block'>
                      <br></br>
                      <br></br>
                    </div>
                </div>
            </div>
        </div>
    </section>
  )
}

export default Services