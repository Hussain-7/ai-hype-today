import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/articles(.*)", "/admin(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Redirect logged-in users from home page (exact match only) to articles
  if (req.nextUrl.pathname === "/" && userId) {
    return NextResponse.redirect(new URL("/articles", req.url));
  }

  // Protect routes - require authentication
  if (isProtectedRoute(req)) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Admin routes - check privateMetadata for isAdmin (fetch from Clerk)
  if (isAdminRoute(req) && userId) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const isAdmin =
        (user.privateMetadata as { isAdmin?: boolean })?.isAdmin === true;

      if (!isAdmin) {
        return NextResponse.redirect(new URL("/articles", req.url));
      }
    } catch (error) {
      console.error("Failed to check admin status:", error);
      return NextResponse.redirect(new URL("/articles", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
