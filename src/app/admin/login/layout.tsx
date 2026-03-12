import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import React from "react";

export default async function AdminLoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    const role = session?.user?.role;
    const isAdmin = role === "admin" || role === "superadmin";

    // If they are ALREADY an admin or superadmin, they don't need to log in again.
    if (isAdmin) {
        redirect("/admin/notifications");
    }

    // Wrap in a layout that overrides the global admin layout
    // We achieve this via Next.js route groups later if needed, but since 
    // it's a child of /admin, it will render inside the main admin layout 
    // UNLESS we use a route group (e.g. `(admin)`). 
    // However, to keep it simple, we just render children here.
    return (
        <>
            {children}
        </>
    );
}
