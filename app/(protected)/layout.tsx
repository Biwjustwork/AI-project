import { createClient } from "@/utils/supabase/server";
import { Navbar } from "@/components/Navbar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar userEmail={user?.email} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} ระบบจองห้องอ่านหนังสือมหาวิทยาลัย (University Study Room Booking System)</p>
          <p className="mt-1 text-slate-400">พัฒนาด้วย Next.js App Router, Tailwind CSS, และ Supabase PostgreSQL</p>
        </div>
      </footer>
    </div>
  );
}
