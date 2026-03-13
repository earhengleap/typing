import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BellOff, Info, Mail, Megaphone, Trash2, CheckCircle2, Loader2, Sparkles, LogIn } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { THEMES } from "@/constants/themes";
import { APP_VERSION } from "@/constants/config";
import { getNotifications, markNotificationAsRead, markAllAsRead, deleteNotification, clearAllNotifications } from "@/app/actions/notifications";

interface NotificationItem {
    id: string;
    type: string;
    title: string;
    message: string;
    read: number;
    priority: string;
    createdAt: Date;
}

interface NotificationsData {
    inbox: NotificationItem[];
    announcements: NotificationItem[];
    notifications: NotificationItem[];
}

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: () => void;
    activeTheme: typeof THEMES.codex;
}

export function NotificationsPanel({ isOpen, onClose, onUpdate, activeTheme }: NotificationsPanelProps) {
    const { status } = useSession();
    const [data, setData] = useState<NotificationsData>({ inbox: [], announcements: [], notifications: [] });
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        setLoading(true);
        const res = await getNotifications();
        setData(res as any);
        setLoading(false);
        onUpdate?.();
    };

    useEffect(() => {
        if (isOpen) {
            refreshData();
            const interval = setInterval(refreshData, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    const formatTimeAgo = (date: Date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

        if (diffInSeconds < 60) return "just now";
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) return `${diffInDays}d ago`;
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) return `${diffInMonths}mo ago`;
        return `${Math.floor(diffInMonths / 12)}y ago`;
    };

    const handleMarkAsRead = async (id: string, type: string) => {
        const res = await markNotificationAsRead(id);
        if (res.success) {
            refreshData();
            toast.success("Marked as read");
        }
    };

    const handleMarkAllAsRead = async (type?: string) => {
        const res = await markAllAsRead(type);
        if (res.success) {
            refreshData();
            toast.success(`Cleared ${type || 'all'} unread messages`);
        }
    };

    const handleDelete = async (id: string) => {
        const res = await deleteNotification(id);
        if (res.success) {
            refreshData();
            toast.success("Notification deleted");
        } else {
            toast.error("Failed to delete notification");
        }
    };

    const handleClearAll = async (type?: string) => {
        const res = await clearAllNotifications(type);
        // @ts-ignore
        if (res.success) {
            refreshData();
            toast.success(type ? `Cleared ${type}s` : "Cleared all notifications");
        } else {
            // @ts-ignore
            toast.error(res.message || "Failed to clear notifications");
        }
    };

    const renderSection = (title: string, items: NotificationItem[], type: string, Icon: any) => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 opacity-50 uppercase tracking-widest text-[10px] font-bold" style={{ color: activeTheme.textDim }}>
                        <Icon className="w-3 h-3" />
                        <span>{title}</span>
                    </div>
                    {items.length > 0 && (
                        <div className="flex items-center gap-4">
                            {items.some(i => i.read === 0) && (
                                <button
                                    onClick={() => handleMarkAllAsRead(type)}
                                    className="text-[10px] font-bold hover:opacity-100 opacity-40 transition-opacity flex items-center gap-1"
                                >
                                    <CheckCircle2 className="w-3 h-3" />
                                    Mark as read
                                </button>
                            )}
                            <button
                                onClick={() => handleClearAll(type)}
                                className="text-[10px] font-bold hover:opacity-100 opacity-40 transition-opacity flex items-center gap-1 text-red-400"
                            >
                                <Trash2 className="w-3 h-3" />
                                Clear Section
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    {items.length === 0 ? (
                        <div className="p-8 rounded-xl border border-dashed flex flex-col items-center justify-center gap-2 opacity-30" style={{ borderColor: `${activeTheme.textDim}20` }}>
                            <BellOff className="w-6 h-6" />
                            <p className="text-[11px] font-bold uppercase tracking-wider">Nothing to show</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-xl border transition-all relative group ${item.read === 0 ? 'bg-black/5' : 'opacity-70'}`}
                                style={{
                                    borderColor: item.priority === "critical" ? "#ef4444" : item.priority === "warning" ? "#f59e0b" : item.read === 0 ? `${activeTheme.primary}30` : `${activeTheme.textDim}10`,
                                    backgroundColor: item.priority === "critical" ? "rgba(239, 68, 68, 0.05)" : item.read === 0 ? `${activeTheme.primary}05` : 'transparent'
                                }}
                            >
                                <div className="flex flex-col gap-1 pr-8">
                                    <div className="flex items-center gap-2">
                                        {item.priority === "critical" && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                                        <h4 className="text-sm font-bold truncate pr-4">{item.title}</h4>
                                    </div>
                                    <p className="text-xs opacity-60 line-clamp-2 leading-relaxed">{item.message}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] opacity-30 font-medium">
                                            {formatTimeAgo(item.createdAt)}
                                        </span>
                                        {item.priority !== "info" && (
                                            <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-black/20" style={{ color: item.priority === "critical" ? "#ef4444" : "#f59e0b" }}>
                                                {item.priority}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {item.read === 0 && (
                                    <button
                                        onClick={() => handleMarkAsRead(item.id, type)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-black/5 transition-colors opacity-0 group-hover:opacity-100"
                                        style={{ color: activeTheme.primary }}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className={`absolute right-3 ${item.read === 0 ? 'top-1/4' : 'top-1/2 -translate-y-1/2'} p-2 rounded-lg hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 text-red-500/50 hover:text-red-500`}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-[420px] z-50 shadow-2xl border-l flex flex-col"
                        style={{
                            backgroundColor: activeTheme.bg,
                            borderColor: `${activeTheme.textDim}20`,
                            color: activeTheme.text
                        }}
                    >
                        {/* Header */}
                        <div className="flex flex-col border-b" style={{ borderColor: `${activeTheme.textDim}10` }}>
                            <div className="flex items-center justify-between p-6 pb-4">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="p-2 rounded-lg bg-black/5" 
                                        style={{ color: activeTheme.primary }}
                                    >
                                        <Megaphone className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-xl font-bold tracking-tight">Notifications</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-black/5 transition-colors group cursor-pointer"
                                    style={{ color: activeTheme.textDim }}
                                >
                                    <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                            
                            {/* Global Actions */}
                            {(data.inbox.length > 0 || data.announcements.length > 0 || data.notifications.length > 0) && (
                                <div className="px-6 pb-4 flex items-center justify-between">
                                    <div className="flex gap-2">
                                        {[...data.inbox, ...data.announcements, ...data.notifications].some(n => n.read === 0) && (
                                            <button 
                                                onClick={() => handleMarkAllAsRead()}
                                                className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 transition-all flex items-center gap-1.5 cursor-pointer border border-transparent hover:border-white/5"
                                                style={{ color: activeTheme.primary }}
                                            >
                                                <Sparkles className="w-3 h-3" />
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]">
                                        {Object.values(data).flat().length} Total
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 gap-10 flex flex-col scrollbar-thin scrollbar-thumb-white/10">
                            {status === "unauthenticated" ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
                                    <div className="p-6 rounded-full bg-black/5" style={{ color: activeTheme.primary }}>
                                        <LogIn className="w-12 h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold">Sign in Required</h3>
                                        <p className="text-sm opacity-50">Please sign in to view and manage your personal notifications.</p>
                                    </div>
                                    <button 
                                        onClick={() => signIn()}
                                        className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02]"
                                        style={{ backgroundColor: activeTheme.primary, color: activeTheme.bg }}
                                    >
                                        Sign In Now
                                    </button>
                                </div>
                            ) : loading && data.inbox.length === 0 && data.announcements.length === 0 && data.notifications.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-20">
                                    <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: activeTheme.primary }} />
                                    <p className="text-xs font-bold uppercase tracking-widest">Loading</p>
                                </div>
                            ) : (
                                <>
                                    {renderSection("Inbox", data.inbox, "inbox", Mail)}
                                    {renderSection("Announcements", data.announcements, "announcement", Megaphone)}
                                    {renderSection("Notifications", data.notifications, "notification", Info)}
                                </>
                            )}
                        </div>

                        {/* Footer / Info */}
                        <div className="p-6 border-t text-center flex items-center justify-between" style={{ borderColor: `${activeTheme.textDim}10` }}>
                            <p className="text-[10px] uppercase tracking-widest font-bold opacity-30">
                                typeflow v{APP_VERSION}
                            </p>
                            <button
                                onClick={() => handleClearAll()}
                                className="text-[10px] uppercase tracking-widest font-bold opacity-30 hover:opacity-100 transition-all underline underline-offset-4 text-red-500"
                            >
                                Clear all notification
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
