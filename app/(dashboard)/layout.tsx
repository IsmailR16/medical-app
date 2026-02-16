import { redirect } from "next/navigation";
import { getOrCreateUser } from "@/lib/auth/user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // JIT user sync: fetches or creates the user row in Supabase
  const user = await getOrCreateUser();

  // If no Clerk session exists, redirect to sign-in
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h1 className="text-2xl font-bold mb-8">MedSim AI</h1>
        <nav className="space-y-4">
          <a href="/dashboard" className="block hover:text-gray-300">Home</a>
          <a href="/dashboard/patients" className="block hover:text-gray-300">Patients</a>
          <a href="/dashboard/settings" className="block hover:text-gray-300">Settings</a>
        </nav>
        <div className="mt-auto pt-8 text-sm text-gray-400">
          <p>{user.full_name ?? user.email}</p>
          <p className="capitalize">{user.plan} plan</p>
        </div>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}