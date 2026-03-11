import { auth } from "@/auth";
import { notFound } from "next/navigation";
import React from "react";

export default async function AdminUsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        notFound();
    }

    const role = session.user.role;
    const isSuperAdmin = role === "superadmin";

    if (!isSuperAdmin) {
        notFound();
    }

    return <>{children}</>;
}
