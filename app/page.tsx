"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Zap, Shield, Users } from "lucide-react";

export default function Home() {
  const [appName, setAppName] = useState(process.env.NEXT_PUBLIC_APP_NAME || "EduFlow");

  useEffect(() => {
    fetch("/api/auth/serverInfo")
      .then((r) => r.json())
      .then((d) => { if (d?.webName) setAppName(d.webName); })
      .catch(() => {});
  }, []);

  const features = [
    { icon: BookOpen, title: "All Batches",   desc: "Access every course in one place" },
    { icon: Zap,      title: "Live Classes",  desc: "Real-time interactive sessions"   },
    { icon: Shield,   title: "Secure Access", desc: "Your data stays private"          },
    { icon: Users,    title: "Community",     desc: "Learn together with peers"        },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">{appName}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/study"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Zap className="w-3.5 h-3.5" />
              Smart Learning Platform
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5 text-foreground">
              Learn smarter,<br />
              <span className="text-primary">grow faster.</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Access all your courses, live classes, and study materials in one clean, distraction-free platform.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth"
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-sm"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/study/batches"
                className="flex items-center gap-2 border bg-background px-6 py-3 rounded-xl font-semibold hover:bg-secondary transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          </div>

          {/* Decorative card */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 bg-primary/10 rounded-3xl rotate-6" />
              <div className="absolute inset-4 bg-primary/20 rounded-3xl -rotate-3" />
              <div className="absolute inset-8 bg-card border rounded-2xl shadow-lg flex flex-col items-center justify-center gap-4 p-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-primary" />
                </div>
                <p className="text-sm font-semibold text-center">Your next class is waiting</p>
                <div className="w-full space-y-2">
                  {[80, 60, 90].map((w, i) => (
                    <div key={i} className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${w}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {appName}. All rights reserved.
      </footer>
    </div>
  );
}
