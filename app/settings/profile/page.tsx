"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Check, ChevronDown, Loader2, X, XCircle } from "lucide-react";

// ---------- Config ----------
const API_BASE =
  process.env.NEXT_PUBLIC_PROFILE_API_BASE || "http://localhost:4001"; // same as onboarding
const JWT_TEMPLATE = process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE || ""; // e.g., "user-profile-api"

// Keep these in sync with backend enums
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

const LANGUAGE_OPTIONS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  "PHP",
  "Ruby",
];

const TECH_OPTIONS = [
  "React",
  "Angular",
  "Vue.js",
  "Node.js",
  "Django",
  "Spring",
  ".NET",
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
];

const INTEREST_OPTIONS = [
  "Web Development",
  "Mobile Development",
  "Machine Learning/AI",
  "Cloud Computing",
  "Blockchain",
  "IoT",
  "Gaming",
  "Fintech",
  "Healthcare Tech",
  "E-commerce",
  "Startups",
  "Open Source",
];

const GOAL_OPTIONS = [
  "Network with peers",
  "Find mentors",
  "Mentor others",
  "Discuss technical topics",
  "Share knowledge",
  "Seek career advice",
  "Collaborate on projects",
  "Find co-founders",
  "Casual professional chat",
];

const TOPIC_OPTIONS = [
  "Technical discussions",
  "Career advice",
  "Industry trends",
  "Startup ideas",
  "Code reviews",
  "Best practices",
  "Tool recommendations",
  "Project collaboration",
];

// ---------- Types ----------
type Agreements = {
  conduct?: boolean;
  respect?: boolean;
  understand?: boolean;
  terms?: boolean;
};
type Links = {
  projects?: string;
  linkedin?: string;
  github?: string;
  website?: string;
};
type Profile = {
  // personal
  fullName?: string;
  email?: string;
  username?: string;
  profilePictureUrl?: string;
  // employment
  employmentStatus?: (typeof EMPLOYMENT_STATUS)[number];
  primaryProfession?: string;
  experienceLevel?: (typeof EXPERIENCE_LEVELS)[number];
  company?: string;
  jobTitle?: string;
  // skills & interests
  languages?: string[];
  technologies?: string[];
  interests?: string[];
  // platform prefs
  platformGoals?: string[];
  preferredTopics?: string[];
  // matching
  connectWith?: (typeof CONNECT_WITH)[number][];
  geoPreference?: (typeof GEO_PREFS)[number];
  specificRegions?: string[];
  // extra
  bio?: string;
  links?: Links;
  // verification/guidelines (not editing here)
  companyEmail?: string;
  companyEmailVerified?: boolean;
  agreements?: Agreements;
  // communication
  communicationStyle?: (typeof COMMUNICATION_STYLE)[number];
  availability?: string[];
  timeZone?: string;
};

// ---------- Utils ----------
function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
const isEqualArray = (a?: string[], b?: string[]) =>
  JSON.stringify([...(a || [])].sort()) ===
  JSON.stringify([...(b || [])].sort());

// Build a PATCH body with only changed keys (handles arrays + nested links safely)
function diffProfile(next: Profile, prev: Profile): Partial<Profile> {
  const out: Partial<Profile> = {};
  // precise index typing without `any`
  const outMutable: Partial<Record<keyof Profile, Profile[keyof Profile]>> = out;

  const keys: (keyof Profile)[] = [
    "fullName",
    "username",
    "profilePictureUrl",
    "employmentStatus",
    "primaryProfession",
    "experienceLevel",
    "company",
    "jobTitle",
    "languages",
    "technologies",
    "interests",
    "platformGoals",
    "preferredTopics",
    "connectWith",
    "geoPreference",
    "specificRegions",
    "bio",
    "links",
    "communicationStyle",
    "availability",
    "timeZone",
  ];

  for (const k of keys) {
    const nv = next[k];
    const pv = prev[k];

    // links: send full normalized object only if changed
    if (k === "links") {
      const nNorm = normalizeLinksForApi(nv as Links | undefined);
      const pNorm = normalizeLinksForApi(pv as Links | undefined);
      if (!linksEqual(nNorm, pNorm)) {
        outMutable[k] = nNorm as Profile[keyof Profile];
      }
      continue;
    }

    // arrays: use your isEqualArray (order-insensitive)
    if (Array.isArray(nv) || Array.isArray(pv)) {
      const a = nv as string[] | undefined;
      const b = pv as string[] | undefined;
      if (!isEqualArray(a, b)) {
        outMutable[k] = nv as Profile[keyof Profile];
      }
      continue;
    }

    // primitives/enums/strings
    if ((nv ?? "") !== (pv ?? "")) {
      outMutable[k] = nv as Profile[keyof Profile];
    }
  }

  return out;
}



