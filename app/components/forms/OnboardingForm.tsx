"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Check, Loader2, XCircle, ChevronDown, X } from "lucide-react";

// ---------- Config ----------
const API_BASE =
  process.env.NEXT_PUBLIC_PROFILE_API_BASE || "http://localhost:4001"; // <-- no /api/v1

const JWT_TEMPLATE = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE || ""; // e.g. "user-profile-api"

// Backend enums (keep in sync with your Mongoose model)
const EXPERIENCE_LEVELS = [
  "Entry Level (0-2 years)",
  "Mid Level (2-5 years)",
  "Senior Level (5-10 years)",
  "Expert Level (10+ years)",
] as const;

const EMPLOYMENT_STATUS = ["student", "employee"] as const;

const COMMUNICATION_STYLE = [
  "Text chat only",
  "Video calls preferred",
  "Any format",
] as const;

const CONNECT_WITH = [
  "similar_experience",
  "more_experienced",
  "less_experienced",
  "any_experience",
  "similar_roles",
  "different_roles",
] as const;

const AVAILABILITY_DEFAULTS = [
  "Weekday mornings",
  "Weekday afternoons",
  "Weekday evenings",
  "Weekend mornings",
  "Weekend afternoons",
  "Weekend evenings",
] as const;

const GEO_PREFS = [
  "Local professionals only",
  "Same country",
  "Global connections",
  "Specific regions",
] as const;

// Multi-select option sources
const LANGUAGE_OPTIONS = [
  "JavaScript","TypeScript","Python","Java","C++","C#","Go","Rust","Swift","Kotlin","PHP","Ruby",
];

const TECH_OPTIONS = [
  "React","Angular","Vue.js","Node.js","Django","Spring",".NET","AWS","Azure","GCP","Docker","Kubernetes",
];

const INTEREST_OPTIONS = [
  "Web Development","Mobile Development","Machine Learning/AI","Cloud Computing","Blockchain","IoT","Gaming","Fintech","Healthcare Tech","E-commerce","Startups","Open Source",
];

const GOAL_OPTIONS = [
  "Network with peers","Find mentors","Mentor others","Discuss technical topics","Share knowledge","Seek career advice","Collaborate on projects","Find co-founders","Casual professional chat",
];

const TOPIC_OPTIONS = [
  "Technical discussions","Career advice","Industry trends","Startup ideas","Code reviews","Best practices","Tool recommendations","Project collaboration",
];

// ---------- Types ----------
type Agreements = {
  conduct: boolean;
  respect: boolean;
  understand: boolean;
  terms: boolean;
};

type Links = {
  projects?: string;
  linkedin?: string;
  github?: string;
  website?: string;
};

type Payload = {
  // Personal
  fullName: string;
  email: string;
  username: string;
  profilePictureUrl?: string;

  // Employment
  employmentStatus: (typeof EMPLOYMENT_STATUS)[number];

  // Background
  primaryProfession: string;
  experienceLevel: (typeof EXPERIENCE_LEVELS)[number];
  company?: string;
  jobTitle?: string;

  // Skills & interests
  languages: string[];
  technologies: string[];
  interests: string[];

  // Platform preferences
  platformGoals: string[];
  preferredTopics: string[];

  // Matching
  connectWith: (typeof CONNECT_WITH)[number][];
  geoPreference: (typeof GEO_PREFS)[number];
  specificRegions: string[];

  // Extra
  bio?: string;
  links?: Links;

  // Guidelines
  agreements: Agreements;

  // Optional verification
  companyEmail?: string;
  companyEmailVerified?: boolean;

  // Communication
  communicationStyle: (typeof COMMUNICATION_STYLE)[number];
  availability: string[];
  timeZone: string;
};

// ---------- Helpers ----------
function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

