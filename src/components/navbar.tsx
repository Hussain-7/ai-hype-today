"use client";

import { Settings, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center gap-3">
            {/* Logo Icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Zap className="h-5 w-5 text-white" />
            </div>

            {/* Brand Name */}
            <span className="text-lg font-bold text-white">AIHypeToday</span>
          </Link>

          {/* Navigation Items */}
          <div className="flex items-center gap-6">
            <Link
              href="/updates"
              className={`text-sm font-medium transition-colors ${
                pathname === "/updates"
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Updates
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
        </div>
      </div>
    </nav>
  );
}
