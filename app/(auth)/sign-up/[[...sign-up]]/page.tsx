"use client";

import Header from "@/app/components/layout/Header";
import FooterGlow from "@/app/components/layout/FooterGlow";
import { SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { SparklesCore } from "@/app/components/ui/sparkles";

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <Header />
      <main className="relative overflow-hidden">
        <div className="relative mx-auto max-w-2xl pt-28 md:pt-36">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 [mask-image:radial-gradient(50%_80%,white,transparent_85%)]">
            <SparklesCore id="signup-sparkles" background="transparent" particleDensity={280} className="h-full w-full" />
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.35 }}
            className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
          >
            <SignUp
              path="/sign-up"
              routing="path"
              afterSignUpUrl="/onboarding"
              signInUrl="/sign-in"
              appearance={{
                variables: { colorPrimary: "black" },
                elements: {
                  card: "bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-sm",
                  headerTitle: "text-xl font-semibold",
                  headerSubtitle: "text-sm text-neutral-600 dark:text-neutral-400",
                  socialButtons: "gap-3",
                  socialButtonsProviderIcon__linkedin: "text-black dark:text-white",
                  socialButtonsBlockButton:
                    "h-11 rounded-lg bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200",
                  dividerLine: "bg-neutral-200 dark:bg-neutral-800",
                  formFieldInput:
                    "bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800",
                  footerActionText: "text-neutral-600 dark:text-neutral-400",
                },
              }}
            />
          </motion.div>
        </div>
      </main>
      <div className="mt-16">
        <FooterGlow />
      </div>
    </div>
  );
}
