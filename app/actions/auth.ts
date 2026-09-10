"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร"),
});

export type AuthResult = {
  success: boolean;
  error?: string;
  message?: string;
};

export async function login(prevState: any, formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validation = authSchema.safeParse({ email, password });
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let friendlyMessage = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
    if (error.message.toLowerCase().includes("email not confirmed")) {
      friendlyMessage = "กรุณายืนยันอีเมลในกล่องข้อความของคุณก่อนเข้าสู่ระบบ";
    }
    return {
      success: false,
      error: friendlyMessage,
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(prevState: any, formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) {
    return {
      success: false,
      error: "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน",
    };
  }

  const validation = authSchema.safeParse({ email, password });
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    let friendlyMessage = error.message;
    if (error.message.toLowerCase().includes("user already registered")) {
      friendlyMessage = "อีเมลนี้มีอยู่ในระบบแล้ว กรุณาเข้าสู่ระบบ";
    }
    return {
      success: false,
      error: friendlyMessage,
    };
  }

  // If session is immediately established (email confirmation disabled in Supabase)
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  return {
    success: true,
    message: "สมัครสมาชิกสำเร็จ! หากระบบต้องการการยืนยันอีเมล กรุณาตรวจสอบกล่องข้อความของคุณก่อนเข้าสู่ระบบ",
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
