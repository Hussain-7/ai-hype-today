"use client";

import { Menu, Settings, X, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Navbar() {
  const pathname = usePathname();
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/articles"
              className={`text-sm font-medium transition-colors ${
                pathname === "/articles"
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Articles
            </Link>
            <Link
              href="/admin"
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                pathname === "/admin"
                  ? "bg-blue-500 text-white"
                  : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Settings className="h-4 w-4" />
              Admin
            </Link>
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
            <Link
              href="/articles"
              onClick={() => setMobileMenuOpen(false)}
              className={`block rounded-lg px-3 py-2 text-base font-medium transition-colors ${
                pathname === "/articles"
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              Articles
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-base font-medium transition-colors ${
                pathname === "/admin"
                  ? "bg-blue-500 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Settings className="h-4 w-4" />
              Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
