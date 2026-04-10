import { motion } from "framer-motion";

export default function LocationSection() {
  return (
    <motion.section
      id="location"
      className="py-24 px-6 text-center"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <h2 className="text-4xl font-bold text-yellow-400 mb-12">Our Location</h2>
      <div className="max-w-4xl mx-auto mb-8">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b915b280b01823b%3A0x2f9494aaa0cd9318!2sSanga%20Sanga%20Mr%20Sanga!5e0!3m2!1sen!2snp!4v1773828102810!5m2!1sen!2snp"
          className="w-full h-96 rounded-lg"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="bg-white text-black p-6 rounded-lg max-w-2xl mx-auto flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <p className="text-lg font-semibold">Woolloongabba, Brisbane</p>
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=Brisbane"
          target="_blank"
          rel="noreferrer"
          className="bg-yellow-400 text-black px-6 py-3 rounded-full font-semibold hover:bg-yellow-500 transition-colors"
        >
          Get Directions
        </a>
      </div>
    </motion.section>
  );
}
