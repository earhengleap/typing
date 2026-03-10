"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Users, Megaphone, Mail, Bell, Search, Clock, CheckCircle2, AlertCircle, Loader2, ShieldAlert } from "lucide-react";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getUsers, sendNotification, getSentNotifications } from "@/app/actions/notifications";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    name: string | null;
    email: string | null;
}

export default function AdminNotificationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const themeName = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[themeName] || THEMES.codex;

    const [mounted, setMounted] = useState(false);
    const [usersList, setUsersList] = useState<User[]>([]);
    const [sentHistory, setSentHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Form State
    const [type, setType] = useState("announcement");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [targetUserId, setTargetUserId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");

    // @ts-ignore
    const isAdmin = session?.user?.role === "admin";

    useEffect(() => {
        setMounted(true);
        if (status === "unauthenticated") {
            router.push("/");
        }
        
        if (status === "authenticated" && isAdmin) {
            const loadInitialData = async () => {
                const [users, history] = await Promise.all([getUsers(), getSentNotifications()]);
                setUsersList(users);
                setSentHistory(history);
                setLoading(false);
            };
            loadInitialData();
        }
    }, [status, isAdmin, router]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) return;

        setSending(true);
        const res = await sendNotification({
            type,
            title,
            message,
            userId: type === "announcement" ? null : targetUserId || null,
        });

        if (res.success) {
            setTitle("");
            setMessage("");
            setTargetUserId("");
            const updatedHistory = await getSentNotifications();
            setSentHistory(updatedHistory);
        }
        setSending(false);
    };

    if (!mounted) return null;

    const filteredUsers = usersList.filter(u => 
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen flex flex-col font-mono selection:bg-opacity-30" style={{ backgroundColor: activeTheme.bg, color: activeTheme.text }}>
            <Header activeTheme={activeTheme} />

            <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:py-12">
                <div className="flex flex-col gap-8">
                    {/* Page Header */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-black/5" style={{ color: activeTheme.primary }}>
                                <Megaphone className="w-8 h-8" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight" style={{ color: activeTheme.text }}>Notification Center</h1>
                        </div>
                        <p className="text-sm opacity-50 max-w-2xl leading-relaxed" style={{ color: activeTheme.textDim }}>
                            Dispatch global announcements or targeted messages to individual users. Changes are reflected in real-time.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Composer Section */}
                        <div className="lg:col-span-3 flex flex-col gap-6">
                            <div className="p-8 rounded-3xl border border-dashed flex flex-col gap-6" style={{ borderColor: `${activeTheme.textDim}20` }}>
                                <h2 className="text-lg font-bold flex items-center gap-2 opacity-80">
                                    <Send className="w-4 h-4" /> Compose Message
                                </h2>

                                <form onSubmit={handleSend} className="flex flex-col gap-4">
                                    {/* Type Selection */}
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: "announcement", icon: Megaphone, label: "Announcement" },
                                            { id: "inbox", icon: Mail, label: "Inbox" },
                                            { id: "notification", icon: Bell, label: "Alert" }
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setType(t.id)}
                                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === t.id ? 'border-primary opacity-100' : 'opacity-40 hover:opacity-60'}`}
                                                style={{ 
                                                    borderColor: type === t.id ? activeTheme.primary : `${activeTheme.textDim}20`,
                                                    backgroundColor: type === t.id ? `${activeTheme.primary}10` : 'transparent'
                                                }}
                                            >
                                                <t.icon className="w-5 h-5" style={{ color: type === t.id ? activeTheme.primary : 'inherit' }} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Target User (if not announcement) */}
                                    {type !== "announcement" && (
                                        <div className="flex flex-col gap-2">
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                                                <input 
                                                    type="text"
                                                    placeholder="Search user by name or email..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full bg-black/5 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 transition-all"
                                                    style={{ color: activeTheme.text, border: `1px solid ${activeTheme.textDim}15` }}
                                                />
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 rounded-xl bg-black/5 border border-dashed" style={{ borderColor: `${activeTheme.textDim}10` }}>
                                                {filteredUsers.length === 0 ? (
                                                    <p className="text-[10px] opacity-30 p-2 italic w-full text-center">No users found...</p>
                                                ) : (
                                                    filteredUsers.map(u => (
                                                        <button
                                                            key={u.id}
                                                            type="button"
                                                            onClick={() => setTargetUserId(u.id)}
                                                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${targetUserId === u.id ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                                                            style={{ 
                                                                borderColor: targetUserId === u.id ? activeTheme.primary : 'transparent',
                                                                backgroundColor: targetUserId === u.id ? `${activeTheme.primary}20` : 'transparent',
                                                                color: targetUserId === u.id ? activeTheme.primary : activeTheme.text
                                                            }}
                                                        >
                                                            {u.name || u.email || "Unknown User"}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Title</label>
                                        <input 
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Subject line..."
                                            className="w-full bg-black/5 rounded-xl py-3 px-4 text-sm focus:outline-none border transition-all"
                                            style={{ color: activeTheme.text, border: `1px solid ${activeTheme.textDim}15` }}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest opacity-40">Message Body</label>
                                        <textarea 
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Write your message here..."
                                            rows={4}
                                            className="w-full bg-black/5 rounded-xl py-3 px-4 text-sm focus:outline-none border transition-all resize-none"
                                            style={{ color: activeTheme.text, border: `1px solid ${activeTheme.textDim}15` }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={sending || !title || !message || (type !== "announcement" && !targetUserId)}
                                        className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-30"
                                        style={{ backgroundColor: activeTheme.primary, color: activeTheme.bg }}
                                    >
                                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                        {sending ? "Dispatching..." : "Send Notification"}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Recent History Section */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            <div className="p-6 rounded-3xl border flex flex-col gap-6 min-h-[500px]" style={{ borderColor: `${activeTheme.textDim}10` }}>
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-bold flex items-center gap-2 opacity-60">
                                        <Clock className="w-4 h-4" /> Recent Dispatch
                                    </h2>
                                    <span className="text-[10px] opacity-30 font-bold">{sentHistory.length} SENT</span>
                                </div>

                                <div className="flex-1 overflow-y-auto flex flex-col gap-3 max-h-[600px] pr-2 scrollbar-thin">
                                    {loading ? (
                                        <div className="flex-1 flex flex-col items-center justify-center opacity-20 gap-2">
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            <span className="text-[10px] uppercase font-bold">Syncing</span>
                                        </div>
                                    ) : sentHistory.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center opacity-20 gap-2 border border-dashed rounded-2xl" style={{ borderColor: `${activeTheme.textDim}20` }}>
                                            <Megaphone className="w-6 h-6" />
                                            <span className="text-[10px] uppercase font-bold">No history</span>
                                        </div>
                                    ) : (
                                        sentHistory.map((item) => (
                                            <div 
                                                key={item.id} 
                                                className="p-4 rounded-xl border flex flex-col gap-1 transition-all"
                                                style={{ border: `1px solid ${activeTheme.textDim}08`, backgroundColor: `${activeTheme.textDim}03` }}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        {item.type === "announcement" ? <Megaphone className="w-3 h-3 opacity-40" /> : <Mail className="w-3 h-3 opacity-40" />}
                                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{item.type}</span>
                                                    </div>
                                                    <span className="text-[9px] opacity-20 font-bold">
                                                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <h3 className="text-xs font-bold truncate opacity-80">{item.title}</h3>
                                                <p className="text-[10px] opacity-40 line-clamp-1">{item.message}</p>
                                                {item.userId && (
                                                    <div className="mt-2 text-[9px] font-bold opacity-30 flex items-center gap-1">
                                                        <Users className="w-2.5 h-2.5" />
                                                        TARGETED USER
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
