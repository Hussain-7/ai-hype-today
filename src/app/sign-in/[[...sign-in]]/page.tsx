import { SignIn } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="relative min-h-screen bg-[#0A0A0A] overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
        <div
          className="absolute top-1/2 -right-40 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative flex min-h-screen">
        {/* Left Side - Brand & Value Proposition */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20">
          <div className="max-w-xl space-y-8">
            {/* Brand Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl font-bold leading-tight text-white xl:text-6xl">
                Stay ahead of
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  AI Innovation
                </span>
              </h1>

              <p className="text-lg text-gray-400 leading-relaxed">
                Automated news aggregation from top AI companies. Get real-time
                updates, curated insights, and never miss important
                developments.
              </p>
            </div>

            {/* Featured Companies */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                TRACKING UPDATES FROM
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "OpenAI",
                  "Anthropic",
                  "Google DeepMind",
                  "Meta AI",
                  "Mistral",
                ].map((company, i) => (
                  <div
                    key={company}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-300 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:text-white"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {company}
                  </div>
                ))}
              </div>
            </div>

            {/* Social Proof / Trust Signal */}
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-[#0A0A0A] bg-gradient-to-br from-blue-500 to-purple-500"
                  />
                ))}
              </div>
              <span>Join 1000+ AI enthusiasts tracking the latest news</span>
            </div>
          </div>
        </div>

        {/* Center - Sign In Form */}
        <div className="flex w-full items-center justify-center px-6 py-12 sm:px-12">
          <div className="w-full max-w-md">
            <SignIn />
          </div>
        </div>
      </div>

      {/* Floating Elements - Background Decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 left-10 h-2 w-2 rounded-full bg-blue-400/40 animate-ping" />
        <div
          className="absolute top-40 right-20 h-1.5 w-1.5 rounded-full bg-purple-400/40 animate-ping"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute bottom-32 left-1/4 h-2 w-2 rounded-full bg-cyan-400/40 animate-ping"
          style={{ animationDelay: "1s" }}
        />
      </div>
    </div>
  );
}