// Multi-select dropdown with search, select-all, clear, chips
function MultiSelect({
  label,
  options,
  values,
  onChange,
  className = "",
}: {
  label: string;
  options: string[];
  values: string[];
  onChange: (next: string[]) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter(o => o.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const isChecked = (opt: string) => values.includes(opt);

  const toggle = (opt: string) => {
    const set = new Set(values);
    set.has(opt) ? set.delete(opt) : set.add(opt);
    onChange(Array.from(set));
  };

  const clearAll = () => onChange([]);
  const selectAll = () => onChange(options.slice());

  const summary = values.length === 0
    ? "Select one or more"
    : values.length <= 2
      ? values.join(", ")
      : `${values.slice(0, 2).join(", ")} +${values.length - 2} more`;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <Label>{label}</Label>

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="mt-2 flex h-11 w-full items-center justify-between rounded-md border border-neutral-300 bg-background px-3 text-left text-sm dark:border-neutral-700"
      >
        <span className={`truncate ${values.length ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-500"}`}>
          {summary}
        </span>
        <ChevronDown className="h-4 w-4 opacity-70" />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-50 mt-2 w-full rounded-md border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-800 dark:bg-neutral-950"
        >
          {/* Search */}
          <input
            className="mb-2 h-9 w-full rounded-md border border-neutral-300 bg-background px-3 text-sm outline-none dark:border-neutral-700"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          {/* Options */}
          <div className="max-h-60 overflow-auto">
            {filtered.length ? (
              filtered.map((opt) => {
                const checked = isChecked(opt);
                return (
                  <label
                    key={opt}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(opt)}
                      className="h-4 w-4 accent-black dark:accent-white"
                    />
                    <span className="grow">{opt}</span>
                    {checked && <Check className="h-4 w-4" />}
                  </label>
                );
              })
            ) : (
              <div className="p-2 text-sm text-neutral-500">No matches</div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearAll}
                className="text-xs underline underline-offset-2"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={selectAll}
                className="text-xs underline underline-offset-2"
              >
                Select all
              </button>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Selected chips */}
      {values.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-300 px-2.5 py-1 text-xs text-neutral-800 dark:border-neutral-700 dark:text-neutral-200"
            >
              {v}
              <button
                type="button"
                onClick={() => toggle(v)}
                className="opacity-70 hover:opacity-100"
                aria-label={`Remove ${v}`}
                title={`Remove ${v}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OnboardingForm() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  const [username, setUsername] = useState("");
  const debouncedUsername = useDebounced(username, 350);
  const [usernameAvailable, setUsernameAvailable] = useState<
    "unknown" | "checking" | "yes" | "no"
  >("unknown");

  // Form state
  const [payload, setPayload] = useState<Payload>({
    fullName: "",
    email: "",
    username: "",
    profilePictureUrl: "",

    employmentStatus: "employee",

    primaryProfession: "",
    experienceLevel: "Entry Level (0-2 years)",
    company: "",
    jobTitle: "",

    languages: [],
    technologies: [],
    interests: [],

    platformGoals: [],
    preferredTopics: [],

    connectWith: [],
    geoPreference: "Global connections",
    specificRegions: [],

    bio: "",
    links: {},

    agreements: {
      conduct: false,
      respect: false,
      understand: false,
      terms: false,
    },

    companyEmail: "",
    companyEmailVerified: false,

    communicationStyle: "Any format",
    availability: [],
    timeZone:
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
        : "UTC",
  });

  // Prefill from Clerk
  useEffect(() => {
    if (!isLoaded || !user) return;
    const email =
      user.primaryEmailAddress?.emailAddress ??
      user.emailAddresses?.[0]?.emailAddress ??
      "";
    const fullName = user.fullName || [user.firstName, user.lastName].filter(Boolean).join(" ");
    const img = user.imageUrl || "";

    const base = (fullName || email || "user").toLowerCase().replace(/[^a-z0-9._-]/g, "");
    const suggestion = base || `user_${user.id?.slice(-6)}`;

    setPayload((p) => ({
      ...p,
      fullName,
      email,
      username: suggestion,
      profilePictureUrl: img,
      links: {
        ...p.links,
        linkedin:
          (user.publicMetadata?.linkedin as string | undefined) || p.links?.linkedin,
      },
    }));
    setUsername(suggestion);
  }, [isLoaded, user]);

  // Username availability (/profiles/availability/username/:username)
  useEffect(() => {
    const run = async () => {
      if (!debouncedUsername || debouncedUsername.length < 3) {
        setUsernameAvailable("unknown");
        return;
      }
      try {
        setUsernameAvailable("checking");
        const res = await fetch(
          `${API_BASE}/profiles/availability/username/${encodeURIComponent(
            debouncedUsername.toLowerCase()
          )}`
        );
        const json = await res.json();
        setUsernameAvailable(json.available ? "yes" : "no");
      } catch {
        setUsernameAvailable("unknown");
      }
    };
    run();
  }, [debouncedUsername]);

  // Simple toggler for availability/connectWith
  const toggleChip = (
    key: keyof Pick<Payload, "connectWith" | "availability">,
    value: string
  ) => {
    setPayload((p) => {
      const set = new Set(p[key] as string[]);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...p, [key]: Array.from(set) } as Payload;
    });
  };

  const canSubmit = useMemo(() => {
    const a = payload.agreements;
    const required =
      payload.fullName.trim() &&
      payload.email.trim() &&
      payload.username.trim() &&
      payload.primaryProfession.trim() &&
      payload.experienceLevel &&
      payload.employmentStatus &&
      payload.timeZone &&
      a.conduct &&
      a.respect &&
      a.understand &&
      a.terms &&
      usernameAvailable !== "no";
    return Boolean(required);
  }, [payload, usernameAvailable]);

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState(false);

  const onSubmit = async () => {
    setSubmitErr(null);
    setSubmitOk(false);
    if (!canSubmit) return;

    try {
      setSubmitting(true);

      // Use your actual Clerk JWT template name (via env)
      const token = await getToken(
        JWT_TEMPLATE ? { template: JWT_TEMPLATE } : undefined
      );

      if (!token) {
        setSubmitErr(
          JWT_TEMPLATE
            ? "Could not mint API token. Check your Clerk JWT template name."
            : "Not authenticated. Please sign in again."
        );
        setSubmitting(false);
        return;
      }

      // Normalize username
      const body: Payload = {
        ...payload,
        username: payload.username.toLowerCase(),
        profilePictureUrl: payload.profilePictureUrl || undefined,
        companyEmail: payload.companyEmail || undefined,
        bio: payload.bio?.trim() ? payload.bio.trim() : undefined,
        links: {
          projects: payload.links?.projects || undefined,
          linkedin: payload.links?.linkedin || undefined,
          github: payload.links?.github || undefined,
          website: payload.links?.website || undefined,
        },
      };

      const res = await fetch(`${API_BASE}/profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Request failed (${res.status})`);
      }

      setSubmitOk(true);
      router.push("/match");
    } catch (e: unknown) {
      const err = e as { message?: string };
      if (typeof err.message === "string" && err.message.includes("No JWT template exists")) {
        setSubmitErr(
          "JWT template missing. Create one in Clerk (e.g. 'user-profile-api') and set NEXT_PUBLIC_CLERK_JWT_TEMPLATE to that name."
        );
      } else {
        setSubmitErr(err.message || "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Personal */}
      <section>
        <h2 className="text-xl font-semibold">Personal information</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="fullName">Full name *</Label>
            <Input
              id="fullName"
              value={payload.fullName}
              onChange={(e) => setPayload({ ...payload, fullName: e.target.value })}
              placeholder="Your full name"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={payload.email}
              onChange={(e) => setPayload({ ...payload, email: e.target.value })}
              placeholder="name@company.com"
              className="mt-2"
            />
          </div>

          <div className="md:col-span-1">
            <Label htmlFor="username">Username *</Label>
            <div className="mt-2 flex items-center gap-2">
              <Input
                id="username"
                value={payload.username}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^a-z0-9._-]/gi, "");
                  setPayload({ ...payload, username: v });
                  setUsername(v);
                }}
                placeholder="unique-handle"
              />
              {usernameAvailable === "checking" && (
                <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
              )}
              {usernameAvailable === "yes" && (
                <Check className="h-4 w-4 text-green-600" />
              )}
              {usernameAvailable === "no" && (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Allowed: letters, numbers, dot, dash, underscore.
            </p>
          </div>

          <div className="md:col-span-1">
            <Label htmlFor="profilePictureUrl">Profile picture URL</Label>
            <Input
              id="profilePictureUrl"
              value={payload.profilePictureUrl || ""}
              onChange={(e) =>
                setPayload({ ...payload, profilePictureUrl: e.target.value })
              }
              placeholder="https://..."
              className="mt-2"
            />
          </div>
        </div>
      </section>

      {/* Employment & background */}
      <section>
        <h2 className="text-xl font-semibold">Professional background</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="employmentStatus">Employment status *</Label>
            <select
              id="employmentStatus"
              className="mt-2 h-11 w-full rounded-md border border-neutral-300 bg-background px-3 text-sm dark:border-neutral-700"
              value={payload.employmentStatus}
              onChange={(e) =>
                setPayload({ ...payload, employmentStatus: e.target.value as (typeof EMPLOYMENT_STATUS)[number] })
              }
            >
              {EMPLOYMENT_STATUS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt[0].toUpperCase() + opt.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="experienceLevel">Years of experience *</Label>
            <select
              id="experienceLevel"
              className="mt-2 h-11 w-full rounded-md border border-neutral-300 bg-background px-3 text-sm dark:border-neutral-700"
              value={payload.experienceLevel}
              onChange={(e) =>
                setPayload({ ...payload, experienceLevel: e.target.value as (typeof EXPERIENCE_LEVELS)[number] })
              }
            >
              {EXPERIENCE_LEVELS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="primaryProfession">Primary profession *</Label>
            <Input
              id="primaryProfession"
              value={payload.primaryProfession}
              onChange={(e) =>
                setPayload({ ...payload, primaryProfession: e.target.value })
              }
              placeholder="e.g., Software Developer"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="company">Current company</Label>
            <Input
              id="company"
              value={payload.company || ""}
              onChange={(e) => setPayload({ ...payload, company: e.target.value })}
              placeholder="Company (optional)"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="jobTitle">Job title</Label>
            <Input
              id="jobTitle"
              value={payload.jobTitle || ""}
              onChange={(e) => setPayload({ ...payload, jobTitle: e.target.value })}
              placeholder="Job title (optional)"
              className="mt-2"
            />
          </div>
        </div>
      </section>

      {/* Skills & interests (dropdown multi-selects) */}
      <section>
        <h2 className="text-xl font-semibold">Technical skills & interests</h2>

        <MultiSelect
          label="Programming languages"
          options={LANGUAGE_OPTIONS}
          values={payload.languages}
          onChange={(next) => setPayload({ ...payload, languages: next })}
        />

        <MultiSelect
          className="mt-4"
          label="Technologies / frameworks"
          options={TECH_OPTIONS}
          values={payload.technologies}
          onChange={(next) => setPayload({ ...payload, technologies: next })}
        />

        <MultiSelect
          className="mt-4"
          label="Areas of interest"
          options={INTEREST_OPTIONS}
          values={payload.interests}
          onChange={(next) => setPayload({ ...payload, interests: next })}
        />
      </section>

      {/* Platform preferences (dropdown multi-selects) */}
      <section>
        <h2 className="text-xl font-semibold">Platform preferences</h2>

        <MultiSelect
          label="What are you looking to do?"
          options={GOAL_OPTIONS}
          values={payload.platformGoals}
          onChange={(next) => setPayload({ ...payload, platformGoals: next })}
        />

        <MultiSelect
          className="mt-4"
          label="Preferred conversation topics"
          options={TOPIC_OPTIONS}
          values={payload.preferredTopics}
          onChange={(next) => setPayload({ ...payload, preferredTopics: next })}
        />
      </section>

      {/* Matching preferences */}
      <section>
        <h2 className="text-xl font-semibold">Matching preferences</h2>

        <div>
          <Label>I want to connect with</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {( [
                ["similar_experience","Similar experience level"],
                ["more_experienced","More experienced (mentors)"],
                ["less_experienced","Less experienced (to mentor)"],
                ["any_experience","Any experience level"],
                ["similar_roles","Similar roles"],
                ["different_roles","Different roles"],
              ] as const
            ).map(([val, label]) => {
              const active = payload.connectWith.includes(val);
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => toggleChip("connectWith", val)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    active
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="geoPreference">Geographic preference *</Label>
            <select
              id="geoPreference"
              className="mt-2 h-11 w-full rounded-md border border-neutral-300 bg-background px-3 text-sm dark:border-neutral-700"
              value={payload.geoPreference}
              onChange={(e) =>
                setPayload({ ...payload, geoPreference: e.target.value as (typeof GEO_PREFS)[number] })
              }
            >
              {GEO_PREFS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Specific regions (comma-separated)</Label>
            <Input
              className="mt-2"
              placeholder="e.g., US-East, Europe, India"
              value={payload.specificRegions.join(", ")}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  specificRegions: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>
        </div>
      </section>

      {/* Additional */}
      <section>
        <h2 className="text-xl font-semibold">Additional information</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="bio">Brief bio (max 250 chars)</Label>
            <Textarea
              id="bio"
              maxLength={250}
              placeholder="Tell others a bit about yourself and what you're passionate about"
              value={payload.bio || ""}
              onChange={(e) => setPayload({ ...payload, bio: e.target.value })}
              className="mt-2 h-28"
            />
            <div className="mt-1 text-xs text-neutral-500">
              {payload.bio?.length || 0}/250
            </div>
          </div>

          <div>
            <Label htmlFor="projects">Current projects (URL)</Label>
            <Input
              id="projects"
              value={payload.links?.projects || ""}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  links: { ...(payload.links || {}), projects: e.target.value },
                })
              }
              placeholder="https://..."
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn profile</Label>
            <Input
              id="linkedin"
              value={payload.links?.linkedin || ""}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  links: { ...(payload.links || {}), linkedin: e.target.value },
                })
              }
              placeholder="https://www.linkedin.com/in/..."
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="github">GitHub profile</Label>
            <Input
              id="github"
              value={payload.links?.github || ""}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  links: { ...(payload.links || {}), github: e.target.value },
                })
              }
              placeholder="https://github.com/username"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="website">Portfolio website</Label>
            <Input
              id="website"
              value={payload.links?.website || ""}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  links: { ...(payload.links || {}), website: e.target.value },
                })
              }
              placeholder="https://your.site"
              className="mt-2"
            />
          </div>
        </div>
      </section>

      {/* Communication */}
      <section>
        <h2 className="text-xl font-semibold">Communication preferences</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="communicationStyle">Preferred style *</Label>
            <select
              id="communicationStyle"
              className="mt-2 h-11 w-full rounded-md border border-neutral-300 bg-background px-3 text-sm dark:border-neutral-700"
              value={payload.communicationStyle}
              onChange={(e) =>
                setPayload({
                  ...payload,
                  communicationStyle: e.target.value as (typeof COMMUNICATION_STYLE)[number],
                })
              }
            >
              {COMMUNICATION_STYLE.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="timeZone">Time zone *</Label>
            <Input
              id="timeZone"
              value={payload.timeZone}
              onChange={(e) => setPayload({ ...payload, timeZone: e.target.value })}
              placeholder="e.g., Asia/Kolkata"
              className="mt-2"
            />
          </div>
        </div>

        {/* Availability chips */}
        <div className="mt-4">
          <Label>Availability</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {(AVAILABILITY_DEFAULTS as unknown as string[]).map((opt) => {
              const active = payload.availability.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleChip("availability", opt)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    active
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Agreements */}
      <section>
        <h2 className="text-xl font-semibold">Platform guidelines</h2>
        <div className="mt-4 grid gap-3">
          <AgreeRow
            label="I agree to maintain professional conduct"
            checked={payload.agreements.conduct}
            onChange={(v) =>
              setPayload({
                ...payload,
                agreements: { ...payload.agreements, conduct: v },
              })
            }
          />
          <AgreeRow
            label="I will respect others' time and expertise"
            checked={payload.agreements.respect}
            onChange={(v) =>
              setPayload({
                ...payload,
                agreements: { ...payload.agreements, respect: v },
              })
            }
          />
          <AgreeRow
            label="I understand this is a professional networking platform"
            checked={payload.agreements.understand}
            onChange={(v) =>
              setPayload({
                ...payload,
                agreements: { ...payload.agreements, understand: v },
              })
            }
          />
          <AgreeRow
            label="I agree to the Terms of Service and Privacy Policy"
            checked={payload.agreements.terms}
            onChange={(v) =>
              setPayload({
                ...payload,
                agreements: { ...payload.agreements, terms: v },
              })
            }
          />
        </div>
      </section>

      {/* Submit */}
      <div className="flex items-center justify-between gap-4">
        {submitErr && <p className="text-sm text-red-600">{submitErr}</p>}
        {submitOk && <p className="text-sm text-green-600">Saved! Redirecting…</p>}
        <div className="grow" />
        <Button
          onClick={onSubmit}
          disabled={!canSubmit || submitting}
          className="h-11 rounded-lg bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {submitting ? (
            <span className="inline-flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </span>
          ) : (
            "Save & continue"
          )}
        </Button>
      </div>
    </div>
  );
}

function AgreeRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 text-sm dark:border-neutral-800 dark:bg-neutral-950">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-black dark:accent-white"
      />
      <span className="text-neutral-800 dark:text-neutral-200">{label}</span>
    </label>
  );
}
