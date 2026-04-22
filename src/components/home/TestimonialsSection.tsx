"use client";

import { motion } from "framer-motion";

const testimonials = [
  { name: "John Doe", text: "Best sandwiches ever! Fresh and delicious.", rating: 5 },
  { name: "Jane Smith", text: "Amazing service and quality. Highly recommend!", rating: 5 },
  { name: "Mike Johnson", text: "Perfect for lunch. Will order again.", rating: 5 },
];

export default function TestimonialsSection() {
  return (
    <motion.section
      id="testimonials"
      className="scroll-mt-24 py-24 px-6 text-center"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <h2 className="text-4xl font-bold text-yellow-400 mb-12">Testimonials</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={testimonial.name}
            className="bg-gray-800 p-8 rounded-xl shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-300 mb-6 italic">"{testimonial.text}"</p>
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 bg-yellow-500 rounded-full mr-4 flex items-center justify-center text-black font-bold">
                {testimonial.name[0]}
              </div>
              <div className="text-left">
                <p className="font-semibold text-white">{testimonial.name}</p>
                <div className="flex text-yellow-500">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
