"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Users, Megaphone, Bell, Search, Clock, CheckCircle2, AlertCircle, Loader2, ShieldAlert } from "lucide-react";
import { AuthenticMail } from "@/components/icons/AuthenticMail";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getUsers, sendNotification, getSentNotifications } from "@/app/actions/notifications";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
    id: string;
    name: string | null;
    email: string | null;
}

export default function AdminNotificationsPage() {
    const { data: session, status } = useSession();
    const themeName = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[themeName] || THEMES.codex;

    const [mounted, setMounted] = useState(false);
    const [usersList, setUsersList] = useState<User[]>([]);
    const [sentHistory, setSentHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Form State
    const [type, setType] = useState("announcement");
    const [priority, setPriority] = useState<"info" | "warning" | "critical">("info");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [targetUserId, setTargetUserId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setMounted(true);
        
        if (status === "authenticated") {
            const loadInitialData = async () => {
                const [users, history] = await Promise.all([getUsers(), getSentNotifications()]);
                setUsersList(users);
                setSentHistory(history);
                setLoading(false);
            };
            loadInitialData();
        }
    }, [status]);

    if (!mounted || status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center font-mono" style={{ backgroundColor: activeTheme.bg }}>
                <Loader2 className="w-8 h-8 animate-spin opacity-20" style={{ color: activeTheme.text }} />
            </div>
        );
    }
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) return;

        setSending(true);
        const res = await sendNotification({
            type,
            title,
            message,
            priority,
            userId: type === "announcement" ? null : targetUserId || null,
        });

        if (res.success) {
            setTitle("");
            setMessage("");
            setTargetUserId("");
            toast.success("Notification dispatched successfully");
            const updatedHistory = await getSentNotifications();
            setSentHistory(updatedHistory);
        } else {
            toast.error("Failed to dispatch notification");
        }
        setSending(false);
    };

    if (!mounted) return null;

    const filteredUsers = usersList.filter(u => 
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const PRIORITY_THEMES = {
        info: { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)", label: "Info" },
        warning: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)", label: "Warning" },
        critical: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)", label: "Critical" }
    };

    return (
        <div className="min-h-screen flex flex-col font-mono selection:bg-opacity-30 pt-1 sm:pt-1.5 md:pt-3 px-[var(--content-px)]" style={{ backgroundColor: activeTheme.bg, color: activeTheme.text }}>
            <Header activeTheme={activeTheme} />

            <main className="flex-1 w-full py-8 md:py-12">
                <div className="flex flex-col gap-8">
                    {/* Page Header */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                            <div className="p-4 rounded-[2rem] bg-black/5 flex items-center justify-center" style={{ color: activeTheme.primary }}>
                                <Megaphone className="w-10 h-10" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black tracking-tight" style={{ color: activeTheme.text }}>Broadcast Center</h1>
                                <p className="text-sm opacity-50 font-medium uppercase tracking-[0.2em]" style={{ color: activeTheme.textDim }}>Command & Control Hub</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Composer Section */}
                        <div className="lg:col-span-3 flex flex-col gap-6">
                            <div className="p-10 rounded-[3rem] border bg-black/5 space-y-8" style={{ borderColor: `${activeTheme.textDim}15` }}>
                                <div className="space-y-6">
                                    <label className="text-xs font-black uppercase tracking-widest opacity-40">Message Protocol</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: "announcement", icon: Megaphone, label: "Broadcast" },
                                            { id: "inbox", icon: AuthenticMail, label: "Private DM" },
                                            { id: "notification", icon: Bell, label: "Alert" }
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setType(t.id)}
                                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${type === t.id ? 'opacity-100 scale-105' : 'opacity-40 hover:opacity-100'}`}
                                                style={{ 
                                                    borderColor: type === t.id ? activeTheme.primary : 'transparent',
                                                    backgroundColor: type === t.id ? `${activeTheme.primary}10` : 'transparent'
                                                }}
                                            >
                                                <t.icon className="w-6 h-6" style={{ color: type === t.id ? activeTheme.primary : 'inherit' }} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <label className="text-xs font-black uppercase tracking-widest opacity-40">Priority Level</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(Object.keys(PRIORITY_THEMES) as Array<keyof typeof PRIORITY_THEMES>).map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setPriority(p)}
                                                className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${priority === p ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
                                                style={{ 
                                                    borderColor: priority === p ? PRIORITY_THEMES[p].color : 'transparent',
                                                    backgroundColor: priority === p ? PRIORITY_THEMES[p].bg : 'rgba(255,255,255,0.02)',
                                                    color: priority === p ? PRIORITY_THEMES[p].color : activeTheme.text
                                                }}
                                            >
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PRIORITY_THEMES[p].color }} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{PRIORITY_THEMES[p].label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <form onSubmit={handleSend} className="space-y-6">
                                    {/* Target User (if not announcement) */}
                                    {type !== "announcement" && (
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                                                <input 
                                                    type="text"
                                                    placeholder="LOCATE TARGET OPERATIVE..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full bg-black/40 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-1 transition-all"
                                                    style={{ color: activeTheme.text, border: `1px solid ${activeTheme.textDim}15` }}
                                                />
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-4 rounded-2xl bg-black/20 border border-dashed" style={{ borderColor: `${activeTheme.textDim}15` }}>
                                                {filteredUsers.length === 0 ? (
                                                    <p className="text-[10px] opacity-30 italic w-full text-center py-2">NO OPERATIVES FOUND IN DATABASE</p>
                                                ) : (
                                                    filteredUsers.map(u => (
                                                        <button
                                                            key={u.id}
                                                            type="button"
                                                            onClick={() => setTargetUserId(u.id)}
                                                            className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${targetUserId === u.id ? 'opacity-100 ring-2 ring-primary ring-offset-2 ring-offset-black' : 'opacity-40 hover:opacity-100'}`}
                                                            style={{ 
                                                                borderColor: targetUserId === u.id ? activeTheme.primary : 'transparent',
                                                                backgroundColor: targetUserId === u.id ? `${activeTheme.primary}40` : `${activeTheme.textDim}05`,
                                                                color: targetUserId === u.id ? '#fff' : activeTheme.text
                                                            }}
                                                        >
                                                            {u.name || u.email || "ANONYMOUS"}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Transmission Header</label>
                                            <input 
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="ENTER SUBJECT..."
                                                className="w-full bg-black/40 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none border transition-all shadow-inner"
                                                style={{ color: activeTheme.text, border: `1px solid ${activeTheme.textDim}15` }}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] uppercase font-black tracking-widest opacity-40 ml-1">Data Payload</label>
                                            <textarea 
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder="WRITE MESSAGE CONTENT..."
                                                rows={5}
                                                className="w-full bg-black/40 rounded-2xl py-4 px-6 text-sm font-bold focus:outline-none border transition-all resize-none shadow-inner"
                                                style={{ color: activeTheme.text, border: `1px solid ${activeTheme.textDim}15` }}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={sending || !title || !message || (type !== "announcement" && !targetUserId)}
                                        className="w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4 transition-all disabled:opacity-30 hover:scale-[1.01] active:scale-[0.99] shadow-2xl"
                                        style={{ backgroundColor: activeTheme.primary, color: activeTheme.bg }}
                                    >
                                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />}
                                        {sending ? "TRANSMITTING..." : "INITIALIZE BROADCAST"}
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
                                                        {item.type === "announcement" ? <Megaphone className="w-3 h-3 opacity-40" /> : <AuthenticMail className="w-3 h-3 opacity-40" />}
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
