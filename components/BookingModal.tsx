"use client";

import { useState, useTransition } from "react";
import { Room, TimeSlot } from "@/types";
import { createBooking } from "@/app/actions/booking";
import { X, Calendar, Clock, MapPin, Users, Library, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-inner">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                ยืนยันการจองห้องอ่านหนังสือ
              </h3>
              <p className="text-xs text-amber-300 font-medium">สำนักหอสมุดกลาง มหาวิทยาลัย</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Room & Time Summary Slip */}
        <div className="p-6 bg-slate-50/80 border-b border-slate-200 space-y-4">
          <div>
            <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
              ห้องที่เลือก
            </div>
            <h4 className="font-extrabold text-slate-900 text-lg">{room.name}</h4>
            <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                {room.location}
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                ความจุ {room.capacity} คน
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs shadow-2xs">
              <span className="text-slate-500 block mb-0.5 font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                วันที่จอง
              </span>
              <span className="font-extrabold text-slate-900 text-sm">{displayThaiDate(bookingDate)}</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs shadow-2xs">
              <span className="text-amber-950 block mb-0.5 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                รอบเวลา
              </span>
              <span className="font-extrabold text-amber-950 text-sm">{timeSlot} น.</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              วัตถุประสงค์การใช้งานห้อง <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="เช่น อ่านหนังสือสอบปลายภาควิชาเคมี, ประชุมวางแผนสัมมนากลุ่ม"
              className="w-full p-3.5 text-sm rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all text-slate-900 placeholder:text-slate-400 font-medium"
            />
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span>* กรุณาระบุอย่างน้อย 3 ตัวอักษร</span>
              <span>{purpose.trim().length}/3</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 rounded-2xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black transition-all shadow-md shadow-amber-500/20 hover:shadow-lg flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>ยืนยันการจอง</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
