"use client";

import { useEffect, useState } from "react";
import { SignedIn, SignedOut, RedirectToSignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import DeviceCheck from "@/app/components/RTC/DeviceCheck";

export default function MatchPage() {
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

        // If no profile yet, force onboarding
        if (!res.ok || !data?.profile) {
          router.replace("/onboarding");
          return;
        }
      } finally {
        if (!cancel) setChecking(false);
      }
    })();

    return () => { cancel = true; };
  }, [isSignedIn, getToken, router]);

  return (
    <>
      <SignedOut>
        <RedirectToSignIn redirectUrl="/post-auth" />
      </SignedOut>

      <SignedIn>
        {checking ? (
          <div className="min-h-[50vh] grid place-items-center text-neutral-600 dark:text-neutral-300">
            Loading…
          </div>
        ) : (
          <DeviceCheck />
        )}
      </SignedIn>
    </>
  );
}
