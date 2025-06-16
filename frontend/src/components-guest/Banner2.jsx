import React from "react";

import { MdOutlineDevicesOther } from "react-icons/md";

const Banner2 = () => {
  return (
    <section className="py-16 px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="overflow-hidden shadow-2xl border-0 bg-gradient-to-l from-gray-50 to-gray-100 rounded-xl">
          <div className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
              <div className="p-12 border-r-4 border-b-4 border-sky-900">
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6 font-serif">
                  Cross-Platform Compatibility!
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  The interface ensures optimal usability and readability across
                  all devices. Work seamlessly anywhere, anytime.
                </p>
              </div>
              <div className="p-12">
                <div className="flex justify-center mb-8">
                  <div
                    className="p-6 bg-gradient-to-br 
                                from-sky-900 to-sky-600 text-white rounded-full shadow-xl"
                  >
                    <MdOutlineDevicesOther className="h-20 w-20 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner2;
