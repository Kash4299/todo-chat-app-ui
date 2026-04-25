import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { Zap, ArrowRight } from "lucide-react";

export default async function Home() {
  const session = await auth0.getSession();

  // Restore their original flow: if logged in, redirect to the dashboard!
  if (session) {
    redirect("/todos");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg via-bg-light to-bg animate-gradient" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light mb-4 shadow-lg shadow-primary/20">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text">Welcome back</h1>
          <p className="text-text-muted mt-2">Sign in to your TodoChat account</p>
        </div>

        {/* Card */}
        <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl shadow-black/20">
          <div className="space-y-5">
            <a
              href="/auth/login"
              className="w-full py-3.5 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200"
            >
              Sign In
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          <div className="mt-6 text-center">
            <p className="text-text-muted text-sm">
              Don&apos;t have an account?{" "}
              <a
                href="/auth/login?screen_hint=signup"
                className="text-primary hover:text-primary-light font-semibold transition-colors duration-200"
              >
                Create one
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
