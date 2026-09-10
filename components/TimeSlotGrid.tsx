"use client";

import { TIME_SLOTS, TimeSlot } from "@/types";
import { Clock, CheckCircle2, Ban, UserCheck } from "lucide-react";

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
  const availableCount = TIME_SLOTS.length - bookedSlots.length;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          รอบเวลาการใช้งาน
        </span>
        <span
          className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
            availableCount > 0
              ? "bg-emerald-100/90 text-emerald-900 border-emerald-300"
              : "bg-slate-200 text-slate-700 border-slate-300"
          }`}
        >
          ว่าง {availableCount}/{TIME_SLOTS.length} รอบ
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {TIME_SLOTS.map((slot) => {
          const isMyBooking = myBookedSlots.includes(slot);
          const isBooked = bookedSlots.includes(slot);

          // 1. User's Own Booking State
          if (isMyBooking) {
            return (
              <div
                key={slot}
                className="px-3.5 py-2.5 rounded-2xl border-2 border-indigo-300 bg-indigo-50/90 text-indigo-950 text-xs font-bold flex items-center justify-between shadow-2xs"
              >
                <span className="font-extrabold text-indigo-950">{slot} น.</span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-700 text-white px-2 py-0.5 rounded-lg font-bold shadow-2xs">
                  <UserCheck className="w-3 h-3" />
                  คุณจองแล้ว
                </span>
              </div>
            );
          }

          // 2. Booked by other users State
          if (isBooked) {
            return (
              <div
                key={slot}
                className="px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-100 text-slate-400 text-xs font-medium flex items-center justify-between cursor-not-allowed opacity-75"
              >
                <span className="line-through text-slate-500 font-semibold">{slot} น.</span>
                <span className="inline-flex items-center gap-1 text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-lg font-semibold">
                  <Ban className="w-3 h-3 text-slate-400" />
                  เต็มแล้ว
                </span>
              </div>
            );
          }

          // 3. Available State - High Contrast, text never sinks on hover!
          return (
            <button
              key={slot}
              type="button"
              onClick={() => onSelectSlot(slot)}
              className="px-3.5 py-2.5 rounded-2xl border-2 border-emerald-300 bg-emerald-50/80 hover:bg-emerald-100 hover:border-emerald-500 text-emerald-950 text-xs font-extrabold flex items-center justify-between transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
            >
              <span className="text-emerald-950 font-extrabold tracking-tight">
                {slot} น.
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-lg font-extrabold shadow-2xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                จองรอบนี้
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
