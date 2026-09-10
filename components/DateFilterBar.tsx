"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar as CalendarIcon, Sparkles, ChevronRight } from "lucide-react";

interface DateFilterBarProps {
  currentDate: string;
}

export function DateFilterBar({ currentDate }: DateFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper to format Date to YYYY-MM-DD
  const formatYMD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);

  const todayStr = formatYMD(today);
  const tomorrowStr = formatYMD(tomorrow);
  const dayAfterStr = formatYMD(dayAfter);

  const quickDates = [
    { label: "วันนี้", value: todayStr },
    { label: "พรุ่งนี้", value: tomorrowStr },
    { label: "มะรืนนี้", value: dayAfterStr },
  ];

  const handleDateChange = (date: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", date);
    router.push(`/?${params.toString()}`);
  };

  // Format display date in Thai
  const displayThaiDate = (ymdStr: string) => {
    try {
      const [y, m, d] = ymdStr.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString("th-TH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return ymdStr;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-500/20">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              รอบวันที่ต้องการจองห้อง
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              {displayThaiDate(currentDate)}
            </h2>
          </div>
        </div>

        {/* Quick Date Chips & Date Picker */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
            {quickDates.map((item) => {
              const isSelected = currentDate === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleDateChange(item.value)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-amber-400 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Date Input */}
          <div className="relative">
            <input
              type="date"
              value={currentDate}
              min={todayStr}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3.5 py-2 text-xs font-semibold rounded-2xl border border-slate-300 text-slate-800 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all cursor-pointer shadow-2xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
