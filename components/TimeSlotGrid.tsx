"use client";

import { TIME_SLOTS, TimeSlot } from "@/types";
import { Clock, CheckCircle, Ban, UserCheck } from "lucide-react";

interface TimeSlotGridProps {
  bookedSlots: string[]; // List of time_slot strings booked for this room on this date
  myBookedSlots?: string[]; // Slots booked specifically by current user
  onSelectSlot: (slot: TimeSlot) => void;
}

export function TimeSlotGrid({
  bookedSlots,
  myBookedSlots = [],
  onSelectSlot,
}: TimeSlotGridProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          รอบเวลาว่างวันนี้
        </span>
        <span className="text-[11px] font-normal text-slate-400">
          ว่าง {TIME_SLOTS.length - bookedSlots.length}/{TIME_SLOTS.length} รอบ
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {TIME_SLOTS.map((slot) => {
          const isMyBooking = myBookedSlots.includes(slot);
          const isBooked = bookedSlots.includes(slot);

          if (isMyBooking) {
            return (
              <div
                key={slot}
                className="px-3 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/80 text-indigo-800 text-xs font-medium flex items-center justify-between"
              >
                <span className="font-semibold">{slot}</span>
                <span className="inline-flex items-center gap-1 text-[11px] bg-indigo-200/70 text-indigo-900 px-2 py-0.5 rounded-md font-medium">
                  <UserCheck className="w-3 h-3" />
                  คุณจองแล้ว
                </span>
              </div>
            );
          }

          if (isBooked) {
            return (
              <div
                key={slot}
                className="px-3 py-2.5 rounded-xl border border-rose-200/60 bg-rose-50/50 text-slate-400 text-xs font-medium flex items-center justify-between cursor-not-allowed opacity-75"
              >
                <span className="line-through text-slate-500">{slot}</span>
                <span className="inline-flex items-center gap-1 text-[11px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md font-medium">
                  <Ban className="w-3 h-3" />
                  ไม่ว่าง
                </span>
              </div>
            );
          }

          // Available slot
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onSelectSlot(slot)}
              className="px-3 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/40 hover:bg-emerald-100/70 hover:border-emerald-400 text-slate-800 text-xs font-medium flex items-center justify-between transition-all duration-150 group cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <span className="font-bold text-slate-900 group-hover:text-emerald-900">
                {slot}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-md font-semibold group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <CheckCircle className="w-3 h-3" />
                ว่าง (จอง)
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
