"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";
import { TIME_SLOTS, TimeSlot } from "@/types";

const bookingSchema = z.object({
  roomId: z.string().uuid("รหัสห้องไม่ถูกต้อง"),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ไม่ถูกต้อง (YYYY-MM-DD)"),
  timeSlot: z.enum(TIME_SLOTS as [TimeSlot, ...TimeSlot[]], {
    errorMap: () => ({ message: "รอบเวลาไม่ถูกต้อง" }),
  }),
  purpose: z.string().trim().min(3, "กรุณาระบุวัตถุประสงค์อย่างน้อย 3 ตัวอักษร"),
});

export type ActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

/**
 * สร้างรายการจองห้องใหม่
 * - ดึง user_id จาก session ของ Supabase เท่านั้น (ห้ามรับจากฟอร์ม)
 * - ดักจับ PostgreSQL Error 23505 (Unique Violation) แปลงเป็นข้อความที่เข้าใจง่าย
 */
export async function createBooking(formData: FormData): Promise<ActionResponse> {
  const supabase = await createClient();

  // 1. ตรวจสอบ Authentication & อ่าน user_id จาก Session โดยตรง (PDF P.3 Security)
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: "กรุณาเข้าสู่ระบบก่อนทำรายการจองห้อง",
    };
  }

  // 2. Validate Form Data ด้วย Zod (Acceptance Test #08)
  const rawData = {
    roomId: formData.get("roomId") as string,
    bookingDate: formData.get("bookingDate") as string,
    timeSlot: formData.get("timeSlot") as string,
    purpose: formData.get("purpose") as string,
  };

  const validation = bookingSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "ข้อมูลแบบฟอร์มไม่ถูกต้อง",
    };
  }

  const { roomId, bookingDate, timeSlot, purpose } = validation.data;

  // 3. บันทึกข้อมูลการจองลงตาราง bookings
  const { error: insertError } = await supabase.from("bookings").insert({
    user_id: user.id, // กำหนดจาก Session ที่ผ่านการยืนยันแล้ว
    room_id: roomId,
    booking_date: bookingDate,
    time_slot: timeSlot,
    purpose: purpose,
    status: "confirmed",
  });

  if (insertError) {
    // ดักจับ Unique Constraint Violation (Code 23505) (Acceptance Test #07 & #09)
    if (
      insertError.code === "23505" ||
      insertError.message.includes("unique_active_room_date_slot") ||
      insertError.message.toLowerCase().includes("duplicate key")
    ) {
      return {
        success: false,
        error: "ขออภัย ห้องและช่วงเวลานี้ถูกผู้อื่นจองไปแล้ว กรุณาเลือกรอบเวลาหรือห้องอื่น",
      };
    }

    return {
      success: false,
      error: `ไม่สามารถบันทึกการจองได้: ${insertError.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/my-bookings");
  revalidatePath(`/rooms/${roomId}`);

  return {
    success: true,
    message: "จองห้องอ่านหนังสือสำเร็จเรียบร้อยแล้ว!",
  };
}

/**
 * แก้ไขวัตถุประสงค์การจอง (เฉพาะรายการที่เป็นเจ้าของ)
 * - บังคับสิทธิ์ด้วย RLS และ WHERE user_id = auth.uid()
 */
export async function updateBookingPurpose(
  bookingId: string,
  newPurpose: string
): Promise<ActionResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "กรุณาเข้าสู่ระบบก่อนทำรายการ",
    };
  }

  const trimmedPurpose = newPurpose.trim();
  if (trimmedPurpose.length < 3) {
    return {
      success: false,
      error: "วัตถุประสงค์ต้องมีความยาวอย่างน้อย 3 ตัวอักษร",
    };
  }

  const { error } = await supabase
    .from("bookings")
    .update({
      purpose: trimmedPurpose,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("user_id", user.id); // ป้องกันไม่ให้แก้ของคนอื่น (Acceptance Test #06)

  if (error) {
    return {
      success: false,
      error: `ไม่สามารถแก้ไขรายการได้: ${error.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/my-bookings");

  return {
    success: true,
    message: "แก้ไขวัตถุประสงค์การจองเรียบร้อยแล้ว",
  };
}

/**
 * ยกเลิกการจอง (Soft Delete ปรับ status = 'cancelled')
 * - ปลดปล่อย Unique Constraint เพื่อให้ผู้ใช้อื่นจองรอบเวลานี้ได้ทันที
 */
export async function cancelBooking(bookingId: string): Promise<ActionResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "กรุณาเข้าสู่ระบบก่อนทำรายการ",
    };
  }

  const { error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("user_id", user.id); // ป้องกันไม่ให้ยกเลิกของคนอื่น (Acceptance Test #06)

  if (error) {
    return {
      success: false,
      error: `ไม่สามารถยกเลิกการจองได้: ${error.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/my-bookings");

  return {
    success: true,
    message: "ยกเลิกการจองเรียบร้อยแล้ว",
  };
}
