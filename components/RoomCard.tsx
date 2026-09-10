"use client";

import { useState } from "react";
import { Room, TimeSlot } from "@/types";
import { TimeSlotGrid } from "./TimeSlotGrid";
import { BookingModal } from "./BookingModal";
import { Users, MapPin, Sparkles } from "lucide-react";

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

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between">
        {/* Room Header Info */}
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
            <h3 className="font-bold text-lg text-slate-900 tracking-tight">
              {room.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                <Users className="w-3.5 h-3.5" />
                {room.capacity} ที่นั่ง
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{room.location}</span>
          </div>

          {room.description && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              {room.description}
            </p>
          )}

          {/* Amenities Badges */}
          {room.amenities && room.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {room.amenities.map((amenity, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60"
                >
                  <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                  {amenity}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Time Slot Picker Grid */}
        <div className="p-5 sm:p-6 bg-slate-50/50">
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
