import React from "react";
import { RefreshCw } from "lucide-react";

import "../styles/Banner.css";

const Banner = () => {
  return (
    <section className="py-16 px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="overflow-hidden shadow-2xl border-0 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
          <div className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
              <div className="p-12 lg:order-2">
                <div className="flex justify-center mb-8">
                  <div
                    className="p-6 bg-gradient-to-br 
                                from-sky-900 to-sky-600 text-white rounded-full shadow-xl"
                  >
                    <RefreshCw className="h-20 w-20 text-white animate-spin-slow" />
                  </div>
                </div>
              </div>
              <div className="p-12 border-r-4 border-b-4 border-sky-900">
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6 font-serif">
                  Real-time Synchronization!
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Any changes made by a user are instantly reflected across all
                  connected devices and users. Stay in sync, always.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
