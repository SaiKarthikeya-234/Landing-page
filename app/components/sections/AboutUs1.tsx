"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Spotlight from "@/app/components/ui/spotlight";
import CardHoverEffect from "@/app/components/ui/pulse-card";
import { Globe, Users, Heart, Lightbulb, Sparkles, Rocket, Target } from "lucide-react";

interface AboutUsProps {
  title?: string;
  subtitle?: string;
  mission?: string;
  vision?: string;
  values?: Array<{
    title: string;
    description: string;
    icon: keyof typeof iconComponents;
  }>;
  className?: string;
}

const iconComponents = {
  Users,
  Heart,
  Lightbulb,
  Globe,
  Sparkles,
  Rocket,
  Target,
};

// ---- Omegal for Professionals copy (monochrome) ----
const aboutData: Required<AboutUsProps> = {
  title: "About Omegal for Professionals",
  subtitle:
    "Real-time, LinkedIn-verified video matching for builders, mentees, mentors, and hiring managers—signal over noise.",
  mission:
    "Enable serendipitous, high-signal conversations between verified professionals. With free filters (Skill, Role, Country/Timezone, Interest Tags) and optional paid filters (Company, Experience, Seniority, Last Active), we keep matches relevant, fast, and safe.",
  vision:
    "Be the fastest path from intent to impact: meet a mentor, find a co-founder, get career advice, or recruit—all in minutes. Global, privacy-first, and fair by design.",
  values: [
    {
      title: "Trust, Not Guesswork",
      description:
        "LinkedIn OAuth verification and basic fraud checks keep profiles authentic and raise the quality bar.",
      icon: "Users",
    },
    {
      title: "Signal Over Noise",
      description:
        "Bucket ladder matching (ROLE_CTRY → ROLE → TZ → CTRY → ANY) plus skill-overlap scoring prioritizes relevance.",
      icon: "Target",
    },
    {
      title: "Respect & Safety",
      description:
        "Short bans after skips/leaves, reporting hooks, and privacy-first defaults ensure a respectful experience.",
      icon: "Heart",
    },
    {
      title: "Speed & Reliability",
      description:
        "Low-latency WebRTC setup, Redis-backed queues, and resilient matching deliver smooth connections.",
      icon: "Rocket",
    },
    {
      title: "Learning & Mentorship",
      description:
        "Modes for peers, mentors, and mentees encourage knowledge exchange across levels and domains.",
      icon: "Lightbulb",
    },
    {
      title: "Global by Default",
      description:
        "Timezone/country filters help you meet locally or worldwide—your choice, your context.",
      icon: "Globe",
    },
    {
      title: "Craft & Care",
      description:
        "We iterate in the open and sweat the details so every session feels respectful, useful, and fast.",
      icon: "Sparkles",
    },
  ],
  className: "relative overflow-hidden py-20",
};

/** Minimal B/W card used for Mission & Vision */
function MonoCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-10 shadow-sm transition-shadow dark:border-neutral-800 dark:bg-neutral-950">
      {/* hairline highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/20 to-transparent dark:via-white/20"
      />
      {/* soft vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(280px_180px_at_top,black,transparent)]"
      />
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-black/5 dark:bg-white/10">
        {icon}
      </div>
      <h2 className="mb-3 text-3xl font-bold">{title}</h2>
      <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">{body}</p>
    </div>
  );
}

export default function AboutUs1() {
  const missionRef = useRef<HTMLDivElement | null>(null);
  const valuesRef = useRef<HTMLDivElement | null>(null);
  const missionInView = useInView(missionRef, { once: true, amount: 0.3 });
  const valuesInView = useInView(valuesRef, { once: true, amount: 0.3 });

  return (
    <section className="relative w-full overflow-hidden bg-white text-black pt-20 dark:bg-black dark:text-white">
      {/* Subtle, theme-aware monochrome spotlight */}
      <Spotlight
        gradientFirst="radial-gradient(68% 69% at 55% 31%, rgba(128,128,128,0.10) 0, rgba(128,128,128,0.05) 50%, rgba(128,128,128,0) 80%)"
        gradientSecond="radial-gradient(50% 50% at 50% 50%, rgba(128,128,128,0.10) 0, rgba(128,128,128,0.05) 80%, transparent 100%)"
        gradientThird="radial-gradient(50% 50% at 50% 50%, rgba(128,128,128,0.08) 0, rgba(128,128,128,0.08) 80%, transparent 100%)"
      />

      <div className="relative z-10 container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            {aboutData.title}
          </h1>
          <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-300">
            {aboutData.subtitle}
          </p>
        </motion.div>

        {/* Mission & Vision (now monochrome cards) */}
        <div ref={missionRef} className="relative mx-auto mb-24 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={missionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="relative z-10 grid gap-12 md:grid-cols-2"
          >
            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}>
              <MonoCard
                icon={<Rocket className="h-8 w-8 text-black dark:text-white" />}
                title="Our Mission"
                body={aboutData.mission}
              />
            </motion.div>

            <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}>
              <MonoCard
                icon={<Target className="h-8 w-8 text-black dark:text-white" />}
                title="Our Vision"
                body={aboutData.vision}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Values */}
        <div ref={valuesRef} className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={valuesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Core Values</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-600 dark:text-neutral-300">
              Principles that guide how we match, protect, and empower professionals.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {aboutData.values.map((value, index) => {
              const IconComponent = iconComponents[value.icon];
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={valuesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: index * 0.06 + 0.1, ease: "easeOut" }}
                  whileHover={{ y: -5, scale: 1.01 }}
                  className="filter grayscale"
                >
                  <CardHoverEffect
                    icon={<IconComponent className="h-6 w-6 text-black dark:text-white" />}
                    title={value.title}
                    description={value.description}
                    variant="blue"
                    glowEffect={false}
                    size="lg"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
