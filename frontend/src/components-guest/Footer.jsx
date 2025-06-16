import { MapPin, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-400 to-gray-500 text-white py-16 px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
              Organize your life!
            </h3>
            <p className="text-gray-700 mb-6">
              Get the{" "}
              <span className="text-white font-semibold">newest updates</span>{" "}
              on e-mail!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-200 border border-gray-300 text-gray-800 
               px-4 py-2 rounded-md focus:outline-none focus:ring-2 
               focus:ring-white flex-1"
              />
              <button
                className="bg-gray-300 hover:bg-gray-200 text-gray-800 
               font-medium px-4 py-2 rounded-md transition-colors duration-200"
              >
                Subscribe
              </button>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">Links</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#1"
                  className="text-white hover:text-gray-200 
                                      transition-colors duration-200 font-medium"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#2"
                  className="text-white hover:text-gray-200 
                                      transition-colors duration-200 font-medium"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#4"
                  className="text-white hover:text-gray-200 
                                      transition-colors duration-200 font-medium"
                >
                  Testimonials
                </a>
              </li>
              <li>
                <a
                  href="/login"
                  className="text-white hover:text-gray-200 
                                      transition-colors duration-200 font-medium"
                >
                  Login
                </a>
              </li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              Contact Us
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <MapPin className="h-5 w-5 text-white" />
                <span className="text-gray-700">Bucharest, Romania</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Phone className="h-5 w-5 text-white" />
                <span className="text-gray-700">(+40) 0767 555 432</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Mail className="h-5 w-5 text-white" />
                <span className="text-gray-700">cctask@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-300 mt-12 pt-8 text-center">
          <p className="text-gray-700">© 2024 CCTask. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
