"use client";

import { useState, useTransition } from "react";
import { Booking } from "@/types";
import { updateBookingPurpose, cancelBooking } from "@/app/actions/booking";
import { Calendar, Clock, MapPin, Edit3, Trash2, CheckCircle2, AlertCircle, X, Check, FileText } from "lucide-react";

interface MyBookingCardProps {
  booking: Booking;
}

export function MyBookingCard({ booking }: MyBookingCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newPurpose, setNewPurpose] = useState(booking.purpose);
  const [isCancelling, setIsCancelling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isConfirmed = booking.status === "confirmed";

  const handleUpdate = () => {
    if (newPurpose.trim().length < 3) {
      setErrorMsg("วัตถุประสงค์ต้องมีความยาวอย่างน้อย 3 ตัวอักษร");
      return;
    }
    setErrorMsg(null);

    startTransition(async () => {
      const res = await updateBookingPurpose(booking.id, newPurpose);
      if (!res.success) {
        setErrorMsg(res.error || "ไม่สามารถแก้ไขได้");
      } else {
        setIsEditing(false);
      }
    });
  };

  const handleCancel = () => {
    setErrorMsg(null);

    startTransition(async () => {
      const res = await cancelBooking(booking.id);
      if (!res.success) {
        setErrorMsg(res.error || "ไม่สามารถยกเลิกได้");
      } else {
        setIsCancelling(false);
      }
    });
  };

  const displayThaiDate = (ymdStr: string) => {
    try {
      const [y, m, d] = ymdStr.split("-").map(Number);
      return new Date(y, m - 1, d).toLocaleDateString("th-TH", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return ymdStr;
    }
  };

  return (
    <div
      className={`bg-white rounded-3xl border transition-all duration-200 p-6 sm:p-7 ${
        isConfirmed
          ? "border-slate-200 shadow-sm hover:shadow-md"
          : "border-slate-200/60 bg-slate-50/70 opacity-60"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isConfirmed
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {isConfirmed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  ยืนยันการจองเรียบร้อย
                </>
              ) : (
                "ยกเลิกการจองแล้ว"
              )}
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-500">
              #BK-{booking.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <h3 className="font-extrabold text-lg sm:text-xl text-slate-900">
            {booking.room?.name || "ห้องอ่านหนังสือ"}
          </h3>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-1">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{booking.room?.location || "อาคารหอสมุดกลาง"}</span>
          </div>
        </div>

        {/* Date & Time Badges */}
        <div className="flex sm:flex-col items-start sm:items-end gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            {displayThaiDate(booking.booking_date)}
          </div>
          <div className="flex items-center gap-1.5 font-extrabold text-amber-950 bg-amber-500/15 px-3 py-1.5 rounded-xl border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            {booking.time_slot} น.
          </div>
        </div>
      </div>

      {/* Purpose Section */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          วัตถุประสงค์การใช้งาน
        </div>

        {isEditing ? (
          <div className="space-y-2.5">
            <textarea
              rows={2}
              value={newPurpose}
              onChange={(e) => setNewPurpose(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm rounded-2xl border-2 border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-900 bg-white font-medium"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5 text-slate-950" />
                บันทึกการแก้ไข
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewPurpose(booking.purpose);
                  setIsEditing(false);
                }}
                disabled={isPending}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                ยกเลิก
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-slate-800 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 leading-relaxed font-semibold">
            {booking.purpose}
          </p>
        )}
      </div>

      {errorMsg && (
        <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Buttons for Confirmed Bookings */}
      {isConfirmed && !isEditing && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs font-extrabold text-amber-900 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200/60 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-700" />
            แก้ไขวัตถุประสงค์
          </button>

          {isCancelling ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-800 font-extrabold">ยืนยันยกเลิก?</span>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer shadow-xs disabled:opacity-50"
              >
                ใช่, ยกเลิกการจอง
              </button>
              <button
                type="button"
                onClick={() => setIsCancelling(false)}
                disabled={isPending}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                ไม่
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsCancelling(true)}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200/60 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              ยกเลิกการจอง
            </button>
          )}
        </div>
      )}
    </div>
  );
}
