import React from 'react'

import { RiStarSFill } from "react-icons/ri";
import Person1 from "../assets/person1.jpg"
import Person2 from "../assets/person2.jpg"

const TestimonialData = [
    {
        title: "Easy to use!",
        content: "Andrei",
        description: "CCTask mi-a organizat întreaga zi și m-a ajutat să îmi ating toate obiectivele!",
        icon: Person1,
        delay: "300",
        rating: 5,
    },
    {
        title: "Completly free!",
        content: "Ioana",
        description: "Aceasta este cea mai bună aplicație de management al sarcinilor pe care am folosit-o vreodată!",
        icon: Person2,
        delay: "300",
        rating: 5,
    }
]

const Testimonials = () => {
    return (
        <section id="4">
            <div className='xl:translate-x-6 pb-12 pl-8 pr-8 relative lg:-translate-y-24 '>
                <div className='container banner-container bg-white'>
                    <div className='text-center'>
                        <h1 className='text-2xl lg:text-4xl mx-auto font-serif font-medium translate-y-4'>
                            Read what others have to say!
                        </h1>
                    <div className='flex flex-col max-w-5xl mx-auto'>
                        <div className='bg-white p-8 rounded-xl'>
                            <div className='grid grid-cols-1 pt-6 gap-6 relative z-48 pl-8 pr-8 md:pt-0 sm:grid-cols-2'>
                                {TestimonialData.map((data, index) => (
                                    <div data-aos={index === 1 ? "fade-right":"fade-left"}
                                    data-aos-delay={data.delay} 
                                    className=' min-h-[180px] lg:w-[400px] mx-auto
                                    flex flex-col items-center text-white
                                    rounded-xl bg-sky-900/85 backdrop-blur-sm
                                    text-center text-2xl py-6 px-3 w-full'>
                                        <img src={data.icon} alt="" className='h-24 w-32 mx-auto rounded-full pb-4'></img>
                                        <p className='font-serif pb-3'>{data.content}</p>
                                        <p className='text-sm font-thin pb-3 px-4'>
                                            {data.description}
                                        </p>
                                        <div className='flex '>
                                            <RiStarSFill></RiStarSFill>
                                            <RiStarSFill></RiStarSFill> 
                                            <RiStarSFill></RiStarSFill>
                                            <RiStarSFill></RiStarSFill> 
                                            <RiStarSFill></RiStarSFill>  
                                        </div>
                                    </div>
                                ))}   
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  )
}

export default Testimonials