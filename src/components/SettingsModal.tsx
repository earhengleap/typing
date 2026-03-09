"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Volume2,
    VolumeX,
    Eye,
    EyeOff,
    Type,
    Settings,
    Layout
} from "lucide-react";
import { useMonkeyTypeStore, ThemeColors } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import { updateUserSettings } from "@/app/actions/typing-results";
import { useSession } from "next-auth/react";
import { LucideIcon } from "lucide-react";

export function SettingsModal({ isOpen, onCloseAction }: { isOpen: boolean; onCloseAction: () => void }) {
    const { data: session } = useSession();
    const store = useMonkeyTypeStore();
    const activeTheme = THEMES[store.theme] || THEMES.codex;

    const handleToggle = async (key: string, value: string | number | boolean) => {
        store.setSettings({ [key]: value });
        if (session?.user?.id) {
            // Background sync to db
            await updateUserSettings({
                ...store,
                [key]: value
            });
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40"
                onClick={onCloseAction}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="w-full max-w-lg rounded-[2.5rem] border shadow-2xl overflow-hidden"
                    style={{ backgroundColor: activeTheme.bg, borderColor: activeTheme.bgAlt }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="px-8 py-6 flex items-center justify-between border-b" style={{ borderColor: activeTheme.bgAlt + "40" }}>
                        <div className="flex items-center gap-3">
                            <Settings size={20} style={{ color: activeTheme.primary }} />
                            <h2 className="text-xl font-black uppercase tracking-wider" style={{ color: activeTheme.text }}>Settings</h2>
                        </div>
                        <button
                            onClick={onCloseAction}
                            className="p-2 rounded-xl transition-colors hover:bg-white/5"
                            style={{ color: activeTheme.textDim }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex flex-col gap-8 max-h-[70vh] overflow-y-auto scrollbar-hide">

                        {/* Gameplay Section */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: activeTheme.textDim }}>
                                <Layout size={12} />
                                Gameplay
                            </div>

                            <div className="flex flex-col gap-2">
                                <SettingToggle
                                    label="Sound Effects"
                                    desc="Play feedback sounds while typing"
                                    icon={store.soundEnabled ? Volume2 : VolumeX}
                                    isActive={store.soundEnabled}
                                    onToggle={() => handleToggle('soundEnabled', !store.soundEnabled)}
                                    theme={activeTheme}
                                />
                                <SettingToggle
                                    label="Live WPM"
                                    desc="Show current speed while typing"
                                    icon={store.showLiveWpm ? Eye : EyeOff}
                                    isActive={store.showLiveWpm}
                                    onToggle={() => handleToggle('showLiveWpm', !store.showLiveWpm)}
                                    theme={activeTheme}
                                />
                                <SettingToggle
                                    label="Live Accuracy"
                                    desc="Show current accuracy while typing"
                                    icon={store.showLiveAccuracy ? Eye : EyeOff}
                                    isActive={store.showLiveAccuracy}
                                    onToggle={() => handleToggle('showLiveAccuracy', !store.showLiveAccuracy)}
                                    theme={activeTheme}
                                />
                            </div>
                        </div>

                        {/* Appearance Section */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: activeTheme.textDim }}>
                                <Type size={12} />
                                Typography
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold opacity-60 ml-1" style={{ color: activeTheme.textDim }}>Font Size ({store.fontSize}px)</label>
                                    <input
                                        type="range"
                                        min="12"
                                        max="32"
                                        value={store.fontSize}
                                        onChange={(e) => handleToggle('fontSize', parseInt(e.target.value))}
                                        className="w-full accent-[var(--mt-primary)]"
                                        style={{ '--mt-primary': activeTheme.primary } as React.CSSProperties}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold opacity-60 ml-1" style={{ color: activeTheme.textDim }}>Font Family</label>
                                    <select
                                        value={store.fontFamily}
                                        onChange={(e) => handleToggle('fontFamily', e.target.value)}
                                        className="bg-transparent border rounded-xl px-3 py-2 text-xs font-bold outline-none"
                                        style={{ color: activeTheme.text, borderColor: activeTheme.bgAlt }}
                                    >
                                        <option value="monospace">Monospace</option>
                                        <option value="inter">Inter</option>
                                        <option value="roboto">Roboto</option>
                                        <option value="serif">Serif</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-black/10 flex justify-end">
                        <button
                            onClick={onCloseAction}
                            className="px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                            style={{ backgroundColor: activeTheme.primary, color: activeTheme.bg }}
                        >
                            Done
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function SettingToggle({ label, desc, icon: Icon, isActive, onToggle, theme }: {
    label: string,
    desc: string,
    icon: LucideIcon,
    isActive: boolean,
    onToggle: () => void,
    theme: ThemeColors
}) {
    return (
        <button
            onClick={onToggle}
            className="flex items-center justify-between p-4 rounded-2xl border transition-all text-left group"
            style={{
                backgroundColor: isActive ? `${theme.primary}08` : 'transparent',
                borderColor: isActive ? `${theme.primary}40` : theme.bgAlt
            }}
        >
            <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl transition-colors" style={{ backgroundColor: isActive ? `${theme.primary}20` : theme.bgAlt, color: isActive ? theme.primary : theme.textDim }}>
                    <Icon size={18} />
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-black" style={{ color: theme.text }}>{label}</span>
                    <span className="text-[10px] font-medium opacity-50" style={{ color: theme.textDim }}>{desc}</span>
                </div>
            </div>
            <div className="w-10 h-5 rounded-full relative transition-colors" style={{ backgroundColor: isActive ? theme.primary : theme.bgAlt }}>
                <div
                    className="absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm"
                    style={{ transform: isActive ? 'translateX(20px)' : 'translateX(0)' }}
                />
            </div>
        </button>
    );
}
