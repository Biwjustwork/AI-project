"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react";

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
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            เลือกวันที่ต้องการจอง
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {displayThaiDate(currentDate)}
          </h2>
        </div>

        {/* Quick Date Chips & Date Picker */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {quickDates.map((item) => {
              const isSelected = currentDate === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleDateChange(item.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white text-indigo-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
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
              className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-300 text-slate-700 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
