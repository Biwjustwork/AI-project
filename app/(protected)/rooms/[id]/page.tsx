import { createClient } from "@/utils/supabase/server";
import { Room, Booking } from "@/types";
import { RoomCard } from "@/components/RoomCard";
import { DateFilterBar } from "@/components/DateFilterBar";
import Link from "next/link";
import { ArrowLeft, BookOpen, AlertCircle } from "lucide-react";
import { notFound } from "next/navigation";

interface RoomDetailPageProps {
  params: {
    id: string;
  };
  searchParams: {
    date?: string;
  };
}

export default async function RoomDetailPage({
  params,
  searchParams,
}: RoomDetailPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const todayStr = new Date().toISOString().split("T")[0];
  const selectedDate = searchParams?.date && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date)
    ? searchParams.date
    : todayStr;

  // ดึงข้อมูลห้องเฉพาะ id
  const { data: rawRoom, error: roomError } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", params.id)
    .single();

  if (roomError || !rawRoom) {
    notFound();
  }

  const room = rawRoom as Room;

  // ดึงรายการจองในวันที่เลือก
  const { data: rawBookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("room_id", room.id)
    .eq("booking_date", selectedDate)
    .eq("status", "confirmed");

  const bookings: Booking[] = (rawBookings as Booking[]) || [];

  const bookedSlots = bookings.map((b) => b.time_slot);
  const myBookedSlots = user
    ? bookings.filter((b) => b.user_id === user.id).map((b) => b.time_slot)
    : [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          กลับไปหน้ารวมห้อง
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          {room.name}
        </h1>
      </div>

      <DateFilterBar currentDate={selectedDate} />

      <RoomCard
        room={room}
        bookingDate={selectedDate}
        bookedSlots={bookedSlots}
        myBookedSlots={myBookedSlots}
      />
    </div>
  );
}
