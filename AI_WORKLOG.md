# AI Worklog: University Study Room Booking System
**Capstone Workshop: Vibe Coding + Database**

---

## 1. Planning Phase Prompt

```markdown
/plan สร้างแผนในการทำ vibe coding โปรเจคนี้ อ้างอิงจาก requirement ใน workshop-requirement-room-booking-v1.0.pdf
ให้แจกแจงโครงสร้าง database schema, constraints, RLS policies, routes, components, security และลำดับขั้นตอนการลงมือทำ (Phased implementation) เพื่อตอบ Tests ทั้ง 12 ข้อได้
```

### การตัดสินใจและวิเคราะห์ในส่วน Planning
- **Tech Stack:** Next.js (App Router, TypeScript), Tailwind CSS, Lucide Icons, Supabase (PostgreSQL, Supabase Auth, RLS), Zod.
- **Database Architecture:**
  - สร้างตาราง `rooms` และ `bookings`
  - ป้องกัน Double Booking ด้วย Partial Unique Index: `CREATE UNIQUE INDEX unique_active_room_date_slot ON bookings (room_id, booking_date, time_slot) WHERE status = 'confirmed';`
  - บังคับใช้ Row Level Security (RLS) ครบทุก Operation (`SELECT`, `INSERT`, `UPDATE`, `DELETE`)
- **UI/UX Strategy:** ออกแบบในสไตล์ Academic Modernism โดยใช้แนวทางจาก `frontend-design` และ `ui-ux-pro-max` แบ่งเป็น Room Cards และ Interactive Time-Slot Grid (5 รอบเวลามาตรฐาน รอบละ 2 ชั่วโมง)

---

## 2. Implementation Phase Prompt

```markdown
สร้างโปรเจกต์ Next.js ตาม Implementation Plan ที่ได้รับอนุมัติ:
1. สร้างไฟล์ migration DDL `supabase/schema.sql` และข้อมูลเริ่มต้น `supabase/seed.sql`
2. สร้าง Helper Client `@supabase/ssr` (`utils/supabase/server.ts`, `utils/supabase/client.ts`, `utils/supabase/middleware.ts`) และ Route Protection `middleware.ts`
3. สร้าง Server Actions สำหรับ Authentication (`app/actions/auth.ts`) และหน้า `app/(auth)/login/page.tsx`
4. สร้าง Server Actions สำหรับ Booking (`app/actions/booking.ts`) ดักจับ Database Error 23505 และแปลงเป็นข้อความภาษาไทย
5. สร้าง Components (`Navbar`, `DateFilterBar`, `RoomCard`, `TimeSlotGrid`, `BookingModal`, `MyBookingCard`)
6. สร้าง Pages: Dashboard (`app/(protected)/page.tsx`), Room Detail (`app/(protected)/rooms/[id]/page.tsx`), และ My Bookings (`app/(protected)/my-bookings/page.tsx`)
```

---

## 3. Debug & Error Handling Prompt

```markdown
ตรวจสอบและจัดการ Error States ให้ครอบคลุมตามข้อกำหนดใน Acceptance Test #07, #08, #09:
- ตรวจสอบว่า `createBooking` รับ `user_id` จาก `supabase.auth.getUser()` เท่านั้น ห้ามรับจาก payload ของฟอร์ม
- ตรวจสอบว่าเมื่อเกิด Unique Constraint Violation (Code 23505) จะส่งข้อความแจ้งเตือนที่เข้าใจง่าย: "ขออภัย ห้องและช่วงเวลานี้ถูกผู้อื่นจองไปแล้ว กรุณาเลือกรอบเวลาหรือห้องอื่น"
- ตรวจสอบว่า `.gitignore` ซ่อนไฟล์ `.env*.local` และไม่มี Secret/Service Role Key ใน Source Code
```

---

## 4. Final Review & Verification Prompt

```markdown
ทำการ Build และตรวจสอบ Self-Test Checklist ครบทั้ง 12 ข้อตาม Acceptance Tests:
1. สมัครและเข้าสู่ระบบด้วย email/password
2. ป้องกันหน้าที่ต้องเข้าสู่ระบบผ่าน middleware
3. อ่านห้องจาก Supabase
4. ข้อมูลการจองคงอยู่หลัง refresh
5. แก้ไขและยกเลิกการจองของตนเองได้
6. ผู้ใช้อื่นไม่สามารถแก้ไขการจองของผู้อื่นได้ (RLS enforcement)
7. ป้องกันการจองซ้ำด้วย Database Constraint
8. ปฏิเสธฟอร์มที่ข้อมูลไม่ครบถ้วนด้วย Zod
9. แปลง Database Error เป็นภาษาไทย
10. Repository ไม่มี Secret Key
11. Build ผ่านและพร้อม Deploy บน Vercel
12. Redirect URL รองรับ Production Environment
```
