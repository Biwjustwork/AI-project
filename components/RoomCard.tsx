"use client";

import { useState } from "react";
import { Room, TimeSlot } from "@/types";
import { TimeSlotGrid } from "./TimeSlotGrid";
import { BookingModal } from "./BookingModal";
import { Users, MapPin, Sparkles, VolumeX, Users2, Video, ShieldCheck } from "lucide-react";

interface RoomCardProps {
  room: Room;
  bookingDate: string;
  bookedSlots: string[];
  myBookedSlots?: string[];
}

export function RoomCard({
  room,
  bookingDate,
  bookedSlots,
  myBookedSlots = [],
}: RoomCardProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  // Helper for Academic Zone Badge
  const getZoneBadge = () => {
    if (room.capacity <= 2) {
      return {
        label: "โซนเงียบสงบ (Silent Zone)",
        icon: VolumeX,
        color: "bg-teal-50 text-teal-800 border-teal-200",
      };
    }
    if (room.name.includes("มัลติมีเดีย") || room.capacity >= 10) {
      return {
        label: "โซนมัลติมีเดีย & นำเสนอ (Media Hub)",
        icon: Video,
        color: "bg-purple-50 text-purple-800 border-purple-200",
      };
    }
    return {
      label: "โซนทำงานกลุ่ม (Collaboration Zone)",
      icon: Users2,
      color: "bg-amber-50 text-amber-900 border-amber-200",
    };
  };

  const zone = getZoneBadge();
  const ZoneIcon = zone.icon;

  return (
    <>
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group">
        {/* Room Header Info */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${zone.color}`}>
              <ZoneIcon className="w-3.5 h-3.5" />
              {zone.label}
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-300 text-xs font-bold shadow-xs">
              <Users className="w-3.5 h-3.5" />
              ความจุ {room.capacity} ที่นั่ง
            </span>
          </div>

          <h3 className="font-extrabold text-lg text-slate-900 tracking-tight group-hover:text-amber-700 transition-colors mb-1.5">
            {room.name}
          </h3>

          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-3.5">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{room.location}</span>
          </div>

          {room.description && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">
              {room.description}
            </p>
          )}

          {/* Amenities Badges */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {room.amenities.map((amenity, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100/90 text-slate-700 px-2.5 py-1 rounded-xl border border-slate-200"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {amenity}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Time Slot Picker Grid */}
        <div className="p-6 bg-slate-50/70 border-t border-slate-100/80">
          <TimeSlotGrid
            bookedSlots={bookedSlots}
            myBookedSlots={myBookedSlots}
            onSelectSlot={handleSelectSlot}
          />
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        room={room}
        bookingDate={bookingDate}
        timeSlot={selectedSlot}
      />
    </>
  );
}
