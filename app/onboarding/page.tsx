"use client";

import { useEffect, useState } from "react";
import { useAuth, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import OnboardingForm from "@/app/components/forms/OnboardingForm";

export default function OnboardingPage() {
  const { isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancel = false;

    (async () => {
      if (!isSignedIn) {
        setChecking(false);
        return;
      }

      try {
        const template = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE || "user-profile-api";
        const token = await getToken({ template }).catch(() => null);

        const base = process.env.NEXT_PUBLIC_PROFILE_API_BASE!;
        const res = await fetch(`${base}/profiles/me`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: "no-store",
        });
        const data = await res.json();

        if (cancel) return;

        // If profile already exists, skip onboarding
        if (res.ok && data?.profile) {
          router.replace("/match");
          return;
        }
      } finally {
        if (!cancel) setChecking(false);
      }
    })();

    return () => { cancel = true; };
  }, [isSignedIn, getToken, router]);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white text-black dark:bg-black dark:text-white">
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Complete your profile
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Help us tailor high-signal matches based on your background & interests.
          </p>

          <div className="mt-8 rounded-2xl border border-neutral-200 bg-white shadow-sm p-6 md:p-8 dark:border-neutral-800 dark:bg-neutral-950">
            <SignedIn>
              {checking ? (
                <div className="py-16 text-center text-neutral-600 dark:text-neutral-300">
                  Checking your account…
                </div>
              ) : (
                <OnboardingForm />
              )}
            </SignedIn>

            <SignedOut>
              <div className="flex flex-col items-center justify-center py-16">
                <p className="mb-4 text-neutral-700 dark:text-neutral-300">
                  Please sign in to continue.
                </p>
                <SignInButton mode="modal" fallbackRedirectUrl="/post-auth">
                  <button className="h-11 rounded-lg border border-black bg-black px-6 text-white transition hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-200">
                    Sign in with LinkedIn
                  </button>
                </SignInButton>
              </div>
            </SignedOut>
          </div>
        </div>
      </div>
    </main>
  );
}