// Keep only non-empty trimmed URLs; drop empty keys entirely
const normalizeLinksForApi = (links?: Links): Links => {
  const out: Links = {};
  (["projects", "linkedin", "github", "website"] as const).forEach((k) => {
    const v = links?.[k]?.trim();
    if (v) out[k] = v;
  });
  return out;
};

const linksEqual = (a?: Links, b?: Links) =>
  JSON.stringify(normalizeLinksForApi(a)) ===
  JSON.stringify(normalizeLinksForApi(b));

// ---------- MultiSelect (same UX as onboarding) ----------
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

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const isChecked = (opt: string) => values.includes(opt);
  const toggle = (opt: string) => {
    const set = new Set(values);
    set.has(opt) ? set.delete(opt) : set.add(opt);
    onChange(Array.from(set));
  };
  const clearAll = () => onChange([]);
  const selectAll = () => onChange(options.slice());
  const summary =
    values.length === 0
      ? "Select one or more"
      : values.length <= 2
      ? values.join(", ")
      : `${values.slice(0, 2).join(", ")} +${values.length - 2} more`;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <Label>{label}</Label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-2 flex h-11 w-full items-center justify-between rounded-md border border-neutral-300 bg-background px-3 text-left text-sm dark:border-neutral-700"
      >
        <span
          className={`truncate ${
            values.length
              ? "text-neutral-900 dark:text-neutral-100"
              : "text-neutral-500"
          }`}
        >
          {summary}
        </span>
        <ChevronDown className="h-4 w-4 opacity-70" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="absolute z-50 mt-2 w-full rounded-md border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-800 dark:bg-neutral-950"
        >
          <input
            className="mb-2 h-9 w-full rounded-md border border-neutral-300 bg-background px-3 text-sm outline-none dark:border-neutral-700"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
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

