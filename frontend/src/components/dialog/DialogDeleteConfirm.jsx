import React from 'react'
import clsx from 'clsx'
import {Dialog, DialogTitle} from '@headlessui/react' 

import { FaQuestion } from "react-icons/fa";

import MyModal from '../MyModal.jsx'
  
export const DialogDeleteConfirm = ({ open, setOpen, onClick = () => { }, message}) => {
  return (
    <>
      <MyModal open={open} setOpen={setOpen}>
        <div className='py-4 w-full flex flex-col gap-4 items-center justify-center'>
          <DialogTitle as='h3'>
            <p className='p-3 rounded-full text-red-600 bg-red-200'>
              <FaQuestion className='text-5xl'/>
            </p>
          </DialogTitle>

          <p className='text-center text-black mt-1 font-serif md:text-lg text-base'>
            {message}
          </p>

          <div className='py-3 flex justify-between gap-4 bg-white w-auto'>
            <button className='px-6 py-2 rounded font-sans border-2 border-gray-400 bg-white ml-5
            hover:bg-gray-300 font-semibold' onClick={()=>setOpen(false)}>
              Cancel
            </button>
            <button className='px-6 py-2 rounded mr-5 font-sans font-semibold text-white bg-red-600
            hover:bg-red-400' onClick={onClick}>
              Delete
            </button>
          </div>
        </div>
      </MyModal>
    </>
    
  )
}

export default DialogDeleteConfirm;