"use client";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function PostAuth() {
  const { isSignedIn, getToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let cancel = false;

    (async () => {
      if (!isSignedIn) {
        router.replace("/");
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

        if (!cancel) {
          if (res.ok && data?.profile) router.replace("/match");
          else router.replace("/onboarding");
        }
      } catch {
        if (!cancel) router.replace("/onboarding");
      }
    })();

    return () => { cancel = true; };
  }, [isSignedIn, getToken, router]);

  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="text-sm text-neutral-600 dark:text-neutral-300">
        Finishing sign-in…
      </div>
    </div>
  );
}