// ---------- Page ----------
export default function ProfileSettingsPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  const [initial, setInitial] = useState<Profile | null>(null);
  const [form, setForm] = useState<Profile>({
    availability: [],
    languages: [],
    technologies: [],
    interests: [],
    platformGoals: [],
    preferredTopics: [],
    connectWith: [],
    specificRegions: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // username availability
  const [usernameInput, setUsernameInput] = useState("");
  const debouncedUsername = useDebounced(usernameInput, 350);
  const [usernameAvailable, setUsernameAvailable] = useState<
    "unknown" | "checking" | "yes" | "no"
  >("unknown");

  // Prefill
  useEffect(() => {
    (async () => {
      if (!isLoaded) return;
      setLoading(true);
      setError(null);

      const token = await getToken(
        JWT_TEMPLATE ? { template: JWT_TEMPLATE } : undefined
      );
      if (!token) {
        setError(
          JWT_TEMPLATE
            ? "Could not mint API token. Check your Clerk JWT template."
            : "Not authenticated."
        );
        setLoading(false);
        return;
      }

      try {
        // assuming a GET /profiles/me exists; if your API differs, adjust this endpoint
        const res = await fetch(`${API_BASE}/profiles/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
        const j = await res.json();

        const profile: Profile = {
          fullName: j?.profile?.fullName ?? "",
          email: j?.profile?.email ?? "",
          username: j?.profile?.username ?? "",
          profilePictureUrl: j?.profile?.profilePictureUrl ?? "",
          employmentStatus: j?.profile?.employmentStatus ?? "employee",
          primaryProfession: j?.profile?.primaryProfession ?? "",
          experienceLevel:
            j?.profile?.experienceLevel ?? "Entry Level (0-2 years)",
          company: j?.profile?.company ?? "",
          jobTitle: j?.profile?.jobTitle ?? "",
          languages: j?.profile?.languages ?? [],
          technologies: j?.profile?.technologies ?? [],
          interests: j?.profile?.interests ?? [],
          platformGoals: j?.profile?.platformGoals ?? [],
          preferredTopics: j?.profile?.preferredTopics ?? [],
          connectWith: j?.profile?.connectWith ?? [],
          geoPreference: j?.profile?.geoPreference ?? "Global connections",
          specificRegions: j?.profile?.specificRegions ?? [],
          bio: j?.profile?.bio ?? "",
          links: j?.profile?.links ?? {},
          communicationStyle: j?.profile?.communicationStyle ?? "Any format",
          availability: j?.profile?.availability ?? [],
          timeZone:
            j?.profile?.timeZone ??
            (typeof Intl !== "undefined"
              ? Intl.DateTimeFormat().resolvedOptions().timeZone
              : "UTC"),
        };

        setInitial(profile);
        setForm(profile);
        setUsernameInput(profile.username || "");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [isLoaded, getToken]);

  // username availability check
  useEffect(() => {
    const run = async () => {
      if (!debouncedUsername || debouncedUsername.length < 3) {
        setUsernameAvailable("unknown");
        return;
      }
      // if user hasn't changed username, treat as ok
      if (
        debouncedUsername.toLowerCase() ===
        (initial?.username || "").toLowerCase()
      ) {
        setUsernameAvailable("yes");
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
  }, [debouncedUsername, initial]);

  const toggleChip = (key: "connectWith" | "availability", value: string) => {
    setForm((p) => {
      const set = new Set((p[key] as string[]) || []);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...p, [key]: Array.from(set) };
    });
  };

 const canSave = useMemo(() => {
  if (!initial) return false;
  if (usernameAvailable === "no") return false;

  const normalizedForDiff: Profile = {
    ...form,
    username: (form.username || "").toLowerCase(),
    links: normalizeLinksForApi(form.links),
  };

  const changed = diffProfile(normalizedForDiff, initial);
  return Object.keys(changed).length > 0;
}, [form, initial, usernameAvailable]);


  const onSave = async () => {
    if (!initial) return;

    setSaving(true);
    setError(null);

    try {
      const token = await getToken(
        JWT_TEMPLATE ? { template: JWT_TEMPLATE } : undefined
      );
      if (!token) throw new Error("Not authenticated.");

      // Normalize current form for comparison & save
      const normalizedForDiff: Profile = {
        ...form,
        username: (form.username || "").toLowerCase(),
        bio: form.bio ?? "", // keep empty string if user cleared it
        links: normalizeLinksForApi(form.links),
      };

      const patch = diffProfile(normalizedForDiff, initial);
      if (!Object.keys(patch).length) {
        setSaving(false);
        return;
      }

      const res = await fetch(`${API_BASE}/profiles`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patch),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        if (res.status === 409)
          throw new Error("Username or another unique field already taken.");
        throw new Error(j?.error || `Update failed (${res.status})`);
      }

      const updated = await res.json();
      const next = { ...initial, ...(updated?.profile || patch) };
      setInitial(next);
      setForm(next);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-6 py-12">
        <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading profile…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-4xl px-6 py-12">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <section className="min-h-[calc(100vh-6rem)] bg-white text-black dark:bg-black dark:text-white">
      <div className="container mx-auto px-6 py-10 max-w-4xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Profile Settings</h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Update your profile details for better matches.
            </p>
          </div>
          <Link href="/match" className="text-sm underline underline-offset-2">
            Back to match
          </Link>
        </header>

        <div className="space-y-10">
          {/* Personal */}
          <section>
            <h2 className="text-xl font-semibold">Personal</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div>
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={form.fullName || ""}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="email">Email (read-only)</Label>
                <Input
                  id="email"
                  value={form.email || ""}
                  disabled
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    id="username"
                    value={form.username || ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^a-z0-9._-]/gi, "");
                      setForm({ ...form, username: v });
                      setUsernameInput(v);
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

              <div>
                <Label htmlFor="profilePictureUrl">Profile picture URL</Label>
                <Input
                  id="profilePictureUrl"
                  value={form.profilePictureUrl || ""}
                  onChange={(e) =>
                    setForm({ ...form, profilePictureUrl: e.target.value })
                  }
                  className="mt-2"
                  placeholder="https://…"
                />
              </div>
            </div>
          </section>

          {/* Professional */}
          <section>
            <h2 className="text-xl font-semibold">Professional</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div>
                <Label htmlFor="employmentStatus">Employment status</Label>
                <select
                  id="employmentStatus"
                  className="mt-2 h-11 w-full rounded-md border border-neutral-300 bg-background px-3 text-sm dark:border-neutral-700"
                  value={form.employmentStatus || "employee"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      employmentStatus: e.target
                        .value as (typeof EMPLOYMENT_STATUS)[number],
                    })
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
                <Label htmlFor="experienceLevel">Years of experience</Label>
                <select
                  id="experienceLevel"
                  className="mt-2 h-11 w-full rounded-md border border-neutral-300 bg-background px-3 text-sm dark:border-neutral-700"
                  value={form.experienceLevel || "Entry Level (0-2 years)"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      experienceLevel: e.target
                        .value as (typeof EXPERIENCE_LEVELS)[number],
                    })
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
                <Label htmlFor="primaryProfession">Primary profession</Label>
                <Input
                  id="primaryProfession"
                  value={form.primaryProfession || ""}
                  onChange={(e) =>
                    setForm({ ...form, primaryProfession: e.target.value })
                  }
                  className="mt-2"
                  placeholder="e.g., Software Developer"
                />
              </div>

              <div>
                <Label htmlFor="company">Current company</Label>
                <Input
                  id="company"
                  value={form.company || ""}
                  onChange={(e) =>
                    setForm({ ...form, company: e.target.value })
                  }
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="jobTitle">Job title</Label>
                <Input
                  id="jobTitle"
                  value={form.jobTitle || ""}
                  onChange={(e) =>
                    setForm({ ...form, jobTitle: e.target.value })
                  }
                  className="mt-2"
                />
              </div>
            </div>
          </section>

          {/* Skills & interests */}
          <section>
            <h2 className="text-xl font-semibold">
              Technical skills & interests
            </h2>
            <MultiSelect
              label="Programming languages"
              options={LANGUAGE_OPTIONS}
              values={form.languages || []}
              onChange={(next) => setForm({ ...form, languages: next })}
            />
            <MultiSelect
              className="mt-4"
              label="Technologies / frameworks"
              options={TECH_OPTIONS}
              values={form.technologies || []}
              onChange={(next) => setForm({ ...form, technologies: next })}
            />
            <MultiSelect
              className="mt-4"
              label="Areas of interest"
              options={INTEREST_OPTIONS}
              values={form.interests || []}
              onChange={(next) => setForm({ ...form, interests: next })}
            />
          </section>

          {/* Platform preferences */}
          <section>
            <h2 className="text-xl font-semibold">Platform preferences</h2>
            <MultiSelect
              label="What are you looking to do?"
              options={GOAL_OPTIONS}
              values={form.platformGoals || []}
              onChange={(next) => setForm({ ...form, platformGoals: next })}
            />
            <MultiSelect
              className="mt-4"
              label="Preferred conversation topics"
              options={TOPIC_OPTIONS}
              values={form.preferredTopics || []}
              onChange={(next) => setForm({ ...form, preferredTopics: next })}
            />
          </section>

          {/* Matching */}
          <section>
            <h2 className="text-xl font-semibold">Matching preferences</h2>

            <div>
              <Label>I want to connect with</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {(
                  [
                    ["similar_experience", "Similar experience level"],
                    ["more_experienced", "More experienced (mentors)"],
                    ["less_experienced", "Less experienced (to mentor)"],
                    ["any_experience", "Any experience level"],
                    ["similar_roles", "Similar roles"],
                    ["different_roles", "Different roles"],
                  ] as const
                ).map(([val, label]) => {
                  const active = (form.connectWith || []).includes(val);
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
                <Label htmlFor="geoPreference">Geographic preference</Label>
                <select
                  id="geoPreference"
                  className="mt-2 h-11 w-full rounded-md border border-neutral-300 bg-background px-3 text-sm dark:border-neutral-700"
                  value={form.geoPreference || "Global connections"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      geoPreference: e.target
                        .value as (typeof GEO_PREFS)[number],
                    })
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
                  value={(form.specificRegions || []).join(", ")}
                  onChange={(e) =>
                    setForm({
                      ...form,
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
            <h2 className="text-xl font-semibold">Additional</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="bio">Brief bio (max 250 chars)</Label>
                <Textarea
                  id="bio"
                  maxLength={250}
                  value={form.bio || ""}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="mt-2 h-28"
                />
                <div className="mt-1 text-xs text-neutral-500">
                  {form.bio?.length || 0}/250
                </div>
              </div>

              <div>
                <Label htmlFor="projects">Current projects (URL)</Label>
                <Input
                  id="projects"
                  value={form.links?.projects || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      links: {
                        ...(form.links || {}),
                        projects: e.target.value,
                      },
                    })
                  }
                  className="mt-2"
                  placeholder="https://…"
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn profile</Label>
                <Input
                  id="linkedin"
                  value={form.links?.linkedin || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      links: {
                        ...(form.links || {}),
                        linkedin: e.target.value,
                      },
                    })
                  }
                  className="mt-2"
                  placeholder="https://www.linkedin.com/in/…"
                />
              </div>
              <div>
                <Label htmlFor="github">GitHub profile</Label>
                <Input
                  id="github"
                  value={form.links?.github || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      links: { ...(form.links || {}), github: e.target.value },
                    })
                  }
                  className="mt-2"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <Label htmlFor="website">Portfolio website</Label>
                <Input
                  id="website"
                  value={form.links?.website || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      links: { ...(form.links || {}), website: e.target.value },
                    })
                  }
                  className="mt-2"
                  placeholder="https://your.site"
                />
              </div>
            </div>
          </section>

          {/* Communication */}
          <section>
            <h2 className="text-xl font-semibold">Communication</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <div>
                <Label htmlFor="communicationStyle">Preferred style</Label>
                <select
                  id="communicationStyle"
                  className="mt-2 h-11 w-full rounded-md border border-neutral-300 bg-background px-3 text-sm dark:border-neutral-700"
                  value={form.communicationStyle || "Any format"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      communicationStyle: e.target
                        .value as (typeof COMMUNICATION_STYLE)[number],
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
                <Label htmlFor="timeZone">Time zone</Label>
                <Input
                  id="timeZone"
                  value={form.timeZone || ""}
                  onChange={(e) =>
                    setForm({ ...form, timeZone: e.target.value })
                  }
                  className="mt-2"
                  placeholder="e.g., Asia/Kolkata"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label>Availability</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {(AVAILABILITY_DEFAULTS as unknown as string[]).map((opt) => {
                  const active = (form.availability || []).includes(opt);
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

          {/* Save */}
          <div className="flex items-center justify-between gap-4">
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            <div className="grow" />
            <Button
              onClick={onSave}
              disabled={!canSave || saving}
              className="h-11 rounded-lg bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {saving ? (
                <span className="inline-flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </span>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
