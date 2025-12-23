"use client";

import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  Bell,
  Building2,
  Filter,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useArticles } from "@/hooks/useArticles";

export function LandingPage() {
  const { allArticles } = useArticles();

  // Calculate last update time
  const lastUpdate = useMemo(() => {
    if (allArticles.length === 0) return "Never";

    return formatDistanceToNow(
      new Date(
        Math.max(...allArticles.map((a) => new Date(a.publishedAt).getTime())),
      ),
      { addSuffix: true },
    );
  }, [allArticles]);

  const features = [
    {
      icon: Bell,
      title: "Real-time Updates",
      description:
        "Never miss a launch, update, or announcement from the AI ecosystem. Our automated pipeline checks sources 24/7.",
    },
    {
      icon: Filter,
      title: "Smart Filtering",
      description:
        "Filter by company, category, or search across all updates. Find exactly what matters to you in seconds.",
    },
    {
      icon: Building2,
      title: "40+ AI Companies",
      description:
        "Track OpenAI, Anthropic, Google, Meta, Mistral, and dozens more from a single unified feed.",
    },
    {
      icon: Sparkles,
      title: "Zero Manual Work",
      description:
        "Fully automated aggregation means you get fresh content without lifting a finger. Just read and build.",
    },
  ];

  const topProviders = [
    "OpenAI",
    "Anthropic",
    "Google",
    "Meta",
    "Microsoft",
    "Mistral",
    "Cohere",
    "Perplexity",
    "Hugging Face",
    "Replicate",
    "Vercel",
    "LangChain",
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Hero Section - Full Viewport */}
      <div className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center border-b border-white/5 bg-gradient-to-b from-[#0A0A0A] via-[#111111] to-[#0A0A0A]">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 text-center">
          {/* Status Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur-sm">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-gray-400">Last updated {lastUpdate}</span>
          </div>

          {/* Hero Title */}
          <h1 className="mb-6 text-6xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
            Stay ahead of the{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI wave
            </span>
          </h1>

          {/* Hero Description */}
          <p className="mx-auto mb-12 max-w-3xl text-xl text-gray-400 sm:text-2xl">
            Track daily updates, launches, and changes from every major AI
            provider. One feed. Zero noise. Built for builders.
          </p>

          {/* CTA Button */}
          <Link
            href="/updates"
            className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/25"
          >
            Start Reading
            <ArrowRight className="h-5 w-5" />
          </Link>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-3xl mx-auto">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold text-white">
                {allArticles.length}
              </div>
              <div className="mt-2 text-sm text-gray-400">Total Updates</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold text-white">
                {new Set(allArticles.map((a) => a.company.slug)).size}
              </div>
              <div className="mt-2 text-sm text-gray-400">AI Companies</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="text-4xl font-bold text-white">24/7</div>
              <div className="mt-2 text-sm text-gray-400">Auto-Updated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative overflow-hidden border-b border-white/5 bg-[#0A0A0A] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white sm:text-5xl mb-4">
              Everything you need in one place
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Stop wasting time checking dozens of blogs, Twitter feeds, and
              newsletters. We aggregate it all automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:bg-white/10"
              >
                <div className="mb-4 inline-flex rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 p-3">
                  <feature.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Providers Section */}
      <div className="relative overflow-hidden bg-[#0A0A0A] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur-sm">
              <Zap className="h-4 w-4 text-blue-400" />
              <span className="text-gray-400">40+ AI companies tracked</span>
            </div>
            <h2 className="text-4xl font-bold text-white sm:text-5xl mb-4">
              All major AI providers in one feed
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              From frontier model labs to developer tools and platforms. If it
              matters in AI, we're tracking it.
            </p>
          </div>

          {/* Provider Grid */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {topProviders.map((provider) => (
              <div
                key={provider}
                className="rounded-lg border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-sm"
              >
                <span className="text-sm font-medium text-gray-300">
                  {provider}
                </span>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-500">
            ...and many more including Cohere, Stability AI, Runway, Scale AI,
            Pinecone, Weaviate, and the entire AI ecosystem
          </p>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative overflow-hidden border-t border-white/5 bg-gradient-to-b from-[#0A0A0A] via-[#111111] to-[#0A0A0A] py-24">
        <div className="absolute top-0 right-1/3 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white sm:text-5xl mb-6">
            Ready to stay in the loop?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join builders who rely on AIHypeToday to track the rapidly evolving
            AI landscape. Free. No signup required.
          </p>
          <Link
            href="/updates"
            className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:from-blue-600 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/25"
          >
            Start Reading Now
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
