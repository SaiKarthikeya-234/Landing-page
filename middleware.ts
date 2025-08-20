// middleware.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  // Protect only specific areas; add more as needed
  matcher: ["/dashboard(.*)", "/match(.*)"],
};
