"use client";

import { motion } from "framer-motion";

export default function ContactSection() {
  return (
    <motion.section
      id="contact"
      className="scroll-mt-24 py-20 px-4 text-center sm:px-6 md:px-8"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <h2 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-10">Contact Us</h2>
      <form className="max-w-md mx-auto space-y-4">
        <input
          type="text"
          placeholder="Name"
          className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-yellow-400 focus:outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-yellow-400 focus:outline-none"
        />
        <textarea
          placeholder="Message"
          rows={4}
          className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-yellow-400 focus:outline-none resize-none"
        />
        <button
          type="button"
          className="w-full bg-yellow-400 text-black py-3 rounded-lg font-semibold hover:bg-yellow-500 transition-colors"
        >
          Send Message
        </button>
      </form>
    </motion.section>
  );
}
