"use client";
import Header from "@/app/components/layout/Header";
import FooterGlow from "@/app/components/layout/FooterGlow";
import { Button } from "@/app/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Toaster } from "@/app/components/ui/toaster";
import { Toaster as Sonner } from "@/app/components/ui/sonner";
import { TooltipProvider } from "@/app/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import Earth from "@/app/components/ui/globe";
import { SparklesCore } from "@/app/components/ui/sparkles";
import ContactUs1 from "@/app/components/sections/ContactUs1";
import AboutUs1 from "@/app/components/sections/AboutUs1"; // ← NEW

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const queryClient = new QueryClient();

// ---- Static content for Omegal for Professionals ----
const HERO = {
  title: "Omegal for Professionals",
  subtitle:
    "One-tap video chats with verified professionals. Filter by Role, Skills, Country/Timezone, and Interest Tags. LinkedIn-verified profiles for higher signal.",
  ctaPrimary: "Start Free",
  ctaSecondary: "See Pricing",
};

const FEATURES: { title: string; items: string[] }[] = [
  {
    title: "Verified Onboarding",
    items: [
      "LinkedIn OAuth verification",
      "Auto-filled profile basics (name, headline, role)",
      "Fraud and throwaway account guardrails",
    ],
  },
  {
    title: "Free Filters",
    items: [
      "Skill (e.g., Python, React, AWS)",
      "Role (e.g., Backend Dev, Data Scientist, PM)",
      "Country / Timezone",
      "Interest Tags (e.g., AI, Web3, Competitive Coding)",
    ],
  },
  {
    title: "Paid Filters (Pro/Business)",
    items: [
      "Company filter & seniority",
      "Experience range & last active",
      "AND/combination skill queries",
      "Priority ranking & delivery",
    ],
  },
  {
    title: "Real-Time Matching",
    items: [
      "Bucket ladder: ROLE_CTRY → ROLE → TZ → CTRY → ANY",
      "Jaccard-based skill overlap scoring",
      "Anti-repeat & short-ban after skip/leave",
      "Low-latency WebRTC setup",
    ],
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    cadence: "/mo",
    highlight: false,
    features: [
      "LinkedIn verification",
      "Filters: Skill, Role, Country/Timezone, Interest Tags",
      "Randomized match delivery",
      "Standard queue",
    ],
  },
  {
    name: "Pro",
    price: "$15",
    cadence: "/mo",
    highlight: true,
    features: [
      "All Free features",
      "Filters: Company, Experience, Seniority, Last Active",
      "Priority ranking/boost",
      "Conversation unlocks & notes",
    ],
  },
  {
    name: "Business",
    price: "Custom",
    cadence: "",
    highlight: false,
    features: [
      "SSO/SAML, admin controls",
      "Team analytics & credits",
      "Custom buckets & routing",
      "SLA & premium support",
    ],
  },
];

const Index = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <div id="home" className="bg-white text-black dark:bg-black dark:text-white">
            <Header />

            <main>
              {/* HERO */}
              <section id="hero" className="relative overflow-hidden pt-28 md:pt-36">
                <div className="container mx-auto px-6">
                  <motion.div
                    className="mx-auto max-w-3xl text-center"
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.5 }}
                  >
                    <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                      {HERO.title}
                    </h1>
                    <p className="mt-5 text-lg text-neutral-600 dark:text-neutral-300 md:text-xl">
                      {HERO.subtitle}
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                      <Button
                        size="lg"
                        asChild
                        className="h-11 rounded-lg bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                      >
                        <a href="#contact">{HERO.ctaPrimary}</a>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        asChild
                        className="h-11 rounded-lg border-black text-black hover:bg-neutral-100 dark:border-white dark:text-white dark:hover:bg-neutral-900"
                      >
                        <a href="#pricing">{HERO.ctaSecondary}</a>
                      </Button>
                    </div>
                  </motion.div>

                  {/* Globe */}
                  <div className="mt-10 flex justify-center">
                    <div className="relative w-full max-w-[640px] aspect-[4/3] bg-white p-2 dark:border-neutral-800 dark:bg-neutral-950">
                      <div className="absolute inset-0">
                        <Earth
                          baseColor={[1, 1, 1]}
                          markerColor={[0.2, 0.2, 0.2]}
                          glowColor={[0.9, 0.9, 0.9]}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Trusted strip */}
                  <div className="mx-auto max-w-4xl">
                    <div className="text-center text-2xl text-black dark:text-white md:text-3xl">
                      <span>Trusted by verified professionals.</span>
                      <br />
                      <span>Built for high-signal networking.</span>
                    </div>
                  </div>
                </div>
              </section>
               {/* ABOUT — integrated */}
              <section id="about" className="scroll-mt-24 py-16">
                <div className="container mx-auto px-6">
                  <AboutUs1 />
                </div>
              </section>

              {/* FEATURES */}
              <section id="features" className="scroll-mt-24 py-16">
                <div className="container mx-auto px-6">
                  <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-semibold md:text-4xl">Why Omegal for Professionals</h2>
                    <p className="mt-3 text-neutral-600 dark:text-neutral-300">
                      Quality matches, high intent, minimal friction.
                    </p>
                  </div>

                  <div className="mt-10 grid gap-6 md:grid-cols-2">
                    {FEATURES.map((group) => (
                      <div
                        key={group.title}
                        className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
                      >
                        <h3 className="text-lg font-semibold">{group.title}</h3>
                        <ul className="mt-4 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
                          {group.items.map((f) => (
                            <li key={f} className="flex items-start gap-2">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 text-black dark:text-white" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

             

              {/* PRICING */}
              <section id="pricing" className="scroll-mt-24 py-20">
                <div className="container mx-auto px-6">
                  <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-semibold md:text-4xl">Simple, transparent pricing</h2>
                    <p className="mt-3 text-neutral-600 dark:text-neutral-300">
                      Start free. Upgrade for advanced filters and priority routing.
                    </p>
                  </div>

                  <div className="mt-12 grid gap-6 md:grid-cols-3">
                    {PRICING.map((tier) => (
                      <div
                        key={tier.name}
                        className={`rounded-2xl border p-6 shadow-sm transition bg-white dark:bg-neutral-950 ${
                          tier.highlight
                            ? "border-black ring-2 ring-black dark:border-white dark:ring-white"
                            : "border-neutral-200 hover:shadow-md dark:border-neutral-800"
                        }`}
                      >
                        <h3 className="text-xl font-semibold">{tier.name}</h3>
                        <div className="mt-2 text-3xl font-bold">
                          {tier.price}
                          <span className="text-sm font-normal text-neutral-600 dark:text-neutral-400">
                            {tier.cadence}
                          </span>
                        </div>
                        <ul className="mt-4 space-y-2 text-sm">
                          {tier.features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-neutral-800 dark:text-neutral-200">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 text-black dark:text-white" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                        <Button
                          className={`mt-6 w-full h-11 rounded-lg ${
                            tier.highlight
                              ? "bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                              : "border-black text-black hover:bg-neutral-100 dark:border-white dark:text-white dark:hover:bg-neutral-900"
                          }`}
                          variant={tier.highlight ? "default" : "outline"}
                        >
                          {tier.name === "Business" ? "Contact Sales" : "Choose Plan"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* CONTACT */}
              <section id="contact" className="scroll-mt-24 py-16">
                <div className="container mx-auto px-6">
                  <ContactUs1 />
                </div>
              </section>
            </main>

            <FooterGlow />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default Index;
