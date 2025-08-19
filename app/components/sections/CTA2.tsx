"use client";

export default function CTA2() {
  return (
    <div className="relative w-full max-w-4xl overflow-hidden rounded-[40px] border border-neutral-200 bg-white p-6 text-black sm:p-10 md:p-16">
      {/* subtle mono backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/2 hidden aspect-square h-[800px] -translate-y-1/2 rounded-full opacity-10 blur-[120px] md:block"
        style={{ background: "radial-gradient(circle at center, #000, transparent 65%)" }}
      />

      <div className="relative z-10">
        <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl md:mb-4 md:text-5xl">
          Meet verified professionals, instantly.
        </h1>
        <p className="mb-6 max-w-xl text-base text-neutral-700 sm:text-lg md:mb-8">
          Free filters: <strong>Skill</strong>, <strong>Role</strong>, <strong>Country/Timezone</strong>, <strong>Interest Tags</strong>.
          Upgrade for company & experience filters. Sign in with LinkedIn for trust.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
          <a
            href="/auth/linkedin"
            className="flex w-full items-center justify-between rounded-full bg-black px-5 py-3 text-white transition hover:bg-neutral-800 sm:w-[260px]"
          >
            <span className="font-medium">Verify with LinkedIn</span>
            <span className="h-5 w-5 flex-shrink-0 rounded-full bg-white" />
          </a>

          <a
            href="/match"
            className="flex w-full items-center justify-between rounded-full border border-neutral-300 px-5 py-3 text-black transition hover:bg-neutral-100 sm:w-[260px]"
          >
            <span className="font-medium">Join a live match</span>
            <span className="h-5 w-5 flex-shrink-0 rounded-full border border-neutral-300" />
          </a>
        </div>

        <div className="mt-5 text-sm text-neutral-600">
          Prefer details first? <a href="#pricing" className="underline underline-offset-4">See pricing</a> ·{" "}
          <a href="#about" className="underline underline-offset-4">How it works</a>
        </div>
      </div>
    </div>
  );
}
