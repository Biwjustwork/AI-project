"use client";

import { useState, useTransition } from "react";
import { Room, TimeSlot } from "@/types";
import { createBooking } from "@/app/actions/booking";
import { X, Calendar, Clock, MapPin, Users, BookOpen, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  bookingDate: string;
  timeSlot: TimeSlot | null;
}

export function BookingModal({
  isOpen,
  onClose,
  room,
  bookingDate,
  timeSlot,
}: BookingModalProps) {
  const [purpose, setPurpose] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen || !room || !timeSlot) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (purpose.trim().length < 3) {
      setErrorMsg("กรุณาระบุวัตถุประสงค์การใช้งานอย่างน้อย 3 ตัวอักษร");
      return;
    }

    const formData = new FormData();
    formData.append("roomId", room.id);
    formData.append("bookingDate", bookingDate);
    formData.append("timeSlot", timeSlot);
    formData.append("purpose", purpose);

    startTransition(async () => {
      const res = await createBooking(formData);
      if (!res.success) {
        setErrorMsg(res.error || "ไม่สามารถจองห้องได้ กรุณาลองใหม่อีกครั้ง");
      } else {
        setSuccessMsg(res.message || "จองห้องสำเร็จเรียบร้อยแล้ว!");
        setTimeout(() => {
          setPurpose("");
          setSuccessMsg(null);
          onClose();
        }, 1200);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-700/80 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-indigo-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">ยืนยันการจองห้องอ่านหนังสือ</h3>
              <p className="text-xs text-indigo-200">ตรวจสอบรายละเอียดก่อนบันทึก</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-indigo-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room & Time Summary */}
        <div className="p-6 bg-slate-50 border-b border-slate-200/80 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-slate-900 text-base">{room.name}</h4>
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {room.location}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  ความจุ {room.capacity} คน
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs">
              <span className="text-slate-400 block mb-0.5 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                วันที่จอง
              </span>
              <span className="font-bold text-slate-800">{displayThaiDate(bookingDate)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs">
              <span className="text-slate-400 block mb-0.5 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                รอบเวลา
              </span>
              <span className="font-bold text-indigo-700">{timeSlot} น.</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-medium">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="font-medium">{successMsg}</div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              วัตถุประสงค์การใช้งาน <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="ระบุวัตถุประสงค์ เช่น ติววิชาระบบฐานข้อมูลสำหรับสอบกลางภาค, ประชุมโครงงานวิจัย"
              className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-900 placeholder:text-slate-400"
            />
            <p className="text-[11px] text-slate-500">
              อย่างน้อย 3 ตัวอักษร (กรอกแล้ว {purpose.trim().length}/3)
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>ยืนยันการจอง</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
