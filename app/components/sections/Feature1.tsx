"use client";
import {
  ShieldCheck,
  Filter,
  Briefcase,
  Zap,
  Rocket,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "LinkedIn Verification",
    desc: "Sign in with LinkedIn to earn a verified badge and auto-fill trusted profile data.",
  },
  {
    icon: <Filter className="h-6 w-6" />,
    title: "Free Filters",
    desc: "Skill, Role, Country/Timezone, and Interest Tags—keep matches relevant without friction.",
  },
  {
    icon: <Briefcase className="h-6 w-6" />,
    title: "Pro Filters",
    desc: "Company, Experience, Seniority, and Last Active—unlock precise targeting when you need it.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Smart Matching Ladder",
    desc: "ROLE+Country → Role → Timezone → Country → Any, plus skill-overlap scoring for quality.",
  },
  {
    icon: <Rocket className="h-6 w-6" />,
    title: "Low-Latency Calls",
    desc: "WebRTC with resilient signaling for fast connects. Short bans after skip/leave reduce churn.",
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: "Privacy & Safety",
    desc: "No recordings by default, report/block controls, minimal PII, and encryption in transit.",
  },
];

export default function Feature1() {
  return (
    <section className="relative bg-white py-14 text-black">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <div className="relative mx-auto max-w-2xl sm:text-center">
          <div className="relative z-10">
            <h3 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Why Omegal for Professionals
            </h3>
            <p className="mt-3 text-base text-neutral-600">
              High-signal, LinkedIn-verified matching. Built for mentors, mentees, founders, and hiring teams.
            </p>
          </div>

          {/* subtle monochrome glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mx-auto h-44 max-w-xs blur-[110px]"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 40%, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 70%, transparent 100%)",
            }}
          />
        </div>

        <hr className="mx-auto mt-5 h-px w-1/2 bg-neutral-200" />

        <div className="relative mt-12">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item, idx) => (
              <li
                key={idx}
                className="transform-gpu space-y-3 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="w-fit transform-gpu rounded-full border border-neutral-300 bg-white p-4">
                  {item.icon}
                </div>
                <h4 className="text-lg font-semibold tracking-tight">{item.title}</h4>
                <p className="text-sm leading-relaxed text-neutral-700">{item.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
