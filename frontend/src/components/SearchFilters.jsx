import React from 'react'

const SearchFilters = () => {
    return (
        <div className='grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr] gap-5 bg-white p-2 shadow-lg rounded'>
            <div className=''>
                <h2 className='text-lg font-serif mb-1 ml-4'>Priority</h2>
                <div className='flex flex-wrap gap-4 font-serif'>
                    <div className='flex items-center gap-1 ml-1'>
                        <input className='size-4' type="checkbox"></input>
                        <span>any</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <input className='size-4' type="checkbox"></input>
                        <span>high</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <input className='size-4' type="checkbox"></input>
                        <span>medium</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <input className='size-4' type="checkbox"></input>
                        <span>normal</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <input className='size-4' type="checkbox"></input>
                        <span>low</span>
                    </div>
                </div>
            </div>
            <div>
                <h2 className='text-lg font-serif mb-1 ml-4'>Status</h2>
                <div className='flex flex-wrap gap-4 font-serif'>
                    <div className='flex items-center gap-1 ml-1'>
                        <input className='size-4' type="checkbox"></input>
                        <span className=''>any</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <input className='size-4' type="checkbox"></input>
                        <span>completed</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <input className='size-4' type="checkbox"></input>
                        <span>to-do</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <input className='size-4' type="checkbox"></input>
                        <span>in progress</span>
                    </div>
                </div>
            </div>
            <div className='flex items-center justify-between gap-3 flex-wrap'>
                <button className='px-3 py-2 rounded-lg
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium'>
                    Search
                </button>
                <button className='px-3 py-2 rounded-lg
                                bg-blue-700 text-white font-sans
                                hover:bg-blue-500 transition duration-200
                                font-medium'>
                    <span>+ Create Task</span>
                </button>
            </div>
        </div>
    )
}

export default SearchFilters