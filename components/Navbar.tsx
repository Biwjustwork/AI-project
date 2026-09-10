"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { logout } from "@/app/actions/auth";
import { Library, CalendarDays, BookmarkCheck, LogOut, User, Sparkles, Clock } from "lucide-react";

interface NavbarProps {
  userEmail?: string | null;
}

export function Navbar({ userEmail }: NavbarProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  const navLinks = [
    { href: "/", label: "ห้องอ่านหนังสือทั้งหมด", icon: CalendarDays },
    { href: "/my-bookings", label: "การจองของฉัน", icon: BookmarkCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo - University Library Style */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
                <Library className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base sm:text-lg text-white tracking-tight block">
                    สำนักหอสมุดกลาง
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    LIB-PORTAL
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-400 block -mt-0.5">
                  ระบบจองห้องอ่านหนังสือและห้องศึกษากลุ่ม
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-2xl border border-slate-700/60">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-amber-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3">
            {userEmail && (
              <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-medium">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                  {userEmail[0].toUpperCase()}
                </div>
                <span className="max-w-[140px] truncate">{userEmail}</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              disabled={isPending}
              title="ออกจากระบบ"
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/30 text-xs sm:text-sm font-medium transition-all duration-150 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogOut className="w-4 h-4 text-slate-400" />
                  <span className="hidden sm:inline">ออกจากระบบ</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Links */}
        <div className="flex md:hidden border-t border-slate-800 py-2.5 gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 py-2 text-center text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition-all ${
                  isActive
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-300 bg-slate-800/60 hover:bg-slate-800"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-slate-950" : "text-amber-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
