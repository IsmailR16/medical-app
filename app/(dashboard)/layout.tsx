import React from 'react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen">
            <aside className="w-64 bg-gray-900 text-white p-4">
                <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
                <nav className="space-y-4">
                    <a href="#" className="block hover:text-gray-300">Home</a>
                    <a href="#" className="block hover:text-gray-300">Patients</a>
                    <a href="#" className="block hover:text-gray-300">Settings</a>
                </nav>
            </aside>
            <main className="flex-1">{children}</main>
        </div>
    );
}