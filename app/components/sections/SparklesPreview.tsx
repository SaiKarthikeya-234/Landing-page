"use client";
import React from "react";
import { SparklesCore } from "@/app/components/ui/sparkles";

export default function SparklesPreview() {
  return (
    <div className="h-[32rem] w-full bg-black dark:bg-black flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10">
      <h2 className="md:text-7xl text-3xl lg:text-8xl font-bold text-center text-white relative z-20">
        Omegal for Professionals
      </h2>

      <div className="w-[40rem] max-w-full h-40 relative mt-6">
        {/* thin horizontal glow lines */}
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-white/60 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-white/60 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-white/70 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-white/70 to-transparent h-px w-1/4" />

        {/* sparkles */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />

        {/* radial mask to soften edges */}
        <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]" />
      </div>
    </div>
  );
}
