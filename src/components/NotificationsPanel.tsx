import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BellOff, Info, Mail, Megaphone, Trash2, CheckCircle2 } from "lucide-react";
import { THEMES } from "@/constants/themes";
import { getNotifications, markNotificationAsRead, markAllAsRead, seedInitialNotifications } from "@/app/actions/notifications";

interface NotificationItem {
    id: string;
    type: string;
    title: string;
    message: string;
    read: number;
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
    activeTheme: typeof THEMES.codex;
}

export function NotificationsPanel({ isOpen, onClose, activeTheme }: NotificationsPanelProps) {
    const [data, setData] = useState<NotificationsData>({ inbox: [], announcements: [], notifications: [] });
    const [loading, setLoading] = useState(true);

    const refreshData = async () => {
        setLoading(true);
        // Seed some data if it's the first time
        await seedInitialNotifications();
        const res = await getNotifications();
        setData(res as any);
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen) {
            refreshData();
        }
    }, [isOpen]);

    const handleMarkAsRead = async (id: string, type: string) => {
        const res = await markNotificationAsRead(id);
        if (res.success) {
            refreshData();
        }
    };

    const handleMarkAllAsRead = async (type?: string) => {
        const res = await markAllAsRead(type);
        if (res.success) {
            refreshData();
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
                    {items.length > 0 && items.some(i => i.read === 0) && (
                        <button 
                            onClick={() => handleMarkAllAsRead(type)}
                            className="text-[10px] font-bold hover:opacity-100 opacity-40 transition-opacity flex items-center gap-1"
                        >
                            <CheckCircle2 className="w-3 h-3" />
                            Mark all as read
                        </button>
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
                                    borderColor: item.read === 0 ? `${activeTheme.primary}30` : `${activeTheme.textDim}10`,
                                    backgroundColor: item.read === 0 ? `${activeTheme.primary}05` : 'transparent'
                                }}
                            >
                                <div className="flex flex-col gap-1 pr-8">
                                    <h4 className="text-sm font-bold truncate pr-4">{item.title}</h4>
                                    <p className="text-xs opacity-60 line-clamp-2 leading-relaxed">{item.message}</p>
                                    <span className="text-[10px] opacity-30 font-medium mt-1">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
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
                        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: `${activeTheme.textDim}10` }}>
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
                                className="p-2 rounded-lg hover:bg-black/5 transition-colors group"
                                style={{ color: activeTheme.textDim }}
                            >
                                <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 gap-10 flex flex-col scrollbar-thin scrollbar-thumb-white/10">
                            {loading ? (
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
                                typeflow v1.0.1
                            </p>
                            <button 
                                onClick={() => handleMarkAllAsRead()}
                                className="text-[10px] uppercase tracking-widest font-bold opacity-30 hover:opacity-100 transition-all underline underline-offset-4"
                            >
                                Mark all as read
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

