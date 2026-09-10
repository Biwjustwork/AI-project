-- ============================================================
-- University Study Room Booking System - Database Schema
-- Capstone Workshop: Vibe Coding + Database
-- ============================================================

-- 1. Create Rooms Table (อ้างอิง PDF P.2 Req #3)
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0),
    location TEXT NOT NULL,
    description TEXT,
    amenities TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Create Bookings Table (อ้างอิง PDF P.2 Req #5, #6, #7)
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    booking_date DATE NOT NULL,
    time_slot TEXT NOT NULL CHECK (time_slot IN (
        '09:00-11:00',
        '11:00-13:00',
        '13:00-15:00',
        '15:00-17:00',
        '17:00-19:00'
    )),
    purpose TEXT NOT NULL CHECK (length(trim(purpose)) >= 3),
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. Concurrency & Anti-Double-Booking Constraint (อ้างอิง PDF P.2 Req #7, P.3 Security, AT #07)
-- ป้องกันการจองห้องเดียวกัน วันเดียวกัน รอบเดียวกันซ้ำ (เฉพาะสถานะ confirmed)
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_room_date_slot 
ON public.bookings (room_id, booking_date, time_slot) 
WHERE status = 'confirmed';

-- Indexes เพื่อเพิ่มประสิทธิภาพการค้นหาตามวันที่และผู้ใช้
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room ON public.bookings(room_id);

-- 4. Enable Row Level Security (RLS) (อ้างอิง PDF P.3 Security, AT #05, #06, #10)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: rooms
DROP POLICY IF EXISTS "Allow authenticated users to read rooms" ON public.rooms;
CREATE POLICY "Allow authenticated users to read rooms"
ON public.rooms FOR SELECT
TO authenticated
USING (is_active = TRUE);

-- 6. RLS Policies: bookings
-- 6.1 Read: ให้ผู้ใช้ที่ล็อกอินทุกคนดูการจองที่ confirmed เพื่อคำนวณ slot ว่าง (PDF P.2 Req #4)
DROP POLICY IF EXISTS "Allow authenticated users to view active bookings" ON public.bookings;
CREATE POLICY "Allow authenticated users to view active bookings"
ON public.bookings FOR SELECT
TO authenticated
USING (status = 'confirmed');

-- 6.2 Insert: ผู้ใช้สามารถสร้างการจองเฉพาะของตนเอง (user_id ต้องตรงกับ auth.uid()) (PDF P.3 Security)
DROP POLICY IF EXISTS "Allow authenticated users to create their own bookings" ON public.bookings;
CREATE POLICY "Allow authenticated users to create their own bookings"
ON public.bookings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 6.3 Update: แก้ไขได้เฉพาะรายการของตนเอง (PDF P.2 Req #6, AT #05, #06)
DROP POLICY IF EXISTS "Allow users to update their own bookings" ON public.bookings;
CREATE POLICY "Allow users to update their own bookings"
ON public.bookings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6.4 Delete: ลบได้เฉพาะรายการของตนเอง (PDF P.2 Req #6, AT #05, #06)
DROP POLICY IF EXISTS "Allow users to delete their own bookings" ON public.bookings;
CREATE POLICY "Allow users to delete their own bookings"
ON public.bookings FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
