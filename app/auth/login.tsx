"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../globals.css";
import { LucideTriangleAlert, BookOpen, ArrowLeft, Smartphone, KeyRound } from "lucide-react";
import { toast } from "sonner";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "EduFlow";

export default function Login() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(15);
  const [canResend, setCanResend] = useState(false);
  const [serverInfo, setServerInfo] = useState<any>(null);
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const globalServerInfo = (window as any).__SERVER_INFO__;
    if (globalServerInfo) {
      setServerInfo(globalServerInfo);
    } else {
      fetch("/api/auth/serverInfo")
        .then((r) => r.json())
        .then((d) => setServerInfo(d))
        .catch(() => {});
    }
  }, []);

  const isDirectLogin: boolean = serverInfo?.isDirectLoginOpen ?? false;
  const botUsername = serverInfo?.tg_bot;
  const displayName = serverInfo?.webName || appName;

  const startResendCountdown = () => {
    setResendTimer(15);
    setCanResend(false);
    let timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(timer); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => { if (step === "otp") startResendCountdown(); }, [step]);

  const resendOtp = async (smsType: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/resend-otp?smsType=${smsType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Failed to resend OTP");
        toast.error(data.message || "Failed to resend OTP");
        return;
      }
      startResendCountdown();
    } catch {
      toast.error("An error occurred while resending OTP.");
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !/^[6-9][0-9]{9}$/.test(phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "OTP request failed");
        toast.error(data.message || "OTP request failed");
        return;
      }
      toast.success(data.message || "OTP Sent!");
      setStep("otp");
    } catch {
      setError("An error occurred while sending OTP.");
      toast.error("An error occurred while sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError("Please enter the OTP.");
      toast.error("Please enter the OTP.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone, otp }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "OTP verification failed");
        toast.error(data.message || "OTP verification failed");
        return;
      }
      toast.success(data.message || "Verified!");
      if (data.user) localStorage.setItem("USER_DATA", JSON.stringify(data.user));
      setVerified(true);
      setTimeout(() => router.replace("/study"), 800);
    } catch {
      setError("An error occurred during OTP verification.");
      toast.error("An error occurred during OTP verification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg">{displayName}</span>
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-4 leading-snug">
            Your learning<br />journey starts here.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Access live classes, recorded lectures, and study materials — all in one place.
          </p>
        </div>
        <div className="flex gap-4">
          {["Live Classes", "All Courses", "Study Materials"].map((t) => (
            <div key={t} className="bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-base">{displayName}</span>
          </div>

          <div className="mb-6">
            {step === "otp" && (
              <button
                type="button"
                onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              {step === "phone"
                ? <Smartphone className="w-5 h-5 text-primary" />
                : <KeyRound  className="w-5 h-5 text-primary" />
              }
            </div>
            <h1 className="text-2xl font-bold mb-1">
              {step === "phone" ? "Sign in" : "Enter OTP"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === "phone"
                ? "Enter your mobile number to continue"
                : `OTP sent to +91-${phone}`}
            </p>
          </div>

          {/* Bot notice */}
          {!isDirectLogin && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 mb-5">
              <div className="flex gap-3">
                <LucideTriangleAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">
                    Authorization required
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">
                    Authorize with our bot before logging in.
                  </p>
                  <a
                    href={`https://telegram.me/${botUsername?.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs font-mono bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-2 py-1 rounded hover:underline"
                  >
                    {botUsername}
                  </a>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={step === "phone" ? requestOtp : verifyOtp} className="space-y-4">
            {step === "phone" ? (
              <>
                <div className="flex rounded-xl border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-all">
                  <span className="px-4 py-3 text-sm text-muted-foreground font-medium border-r bg-secondary">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ""));
                      if (error) setError("");
                    }}
                    className="flex-1 px-4 py-3 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="Mobile number"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="w-4 h-4 rounded accent-primary"
                  />
                  I'm not a robot
                </label>
              </>
            ) : (
              <>
                <div className="rounded-xl border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-all">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ""));
                      if (error) setError("");
                    }}
                    className="w-full px-4 py-3 bg-transparent text-center text-xl tracking-[0.5em] font-bold outline-none placeholder:text-muted-foreground placeholder:tracking-normal placeholder:text-base"
                    placeholder="••••••"
                    autoFocus
                  />
                </div>
                {canResend ? (
                  <div className="text-center space-y-2">
                    <p className="text-xs text-muted-foreground">Didn't get the OTP?</p>
                    <div className="flex gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => resendOtp(0)}
                        className="text-xs text-primary font-medium px-3 py-1.5 rounded-lg border hover:bg-primary/5 transition-colors"
                      >
                        Resend via SMS
                      </button>
                      <button
                        type="button"
                        onClick={() => resendOtp(1)}
                        className="text-xs text-emerald-600 font-medium px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                      >
                        Send on WhatsApp
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center">
                    Resend in <span className="font-semibold text-foreground">{resendTimer}s</span>
                  </p>
                )}
              </>
            )}

            {error && (
              <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              disabled={loading || verified}
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-all"
            >
              {loading
                ? "Please wait…"
                : verified
                ? "✓ Verified — redirecting"
                : step === "phone"
                ? "Send OTP"
                : "Verify OTP"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
