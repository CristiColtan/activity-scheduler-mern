import { FaLightbulb } from "react-icons/fa";
import { RiDiscountPercentFill } from "react-icons/ri";
import { MdWorkspacePremium } from "react-icons/md";

const ServiceData = [
  {
    title: "Easy to use!",
    content: "Intuitive interface!",
    description:
      "Navigation is straightforward and intuitive, with clearly labeled menu items and buttons. Users can easily find their way around the interface without needing to rely on instructions or help documentation.",
    icon: <FaLightbulb className="text-7xl" />,
    delay: "300",
  },
  {
    title: "Completly free!",
    content: "Our app is free!",
    description:
      "The application is entirely free of charge, with no hidden costs or premium features requiring payment.",
    icon: <RiDiscountPercentFill className="text-7xl" />,
    delay: "500",
  },
  {
    title: "Premium!",
    content: "Advanced functionalities!",
    description:
      "Automation features, such as task scheduling, workflow automation, and batch processing, help users save time and reduce manual effort.",
    icon: <MdWorkspacePremium className="text-7xl" />,
    delay: "700",
  },
];

const Services = () => {
  return (
    <section id="2" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4 font-serif">
            Why Choose CCTask?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the features that make task management effortless
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {ServiceData.map((data, index) => (
            <div
              className="group hover:shaow-2xl min-h-[180px] flex flex-col items-center
                                rounded-xl border-0 bg-gradient-to-br 
                                from-sky-900 to-sky-600 text-white
                                text-center text-2xl py-6 px-3 w-full mx-auto 
                                hover:scale-105 hover:-translate-y-2
                                transition-all duration-500 "
            >
              {data.icon}
              <br></br>
              <p className="font-serif">{data.content}</p>
              <br></br>
              <p className="text-sm font-thin">{data.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
