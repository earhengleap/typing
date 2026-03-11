import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";
import Link from "next/link";
import { Users, BellRing, ArrowLeft } from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // The login page handles its own redirect logic.
    // However, since it sits inside /admin, we don't want to show the header if they aren't logged in.
    
    // We can just render children directly without the header if they aren't an admin,
    // and rely on the children (like the login page) to handle what to show.
    // If they ARE an admin, we show the header.
    
    const role = session?.user?.role;
    const isAdmin = role === "admin" || role === "superadmin";
    const isSuperAdmin = role === "superadmin";

    if (!isAdmin) {
        // Just render the children (which will be the login page).
        // The login page's layout or page itself handles bouncing standard users to `/`.
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex flex-col font-mono bg-black text-white">
            <header className="border-b border-white/10 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm font-bold tracking-wider">EXIT</span>
                        </Link>
                        <h1 className="text-xl font-black tracking-tight text-[#ffaa00]">ADMIN PANEL</h1>
                    </div>
                    <nav className="flex items-center gap-6 text-sm font-bold tracking-wider">
                        <Link href="/admin/notifications" className="flex items-center gap-2 hover:text-[#ffaa00] transition-colors">
                            <BellRing className="w-4 h-4" />
                            <span>NOTIFICATIONS</span>
                        </Link>
                        {isSuperAdmin && (
                            <Link href="/admin/users" className="flex items-center gap-2 hover:text-[#ffaa00] transition-colors">
                                <Users className="w-4 h-4" />
                                <span>USERS</span>
                            </Link>
                        )}
                    </nav>
                </div>
            </header>
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}
