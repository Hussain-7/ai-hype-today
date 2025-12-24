"use client";

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { Settings, Zap } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  const { user } = useUser();
  const metadata = user?.publicMetadata as { isAdmin?: boolean } | undefined;
  const isAdmin = metadata?.isAdmin === true;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="text-sm sm:text-base lg:text-lg font-bold text-white">
              AIHypeToday
            </span>
          </Link>

          {/* Auth Controls (Same for Mobile & Desktop) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <SignedOut>
              <Link
                href="/sign-in"
                className="rounded-lg bg-blue-500 px-4 py-2 sm:px-6 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-blue-600"
              >
                Sign In
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 sm:h-9 sm:w-9",
                  },
                }}
              >
                {isAdmin && (
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="Admin Dashboard"
                      labelIcon={<Settings className="h-4 w-4" />}
                      href="/admin"
                    />
                  </UserButton.MenuItems>
                )}
              </UserButton>
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
}
