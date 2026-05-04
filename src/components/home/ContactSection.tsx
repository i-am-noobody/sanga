"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus("Please fill in your name, email, and message.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus(payload.error ?? "Unable to send your message right now.");
        return;
      }

      setStatus("Message sent. We have saved it for the team to review.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      console.error("Contact form error:", error);
      setStatus("Unable to reach the server. Please try again shortly.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.section
      id="contact"
      className="scroll-mt-24 px-4 py-20 text-center sm:px-6 md:px-8"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="mx-auto grid max-w-5xl gap-6 item-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left shadow-[0_16px_40px_rgba(15,23,42,0.25)] backdrop-blur-sm sm:p-8">
          <h2 className="mb-3 text-3xl font-bold text-red-400 sm:text-4xl">Contact Us</h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-300/80 sm:text-base">
            Send us a message for catering, questions, or feedback. 
            We will review all messages and get back to you as soon as possible.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Name"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-white placeholder:text-slate-500 focus:border-red-400 focus:outline-none"
              />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-white placeholder:text-slate-500 focus:border-red-400 focus:outline-none"
              />
            </div>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Message"
              rows={5}
              className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-white placeholder:text-slate-500 focus:border-red-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-full bg-red-400 px-5 py-3.5 font-semibold text-black transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
            {status ? (
              <p className="rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm text-red-100">
                {status}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    </motion.section>
  );
}
