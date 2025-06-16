import { Star } from "lucide-react";

import Person1 from "../assets/person1.jpg";
import Person2 from "../assets/person2.jpg";

const TestimonialData = [
  {
    title: "Easy to use!",
    content: "Andrei",
    description:
      "CCTask mi-a organizat întreaga zi și m-a ajutat să îmi ating toate obiectivele!",
    icon: Person1,
    delay: "300",
    rating: 5,
  },
  {
    title: "Completly free!",
    content: "Ioana",
    description:
      "Aceasta este cea mai bună aplicație de management al sarcinilor pe care am folosit-o vreodată!",
    icon: Person2,
    delay: "300",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="4" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4 font-serif">
            Read what others have to say!
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of satisfied users
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {TestimonialData.map((data, index) => (
            <div
              key={index}
              className="group hover:shadow-2xl transition-all duration-500 
                     border-0 bg-gradient-to-br from-sky-900 to-sky-800 text-white
                     hover:scale-105 hover:-translate-y-2 rounded-xl"
            >
              <div className="p-8 text-center">
                <div className="mb-6">
                  <img
                    src={data.icon || "/placeholder.svg"}
                    alt={data.content}
                    className="h-20 w-20 mx-auto rounded-full border-4 border-sky-200 shadow-lg"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-4 font-serif text-sky-100">
                  {data.content}
                </h3>
                <p className="text-sky-100 mb-6 leading-relaxed italic min-h-[80px]">
                  "{data.description}"
                </p>
                <div className="flex justify-center gap-1">
                  {[...Array(data.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
