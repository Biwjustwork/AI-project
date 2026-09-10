import { createClient } from "@/utils/supabase/server";
import { Booking } from "@/types";
import { MyBookingCard } from "@/components/MyBookingCard";
import Link from "next/link";
import { BookmarkCheck, CalendarPlus, AlertCircle, ArrowLeft } from "lucide-react";

export default async function MyBookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // ดึงรายการจองเฉพาะของผู้ใช้คนปัจจุบัน (Acceptance Test #05, #06)
  const { data: rawBookings, error } = await supabase
    .from("bookings")
    .select(`
      *,
      room:rooms(*)
    `)
    .eq("user_id", user.id)
    .order("booking_date", { ascending: false })
    .order("time_slot", { ascending: true });

  const bookings: Booking[] = (rawBookings as Booking[]) || [];

  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            กลับไปหน้าหลัก
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookmarkCheck className="w-6 h-6 text-indigo-600" />
            รายการจองของฉัน
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            จัดการและตรวจสอบประวัติการจองห้องอ่านหนังสือทั้งหมดของคุณ
          </p>
        </div>

        {/* Stats Chips */}
        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
            ยืนยันแล้ว: {confirmedCount}
          </div>
          {cancelledCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-medium">
              ยกเลิกแล้ว: {cancelledCount}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>เกิดข้อผิดพลาดในการโหลดรายการจอง: {error.message}</div>
        </div>
      )}

      {/* Bookings List */}
      {bookings.length === 0 && !error ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3.5">
            <BookmarkCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">ยังไม่มีประวัติการจองห้อง</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto mb-5">
            คุณยังไม่ได้ทำการจองห้องอ่านหนังสือ สามารถดูห้องว่างและเริ่มจองได้ทันที
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
          >
            <CalendarPlus className="w-4 h-4" />
            ค้นหาและจองห้องอ่านหนังสือ
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <MyBookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}
