// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Omegal for Professionals",
  description:
    "LinkedIn-verified, real-time video matching for high-signal conversations.",
  metadataBase: new URL("https://example.com"),
  keywords: [
    "Omegal",
    "professionals",
    "video",
    "LinkedIn",
    "matching",
    "mentorship",
    "networking",
  ],
  openGraph: {
    title: "Omegal for Professionals",
    description:
      "One-tap video chats with verified professionals. Filter by role, skills, timezone.",
    url: "https://example.com",
    siteName: "Omegal",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Omegal" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Omegal for Professionals",
    description:
      "One-tap video chats with verified professionals. Filter by role, skills, timezone.",
    images: ["/og-image.png"],
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* Clerk wraps the whole app */}
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
