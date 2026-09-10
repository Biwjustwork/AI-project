"use client";

import { useState, useTransition } from "react";
import { login, signup } from "@/app/actions/auth";
import { Library, KeyRound, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, BookOpen } from "lucide-react";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        if (tab === "login") {
          const res = await login(null, formData);
          if (res && !res.success) {
            setErrorMsg(res.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
          }
        } else {
          const res = await signup(null, formData);
          if (res && !res.success) {
            setErrorMsg(res.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
          } else if (res && res.success) {
            setSuccessMsg(res.message || "สมัครสมาชิกสำเร็จ!");
          }
        }
      } catch (err: any) {
        // Next.js redirect throws a NEXT_REDIRECT error which is normal
        if (err?.message?.includes("NEXT_REDIRECT")) {
          return;
        }
        setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* University Crest / Library Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 text-slate-950 shadow-xl shadow-amber-500/20 mb-4 border border-amber-300/40">
            <Library className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            สำนักหอสมุดกลาง
          </h1>
          <p className="text-xs sm:text-sm text-amber-300 font-bold mt-1">
            University Central Library • Room Reservation System
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-100 p-1.5 gap-1">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-3 text-xs sm:text-sm font-black rounded-2xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                tab === "login"
                  ? "bg-slate-950 text-amber-300 shadow-md"
                  : "text-slate-700 hover:text-slate-950 hover:bg-slate-200/80"
              }`}
            >
              <KeyRound className={`w-4 h-4 ${tab === "login" ? "text-amber-300" : "text-slate-500"}`} />
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("signup");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-3 text-xs sm:text-sm font-black rounded-2xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                tab === "signup"
                  ? "bg-slate-950 text-amber-300 shadow-md"
                  : "text-slate-700 hover:text-slate-950 hover:bg-slate-200/80"
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${tab === "signup" ? "text-amber-300" : "text-slate-500"}`} />
              สมัครสมาชิก
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="font-bold">{errorMsg}</div>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="font-bold">{successMsg}</div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                อีเมลมหาวิทยาลัย (University Email)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="student@university.ac.th"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all bg-white text-slate-900 placeholder:text-slate-400 font-semibold"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all bg-white text-slate-900 placeholder:text-slate-400 font-semibold"
                />
              </div>
            </div>

            {/* Confirm Password Field for Sign Up */}
            {tab === "signup" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  ยืนยันรหัสผ่าน (Confirm Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all bg-white text-slate-900 placeholder:text-slate-400 font-semibold"
                  />
                </div>
              </div>
            )}

            {/* Submit Button - Solid Amber Gold with Deep Black Text for 100% Contrast */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-3 py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all duration-150 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isPending ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{tab === "login" ? "เข้าสู่ระบบเพื่อจองห้อง" : "ยืนยันการลงทะเบียน"}</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          </form>

          {/* Library Portal Footer Info */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 font-semibold text-center flex items-center justify-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>บริการสำหรับนักศึกษา คณาจารย์ และบุคลากรมหาวิทยาลัย</span>
          </div>
        </div>
      </div>
    </div>
  );
}
