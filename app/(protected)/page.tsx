import { createClient } from "@/utils/supabase/server";
import { Room, Booking } from "@/types";
import { RoomCard } from "@/components/RoomCard";
import { DateFilterBar } from "@/components/DateFilterBar";
import { BookOpen, AlertCircle, Info, Sparkles } from "lucide-react";

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
      {/* Hero / Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-10 shadow-lg shadow-indigo-950/20">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-700/60 border border-indigo-500/30 text-indigo-200 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            จองห้องอ่านหนังสือและห้องศึกษากลุ่ม
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            พื้นที่อ่านหนังสือและทำงานกลุ่ม
          </h1>
          <p className="text-sm sm:text-base text-indigo-200/90 mt-2 leading-relaxed">
            เลือกห้องและรอบเวลาที่ต้องการเพื่อจองพื้นที่อ่านหนังสือส่วนตัวหรือห้องสัมมนากลุ่มได้อย่างสะดวกรวดเร็ว
          </p>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Date Filter Bar */}
      <DateFilterBar currentDate={selectedDate} />

      {/* Database Error / Setup Guide Fallback */}
      {roomsError && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3.5">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-bold">ยังไม่ได้เชื่อมต่อฐานข้อมูล Supabase หรือยังไม่ได้รัน Migration</p>
            <p className="text-amber-800 text-xs">
              กรุณานำโค้ดในไฟล์ <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">supabase/schema.sql</code> และ <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">supabase/seed.sql</code> ไปรันใน Supabase SQL Editor และตั้งค่า <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">.env.local</code>
            </p>
          </div>
        </div>
      )}

      {/* Rooms Grid */}
      {rooms.length === 0 && !roomsError ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">ไม่พบข้อมูลห้องอ่านหนังสือ</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            กรุณารันไฟล์ <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">supabase/seed.sql</code> บน Supabase เพื่อสร้างข้อมูลห้องเริ่มต้น
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>ห้องอ่านหนังสือทั้งหมด</span>
              <span className="text-xs font-normal text-slate-500">
                ({rooms.length} ห้อง)
              </span>
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                ว่าง
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                ไม่ว่าง
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                คุณจองแล้ว
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
