import React from 'react'

const Hero = () => {
    return (
        <section id="3">
            <div className='bg-white/20 h-full relative z-49 pl-8 pt-6'>
                <div className='h-full flex justify-center items-center p-4'>
                    <div className='container grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <div className='translate-y-60 space-y-4 pb-10'>
                            <h1 data-aos="fade-up" className='text-4xl lg:text-5xl font-bold font-serif'>
                                Simplify your day!</h1>
                            <p data-aos="fade-up" data-aos-delay="300" className='font-serif lg:text-xl lg:pr-52'>
                                Organize your tasks, collaborate with your team and never
                                miss a deadline again!
                            </p>
                        </div>
                        <div></div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Hero