"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Menu, Settings, X, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3"
            onClick={() => setMobileMenuOpen(false)}
          >
            {/* Logo Icon */}
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>

            {/* Brand Name */}
            <span className="text-base sm:text-lg font-bold text-white">
              AIHypeToday
            </span>
          </Link>

          {/* Right - Auth Controls (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <SignedOut>
              <Link
                href="/sign-in"
                className="rounded-lg bg-blue-500 px-6 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-600"
              >
                Sign In
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Admin Dashboard"
                    labelIcon={<Settings className="h-4 w-4" />}
                    href="/admin"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0A0A0A]">
          <div className="space-y-1 px-4 py-3">
            <SignedOut>
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg bg-blue-500 px-6 py-3 text-center text-base font-semibold text-white transition-all hover:bg-blue-600"
              >
                Sign In
              </Link>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9",
                    },
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="Admin Dashboard"
                      labelIcon={<Settings className="h-4 w-4" />}
                      href="/admin"
                    />
                  </UserButton.MenuItems>
                </UserButton>
                <span className="text-sm text-gray-400">Account</span>
              </div>
            </SignedIn>
          </div>
        </div>
      )}
    </nav>
  );
}
