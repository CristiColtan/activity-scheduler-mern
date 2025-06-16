import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate("/register");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <section id="1">
      <div
        className="fixed top-0 right-0 w-full z-50 
                bg-white/95 backdrop-blur-lg border-b
                border-gray-200 py-4 px-8"
      >
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 font-serif hover:scale-105 transition-transform duration-300 cursor-pointer">
                <a href="/guest">CCTask</a>
              </h1>
            </div>
            <div className="hidden md:block">
              <ul className="flex gap-8 text-base font-medium text-gray-700 items-center">
                <li className="hover:text-sky-900 transition-colors duration-200 cursor-pointer">
                  <button
                    onClick={() => {
                      const section = document.getElementById("1");
                      if (section) {
                        section.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    href="#1"
                  >
                    About
                  </button>
                </li>
                <li className="hover:text-sky-900 transition-colors duration-200 cursor-pointer">
                  <button
                    onClick={() => {
                      const section = document.getElementById("2");
                      if (section) {
                        section.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    Features
                  </button>
                </li>
                <li className="hover:text-sky-900 transition-colors duration-200 cursor-pointer">
                  <button
                    onClick={() => {
                      const section = document.getElementById("4");
                      if (section) {
                        section.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                  >
                    Testimonials
                  </button>
                </li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                className="text-sky-900 hover:bg-sky-50 font-medium px-4 py-2 rounded-md transition-colors"
                onClick={handleLoginClick}
              >
                Login
              </button>
              <button
                className="bg-sky-900 hover:bg-sky-700 text-white font-medium shadow-lg px-4 py-2 rounded-md transition-colors"
                onClick={handleRegisterClick}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Navbar;
