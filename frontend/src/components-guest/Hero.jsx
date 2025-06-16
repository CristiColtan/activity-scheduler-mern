import { ArrowRight, Users, CheckCircle, Star } from "lucide-react";
import tasksGif from "../assets/videobg.mp4";

import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section id="3" className="min-h-screen bg-white relative overflow-hidden">
      {/*gradient*/}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
      <div className="relative z-10 container mx-auto px-8 pt-32 pb-16">
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 
        items-center min-h-[80vh]"
        >
          {/*left*/}
          <div className="space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-sky-100 text-sky-800 rounded-full text-sm font-medium">
              TASK MANAGEMENT & PRODUCTIVITY
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Simplify your day!
                <span className="block text-sky-900 mt-2">
                  Manage your business
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Organize your tasks, collaborate with your team and never miss a
                deadline again!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  navigate("/register");
                }}
                className="flex items-center justify-center bg-sky-900 hover:bg-sky-800 text-white px-8 py-4 text-lg font-semibold
               shadow-xl hover:shadow-2xl transition-all duration-300 group rounded-md"
              >
                Get started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  const section = document.getElementById("2");
                  if (section) {
                    section.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="border-2 border-sky-900 text-sky-900 hover:bg-sky-50
               px-8 py-4 text-lg font-semibold transition-all duration-300 rounded-md"
              >
                Learn More
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg mt-12">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="flex items-center justify-center text-sky-900 mb-2">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-bold text-sky-900">100+</div>
                  <div className="text-sm text-gray-600 font-medium">
                    Active Users
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-center text-sky-900 mb-2">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-bold text-sky-900">98%</div>
                  <div className="text-sm text-gray-600 font-medium">
                    Users satisfied
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-center text-sky-900 mb-2">
                    <Star className="h-6 w-6" />
                  </div>
                  <div className="text-3xl font-bold text-sky-900">4.9</div>
                  <div className="text-sm text-gray-600 font-medium">
                    User Rating
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/*right*/}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-sky-900 to-sky-800 rounded-3xl p-8 shadow-2xl">
              <div className="absolute top-4 left-4 w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="absolute top-4 left-10 w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="absolute top-4 left-16 w-3 h-3 bg-green-400 rounded-full"></div>

              {/*GIF*/}
              <div className="bg-gray-900 rounded-2xl overflow-hidden mt-6">
                <video
                  src={tasksGif}
                  alt="CCTask Demo"
                  className="w-full h-auto object-cover"
                  autoPlay
                  muted
                  loop
                />
              </div>

              {/*<div className="absolute -top-4 -right-4 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Live Demo
                  </span>
                </div>
              </div>*/}

              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-sky-900" />
                  <span className="text-sm font-medium text-gray-700">
                    Real-time Sync
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*<div className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="container mx-auto px-8">
          <p className="text-center text-gray-500 text-sm font-medium mb-8">
            Trusted by teams worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-8 w-24 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>*/}
    </section>
  );
};

export default Hero;
