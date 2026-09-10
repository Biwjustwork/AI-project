import { createClient } from "@/utils/supabase/server";
import { Room, Booking } from "@/types";
import { RoomCard } from "@/components/RoomCard";
import { DateFilterBar } from "@/components/DateFilterBar";
import { Library, AlertCircle, Sparkles, Clock, ShieldAlert, CheckCircle, Volume2, BookOpenCheck } from "lucide-react";

interface HomePageProps {
  searchParams: {
    date?: string;
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. กำหนดวันที่ที่เลือก (Default: วันนี้ในรูปแบบ YYYY-MM-DD)
  const todayStr = new Date().toISOString().split("T")[0];
  const selectedDate = searchParams?.date && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date)
    ? searchParams.date
    : todayStr;

  // 2. ดึงข้อมูลรายชื่อห้องอ่านหนังสือจาก Supabase (PDF Req #3, AT #03)
  const { data: rawRooms, error: roomsError } = await supabase
    .from("rooms")
    .select("*")
    .eq("is_active", true)
    .order("capacity", { ascending: true });

  const rooms: Room[] = (rawRooms as Room[]) || [];

  // 3. ดึงรายการจองที่ confirmed ในวันที่เลือก เพื่อคำนวณ slot ที่ไม่ว่าง (PDF Req #4, AT #04)
  const { data: rawBookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_date", selectedDate)
    .eq("status", "confirmed");

  const bookings: Booking[] = (rawBookings as Booking[]) || [];

  // จัดกลุ่มรอบเวลาที่ถูกจองตาม roomId
  const bookedSlotsByRoom: Record<string, string[]> = {};
  const myBookedSlotsByRoom: Record<string, string[]> = {};

  bookings.forEach((b) => {
    if (!bookedSlotsByRoom[b.room_id]) {
      bookedSlotsByRoom[b.room_id] = [];
    }
    bookedSlotsByRoom[b.room_id].push(b.time_slot);

    if (user && b.user_id === user.id) {
      if (!myBookedSlotsByRoom[b.room_id]) {
        myBookedSlotsByRoom[b.room_id] = [];
      }
      myBookedSlotsByRoom[b.room_id].push(b.time_slot);
    }
  });

  return (
    <div className="space-y-8">
      {/* Library Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-7 sm:p-10 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-4">
            <Library className="w-4 h-4 text-amber-400" />
            สำนักหอสมุดกลาง มหาวิทยาลัย (Central Library Portal)
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            พื้นที่อ่านหนังสือและห้องศึกษากลุ่ม
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2.5 leading-relaxed">
            จองพื้นที่สำหรับการค้นคว้า ทำงานวิจัย ติวหนังสือ และประชุมโครงงานวิชาการได้อย่างสะดวกและเป็นระเบียบ
          </p>

          {/* Library Info Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-5 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-amber-300 font-semibold">
              <Clock className="w-4 h-4 text-amber-400" />
              เปิดบริการ: 08:30 - 20:00 น.
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-emerald-300 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              พร้อมให้บริการ {rooms.length} ห้อง
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300">
              <Volume2 className="w-4 h-4 text-slate-400" />
              โปรดรักษาความสงบในพื้นที่ส่วนรวม
            </div>
          </div>
        </div>

        {/* Decorative background ambient light */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 bottom-0 -mb-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Date Filter Bar */}
      <DateFilterBar currentDate={selectedDate} />

      {/* Database Setup Alert */}
      {roomsError && (
        <div className="p-6 rounded-3xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3.5 shadow-sm">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm space-y-1.5">
            <p className="font-extrabold text-base text-amber-900">ยังไม่ได้เชื่อมต่อฐานข้อมูล Supabase</p>
            <p className="text-amber-800 text-xs leading-relaxed">
              กรุณานำโค้ดในไฟล์ <code className="bg-amber-100/90 text-amber-950 px-2 py-0.5 rounded font-mono font-bold">supabase/schema.sql</code> และ <code className="bg-amber-100/90 text-amber-950 px-2 py-0.5 rounded font-mono font-bold">supabase/seed.sql</code> ไปรันใน Supabase SQL Editor และระบุคีย์ใน <code className="bg-amber-100/90 text-amber-950 px-2 py-0.5 rounded font-mono font-bold">.env.local</code>
            </p>
          </div>
        </div>
      )}

      {/* Rooms Grid */}
      {rooms.length === 0 && !roomsError ? (
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <Library className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">ไม่พบข้อมูลห้องอ่านหนังสือ</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            กรุณารันไฟล์ <code className="font-mono bg-slate-100 px-2 py-0.5 rounded">supabase/seed.sql</code> เพื่อโหลดข้อมูลห้องอ่านหนังสือเริ่มต้น
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>ห้องอ่านหนังสือและห้องศึกษากลุ่ม</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {rooms.length} ห้อง
              </span>
            </h2>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                ว่าง (กดจองได้)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
                เต็มแล้ว
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                การจองของคุณ
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                bookingDate={selectedDate}
                bookedSlots={bookedSlotsByRoom[room.id] || []}
                myBookedSlots={myBookedSlotsByRoom[room.id] || []}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
