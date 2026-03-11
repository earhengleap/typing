"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getUsersList, updateUserRole } from "@/app/actions/admin";
import { Loader2, UserCog, ShieldAlert, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

type DBUser = {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    joinedAt: Date;
};

export default function AdminUsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<DBUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        if (status === "unauthenticated" || (status === "authenticated" && session?.user?.role !== "superadmin")) {
            router.push("/");
            return;
        }

        if (status === "authenticated") {
            fetchUsers();
        }
    }, [status, session, router]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await getUsersList();
            if (res.success && res.data) {
                setUsers(res.data);
            } else {
                toast.error(res.error || "Failed to load users");
            }
        } catch (error) {
            toast.error("Error fetching users");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (newRole !== "user" && newRole !== "admin" && newRole !== "superadmin") return;
        
        try {
            setUpdatingId(userId);
            const res = await updateUserRole(userId, newRole as "user" | "admin" | "superadmin");
            
            if (res.success) {
                toast.success(`Role updated to ${newRole}`);
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            } else {
                toast.error(res.error || "Failed to update role");
            }
        } catch (error) {
            toast.error("Error updating role");
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#ffaa00]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-[#ffaa00]">User Management</h2>
                    <p className="text-sm opacity-60">Manage roles and permissions for all registered users.</p>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-black/20 text-[#ffaa00] border-b border-white/10">
                            <tr>
                                <th scope="col" className="px-6 py-4">User</th>
                                <th scope="col" className="px-6 py-4">Current Role</th>
                                <th scope="col" className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold">{user.name || "Anonymous"}</span>
                                            <span className="text-xs opacity-50">{user.email}</span>
                                            <span className="text-[10px] opacity-30 mt-1">
                                                Joined: {new Date(user.joinedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {user.role === "superadmin" && <ShieldAlert className="w-4 h-4 text-red-400" />}
                                            {user.role === "admin" && <ShieldCheck className="w-4 h-4 text-[#ffaa00]" />}
                                            {user.role === "user" && <User className="w-4 h-4 opacity-50" />}
                                            <span className={`font-bold uppercase text-[10px] tracking-wider px-2 py-1 rounded-full ${
                                                user.role === "superadmin" ? "bg-red-500/10 text-red-400" :
                                                user.role === "admin" ? "bg-[#ffaa00]/10 text-[#ffaa00]" :
                                                "bg-white/5 opacity-50"
                                            }`}>
                                                {user.role}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                disabled={updatingId === user.id}
                                                className="bg-black/40 border border-white/10 rounded-lg text-xs p-2 focus:ring-1 focus:ring-[#ffaa00] focus:outline-none disabled:opacity-50"
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                                <option value="superadmin">Super Admin</option>
                                            </select>
                                            
                                            {updatingId === user.id && (
                                                <Loader2 className="w-4 h-4 animate-spin text-[#ffaa00]" />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center opacity-50">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
