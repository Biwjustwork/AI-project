"use client";

import { useState, useTransition } from "react";
import { Booking } from "@/types";
import { updateBookingPurpose, cancelBooking } from "@/app/actions/booking";
import { Calendar, Clock, MapPin, Edit3, Trash2, CheckCircle2, AlertTriangle, AlertCircle, X, Check } from "lucide-react";

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
      className={`bg-white rounded-2xl border transition-all duration-200 p-5 sm:p-6 ${
        isConfirmed
          ? "border-slate-200/80 shadow-xs hover:shadow-md"
          : "border-slate-200/50 bg-slate-50/70 opacity-70"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                isConfirmed
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {isConfirmed ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  ยืนยันการจองแล้ว
                </>
              ) : (
                "ยกเลิกการจองแล้ว"
              )}
            </span>
          </div>
          <h3 className="font-bold text-base sm:text-lg text-slate-900">
            {booking.room?.name || "ห้องอ่านหนังสือ"}
          </h3>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{booking.room?.location || "อาคารหอสมุดกลาง"}</span>
          </div>
        </div>

        {/* Date & Time Badge */}
        <div className="flex sm:flex-col items-start sm:items-end gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            {displayThaiDate(booking.booking_date)}
          </div>
          <div className="flex items-center gap-1.5 font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            {booking.time_slot} น.
          </div>
        </div>
      </div>

      {/* Purpose Section */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
          วัตถุประสงค์การใช้งาน
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              rows={2}
              value={newPurpose}
              onChange={(e) => setNewPurpose(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isPending}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                บันทึก
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewPurpose(booking.purpose);
                  setIsEditing(false);
                }}
                disabled={isPending}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium cursor-pointer"
              >
                <X className="w-3 h-3" />
                ยกเลิก
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-slate-700 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed">
            {booking.purpose}
          </p>
        )}
      </div>

      {errorMsg && (
        <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Buttons for Confirmed Bookings */}
      {isConfirmed && !isEditing && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            แก้ไขวัตถุประสงค์
          </button>

          {isCancelling ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-600 font-medium">ยืนยันยกเลิก?</span>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isPending}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                ใช่, ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => setIsCancelling(false)}
                disabled={isPending}
                className="px-2.5 py-1 rounded-lg border border-slate-300 text-slate-600 text-xs font-medium cursor-pointer"
              >
                ไม่
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsCancelling(true)}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              ยกเลิกการจอง
            </button>
          )}
        </div>
      )}
    </div>
  );
}
