// app/components/layout/Header.tsx
"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Menu, X, ChevronDown, ArrowRight, Sun, Moon, ShieldCheck, Filter, Video } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

interface NavItem {
  name: string;
  href: string;
  hasDropdown?: boolean;
  dropdownItems?: { name: string; href: string; description?: string; icon?: React.ReactNode }[];
}

const navItems: NavItem[] = [
  { name: "Home", href: "#home" },
  { name: "Features", href: "#features" },
  {
    name: "Product",
    href: "#product",
    hasDropdown: true,
    dropdownItems: [
      { name: "Free Filters", href: "#features", description: "Role, Skills, Country/Timezone, Interest tags", icon: <Filter className="h-4 w-4" /> },
      { name: "How Matching Works", href: "#about", description: "Ranking, buckets, and fairness", icon: <Video className="h-4 w-4" /> },
      { name: "Verification & Safety", href: "#security", description: "LinkedIn OAuth, moderation, privacy", icon: <ShieldCheck className="h-4 w-4" /> },
    ],
  },
  { name: "Pricing", href: "#pricing" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
];

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerVariants = { initial: { y: -100, opacity: 0 }, animate: { y: 0, opacity: 1 } };
  const mobileMenuVariants = { closed: { opacity: 0, height: 0 }, open: { opacity: 1, height: "auto" } };
  const dropdownVariants = { hidden: { opacity: 0, y: -10, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1 } };

  return (
    <motion.header
      className="fixed left-0 right-0 top-0 z-50 transition-all duration-300"
      variants={headerVariants}
      initial="initial"
      animate="animate"
      style={{ backdropFilter: isScrolled ? "blur(12px)" : "none" }}
    >
      <div className={"mx-auto max-w-7xl " + (isScrolled ? "bg-white/85 dark:bg-black/70 border-b border-neutral-200 dark:border-neutral-800 shadow-sm" : "")}>
        <div className="flex h-16 items-center justify-between px-4 lg:h-20">
          {/* Brand */}
          <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
            <a href="#home" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-neutral-300 bg-black text-white dark:bg-white dark:text-black">
                <span className="text-xs font-bold">Ω</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-black dark:text-white">Omegal for Professionals</span>
            </a>
          </motion.div>

          {/* Desktop nav */}
          <nav className="hidden items-center space-x-8 lg:flex">
            {navItems.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <a
                  href={item.href}
                  className="flex items-center space-x-1 font-medium text-neutral-900 transition-colors hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-300"
                >
                  <span>{item.name}</span>
                  {item.hasDropdown && <ChevronDown className="h-4 w-4" />}
                </a>

                {item.hasDropdown && (
                  <AnimatePresence>
                    {activeDropdown === item.name && (
                      <motion.div
                        className="absolute left-0 top-full mt-2 w-72 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-black"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.16 }}
                      >
                        {item.dropdownItems?.map((d) => (
                          <a
                            key={d.name}
                            href={d.href}
                            className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900"
                          >
                            {d.icon && <div className="mt-0.5 text-neutral-600 dark:text-neutral-300">{d.icon}</div>}
                            <div>
                              <div className="font-medium text-neutral-900 dark:text-neutral-100">{d.name}</div>
                              {d.description && <div className="text-sm text-neutral-600 dark:text-neutral-400">{d.description}</div>}
                            </div>
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center space-x-4 lg:flex">
            <button
              className="rounded-md p-2 text-neutral-900 transition hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-900"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <SignedOut>
              <SignInButton mode="modal" fallbackRedirectUrl="/post-auth">
                <button
                  className="text-sm font-medium text-neutral-900 transition hover:text-neutral-600 dark:text-neutral-100 dark:hover:text-neutral-300"
                  title="LinkedIn OAuth"
                >
                  Sign in with LinkedIn
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-8 w-8",
                    userButtonPopoverCard: "bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800",
                  },
                }}
              />
            </SignedIn>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <a
                href="/match"
                className="inline-flex items-center space-x-2 rounded-full border border-neutral-900 bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                <span>Start Matching</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              className="rounded-md p-2 text-neutral-900 transition hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-900"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
            <motion.button
              className="rounded-md p-2 text-neutral-900 transition hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-900"
              onClick={() => setIsMobileMenuOpen((o) => !o)}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="overflow-hidden px-4 lg:hidden"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <div className="mt-4 space-y-2 rounded-xl border border-neutral-200 bg-white py-4 shadow-xl dark:border-neutral-800 dark:bg-black">
                {navItems.map((item) => (
                  <div key={item.name}>
                    <a
                      href={item.href}
                      className="block px-4 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-900"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </a>
                    {item.hasDropdown &&
                      item.dropdownItems?.map((d) => (
                        <a
                          key={d.name}
                          href={d.href}
                          className="block px-8 py-2 text-sm text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {d.name}
                        </a>
                      ))}
                  </div>
                ))}

                <div className="space-y-2 px-4 pt-2">
                  <SignedOut>
                    <SignInButton mode="modal" fallbackRedirectUrl="/post-auth">
                      <button
                        className="block w-full rounded-md px-4 py-2.5 text-center text-sm font-medium text-neutral-900 transition hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-900"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign in with LinkedIn
                      </button>
                    </SignInButton>
                  </SignedOut>

                  <SignedIn>
                    <div className="flex items-center justify-between rounded-md border border-neutral-200 px-4 py-2.5 dark:border-neutral-800">
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">Account</span>
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </SignedIn>

                  <a
                    href="/match"
                    className="block w-full rounded-md border border-neutral-900 bg-neutral-900 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Start Matching
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
