import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import React from "react";

export default async function AdminLoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // If they are not logged into the main app at all, don't even let them see the admin login page.
    if (!session?.user) {
        notFound();
    }

    const role = session.user.role;

    // If they are just a normal user, hide the admin login page
    if (role === "user") {
        notFound();
    }

    // If they are ALREADY an admin or superadmin, they don't need to log in again.
    if (role === "admin" || role === "superadmin") {
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
