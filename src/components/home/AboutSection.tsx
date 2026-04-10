import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <motion.section
      className="py-20 px-4 sm:px-6 md:px-8"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-12 md:flex-row md:items-center">
        <div className="flex-1">
          <Image
            src="https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg"
            alt="About Us"
            width={400}
            height={300}
            className="w-full rounded-lg"
          />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            About <span className="text-yellow-400">Us</span>
          </h2>
          <p className="text-gray-300 leading-relaxed text-base sm:text-lg">
            We craft premium sandwiches with passion, fresh ingredients, and bold flavors.
            Our commitment to quality and taste has made us a favorite among food lovers.
            Every sandwich is prepared with care, using the finest ingredients to deliver
            an unforgettable dining experience.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
