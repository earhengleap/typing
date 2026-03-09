"use client";

import { THEMES } from "@/constants/themes";
import { useMonkeyTypeStore, Theme } from "@/hooks/use-monkeytype-store";
import { Header } from "@/components/Header";
import { motion } from "framer-motion";

export default function SettingsPage() {
    const theme = useMonkeyTypeStore((state) => state.theme);
    const activeTheme = THEMES[theme] || THEMES.codex;

    return (
        <main className="min-h-screen transition-colors duration-300" style={{ backgroundColor: activeTheme.bg }}>
            <Header activeTheme={activeTheme} />
            <div className="max-w-5xl mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-8"
                >
                    <div>
                        <h2 className="text-3xl font-bold mb-2" style={{ color: activeTheme.text }}>Settings</h2>
                        <p style={{ color: activeTheme.textDim }}>Customize your typing experience.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="p-6 rounded-2xl border flex items-center justify-between" style={{ backgroundColor: activeTheme.bgAlt + "40", borderColor: activeTheme.bgAlt }}>
                            <div>
                                <p className="font-bold" style={{ color: activeTheme.text }}>Theme</p>
                                <p className="text-sm" style={{ color: activeTheme.textDim }}>Change the look and feel of the app.</p>
                            </div>
                            <select
                                value={theme}
                                onChange={(e) => useMonkeyTypeStore.setState({ theme: e.target.value as Theme })}
                                className="bg-transparent border p-2 rounded-lg outline-none"
                                style={{ borderColor: activeTheme.bgAlt, color: activeTheme.text }}
                            >
                                {Object.keys(THEMES).map((t) => (
                                    <option key={t} value={t} style={{ backgroundColor: activeTheme.bg }}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="p-8 rounded-3xl border border-dashed flex items-center justify-center" style={{ borderColor: activeTheme.bgAlt, color: activeTheme.textDim }}>
                        More settings coming soon...
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
