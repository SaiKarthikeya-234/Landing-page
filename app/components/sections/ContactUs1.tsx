"use client";
import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import { SparklesCore } from "@/app/components/ui/sparkles";
import { Label } from "@/app/components/ui/label";
import { Check, Loader2 } from "lucide-react";

export default function ContactUs1() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(formRef, { once: true, amount: 0.3 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // submit to your API here
      await new Promise((r) => setTimeout(r, 800));
      setName("");
      setEmail("");
      setMessage("");
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-white text-black dark:bg-black dark:text-white py-16 md:py-24">
      {/* subtle mono blobs */}
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-[420px] w-[420px] rounded-full opacity-10 blur-[120px] dark:hidden"
        style={{ background: "radial-gradient(circle at center, #000, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-20 hidden h-[280px] w-[280px] rounded-full opacity-10 blur-[100px] dark:block"
        style={{ background: "radial-gradient(circle at center, #fff, transparent 70%)" }}
      />

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
          <div className="grid md:grid-cols-2">
            {/* Left: Form */}
            <div className="relative p-6 md:p-10" ref={formRef}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative flex w-full items-baseline gap-2"
              >
                <h2 className="mb-2 text-4xl font-extrabold tracking-tight md:text-5xl">
                  Contact <span className="italic">Us</span>
                </h2>

                {/* sparkles: light */}
                <div className="absolute inset-x-0 top-0 block h-24 w-full dark:hidden">
                  <SparklesCore
                    id="contact-sparkles-light"
                    background="transparent"
                    minSize={0.6}
                    maxSize={1.4}
                    particleDensity={400}
                    className="pointer-events-none h-full w-full"
                    particleColor="#000000"
                  />
                </div>
                {/* sparkles: dark */}
                <div className="absolute inset-x-0 top-0 hidden h-24 w-full dark:block">
                  <SparklesCore
                    id="contact-sparkles-dark"
                    background="transparent"
                    minSize={0.6}
                    maxSize={1.4}
                    particleDensity={400}
                    className="pointer-events-none h-full w-full"
                    particleColor="#FFFFFF"
                  />
                </div>
              </motion.div>

              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                onSubmit={handleSubmit}
                className="mt-8 space-y-6"
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      required
                      className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                    />
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                    />
                  </motion.div>
                </div>

                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you need…"
                    required
                    className="h-40 resize-none bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-black dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                  />
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded-lg bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending…
                      </span>
                    ) : isSubmitted ? (
                      <span className="flex items-center justify-center">
                        <Check className="mr-2 h-4 w-4" />
                        Message Sent!
                      </span>
                    ) : (
                      <span>Send Message</span>
                    )}
                  </Button>
                </motion.div>
              </motion.form>
            </div>

            {/* Right: Mono product panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="relative my-8 flex items-center justify-center overflow-hidden pr-8"
            >
              <div className="flex flex-col items-center justify-center overflow-hidden">
                <article className="relative mx-auto h-[350px] min-h-60 max-w-[480px] overflow-hidden rounded-3xl border border-neutral-200 bg-white p-6 text-left text-black md:h-[450px] md:min-h-80 md:p-8 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white">
                  <h3 className="text-2xl font-bold leading-tight md:text-3xl">
                    Omegal for Professionals
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                    Real-time, LinkedIn-verified video matching for high-signal conversations.
                  </p>

                  <ul className="mt-5 space-y-2 text-sm text-neutral-800 dark:text-neutral-200">
                    <li>• Free filters: Skill, Role, Country/Timezone, Interest Tags</li>
                    <li>• Paid filters: Company, Experience, Seniority, Last Active</li>
                    <li>• Matching ladder: ROLE_CTRY → ROLE → TZ → CTRY → ANY</li>
                    <li>• Skill-overlap scoring & short bans after skip/leave</li>
                  </ul>

                  <div className="mt-6 rounded-lg border border-dashed border-neutral-300 p-4 text-xs text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
                    Have partnership, press, or enterprise questions? Send a note—we typically reply within 24 hours.
                  </div>
                </article>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
