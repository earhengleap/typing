"use client";

import React, { Suspense, useEffect, useState } from "react";
import { THEMES } from "@/constants/themes";
import { useMonkeyTypeStore, ThemeColors } from "@/hooks/use-monkeytype-store";
import { 
    Keyboard, 
    Volume2, 
    Palette, 
    AlertTriangle,
    Zap,
    Hash,
    Clock,
    Music,
    VolumeX,
    Trash2,
    Type,
    Eye,
    ChevronDown,
    Search,
    Info,
    Layout,
    MousePointer2,
    Code,
    ShieldCheck,
    ArrowUp
} from "lucide-react";
import { clsx } from "clsx";

// --- Custom MonkeyType Settings UI Components ---

function SettingsSection({ id, title, icon: Icon, children, activeTheme }: { id: string, title: string, icon: any, children: React.ReactNode, activeTheme: ThemeColors }) {
    return (
        <section id={id} className="scroll-mt-32 w-full flex flex-col gap-8">
            <h2 className="text-2xl font-black flex items-center gap-3 lowercase" style={{ color: activeTheme.text }}>
                <ChevronDown size={24} style={{ color: activeTheme.primary }} />
                {title}
            </h2>
            <div className="flex flex-col">
                {children}
            </div>
        </section>
    );
}

function SettingRow({ icon: Icon, title, description, controls, activeTheme }: { icon: any, title: string, description: string, controls: React.ReactNode, activeTheme: ThemeColors }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-b border-black/5" style={{ borderColor: `${activeTheme.textDim}15` }}>
            <div className="flex gap-4">
                <div className="mt-1">
                    <Icon size={18} style={{ color: activeTheme.textDim }} />
                </div>
                <div className="flex flex-col gap-1 max-w-xl">
                    <span className="text-sm font-bold opacity-80 lowercase" style={{ color: activeTheme.text }}>{title}</span>
                    <p className="text-xs leading-relaxed" style={{ color: activeTheme.textDim }}>{description}</p>
                </div>
            </div>
            <div className="shrink-0 flex items-center">
                {controls}
            </div>
        </div>
    );
}

function ButtonGroup({ options, value, onChange, activeTheme }: { options: { label: string, value: any }[], value: any, onChange: (val: any) => void, activeTheme: ThemeColors }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {options.map((opt) => {
                const isActive = value === opt.value;
                return (
                    <button
                        key={String(opt.value)}
                        onClick={() => onChange(opt.value)}
                        className={clsx(
                            "px-4 py-1.5 text-xs font-bold rounded transition-all duration-150 cursor-pointer"
                        )}
                        style={{
                            backgroundColor: isActive ? activeTheme.primary : activeTheme.bgAlt,
                            color: isActive ? activeTheme.bg : activeTheme.textDim,
                        }}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}

function SettingsContent() {
    const store = useMonkeyTypeStore();
    const activeTheme = THEMES[store.theme] || THEMES.codex;
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            const offset = 120; // accounting for sticky header + nav
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const navItems = [
        { id: 'behavior', icon: Zap, label: 'behavior' },
        { id: 'sound', icon: Volume2, label: 'sound' },
        { id: 'appearance', icon: Eye, label: 'appearance' },
        { id: 'theme', icon: Palette, label: 'theme' },
        { id: 'danger', icon: AlertTriangle, label: 'danger zone' },
    ];

    return (
        <main className="min-h-screen transition-colors duration-300 font-roboto flex flex-col pt-1 sm:pt-1.5 md:pt-3 px-[var(--content-px)]" style={{ backgroundColor: activeTheme.bg }}>
            
            <div className="flex-1 w-full max-w-[1050px] mx-auto py-8 md:py-12 flex flex-col gap-10">
                
                {/* Search Bar Tip Placeholder (1:1 UI) */}
                <div className="flex flex-col gap-4">
                    <nav className="flex flex-wrap items-center gap-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollTo(item.id)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all hover:bg-black/5 group cursor-pointer"
                                style={{ color: activeTheme.textDim }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = activeTheme.text;
                                    e.currentTarget.style.backgroundColor = `${activeTheme.textDim}15`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = activeTheme.textDim;
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <item.icon size={12} className="group-hover:scale-110 transition-transform" />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3 p-3 rounded text-xs leading-relaxed" style={{ backgroundColor: `${activeTheme.textDim}08`, color: activeTheme.textDim }}>
                        <Info size={14} className="shrink-0" />
                        <p>tip: You can also change all these settings quickly using the command line (esc or ctrl + shift + p)</p>
                    </div>
                </div>

                <div className="flex flex-col gap-28 py-10 w-full mb-32">
                    
                    {/* --- BEHAVIOR --- */}
                    <SettingsSection id="behavior" title="behavior" icon={Zap} activeTheme={activeTheme}>
                        <SettingRow
                            icon={Type}
                            title="live WPM"
                            description="Show a live WPM speed during the test. This might cause some lag on slower devices."
                            activeTheme={activeTheme}
                            controls={
                                <ButtonGroup
                                    activeTheme={activeTheme}
                                    options={[
                                        { label: 'off', value: false },
                                        { label: 'on', value: true }
                                    ]}
                                    value={store.showLiveWpm}
                                    onChange={(v) => store.setShowLiveWpm(v)}
                                />
                            }
                        />

                        <SettingRow
                            icon={Hash}
                            title="live accuracy"
                            description="Show live accuracy during the typing test."
                            activeTheme={activeTheme}
                            controls={
                                <ButtonGroup
                                    activeTheme={activeTheme}
                                    options={[
                                        { label: 'off', value: false },
                                        { label: 'on', value: true }
                                    ]}
                                    value={store.showLiveAccuracy}
                                    onChange={(v) => store.setShowLiveAccuracy(v)}
                                />
                            }
                        />

                        <SettingRow
                            icon={Clock}
                            title="live timer"
                            description="Display a live timer showing the remaining time during timed tests."
                            activeTheme={activeTheme}
                            controls={
                                <ButtonGroup
                                    activeTheme={activeTheme}
                                    options={[
                                        { label: 'off', value: false },
                                        { label: 'on', value: true }
                                    ]}
                                    value={store.showLiveTimer}
                                    onChange={(v) => store.setShowLiveTimer(v)}
                                />
                            }
                        />
                    </SettingsSection>

                    {/* --- SOUND --- */}
                    <SettingsSection id="sound" title="sound" icon={Volume2} activeTheme={activeTheme}>
                        <SettingRow
                            icon={VolumeX}
                            title="play sound on click"
                            description="Play a sound whenever a keystroke is pressed during the test."
                            activeTheme={activeTheme}
                            controls={
                                <ButtonGroup
                                    activeTheme={activeTheme}
                                    options={[
                                        { label: 'off', value: false },
                                        { label: 'on', value: true }
                                    ]}
                                    value={store.soundEnabled}
                                    onChange={(v) => store.setSoundEnabled(v)}
                                />
                            }
                        />

                        {store.soundEnabled && (
                            <>
                                <SettingRow
                                    icon={Music}
                                    title="sound type"
                                    description="Choose the acoustic profile of the keystroke sounds."
                                    activeTheme={activeTheme}
                                    controls={
                                        <ButtonGroup
                                            activeTheme={activeTheme}
                                            options={[
                                                { label: 'mechanical', value: 'mechanical' },
                                                { label: 'soft', value: 'soft' }
                                            ]}
                                            value={store.soundType}
                                            onChange={(v) => store.setSoundType(v as 'mechanical' | 'soft')}
                                        />
                                    }
                                />

                                <SettingRow
                                    icon={Volume2}
                                    title="sound volume"
                                    description="Adjust the volume of the keystroke sounds."
                                    activeTheme={activeTheme}
                                    controls={
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="range" 
                                                min="0" max="1" step="0.1" 
                                                value={store.soundVolume} 
                                                onChange={(e) => store.setSoundVolume(parseFloat(e.target.value))}
                                                className="w-40 appearance-none h-1 rounded-full cursor-pointer outline-none"
                                                style={{ background: activeTheme.bgAlt, accentColor: activeTheme.primary }}
                                            />
                                            <span className="text-xs font-bold w-8" style={{ color: activeTheme.text }}>{Math.round(store.soundVolume * 10)}</span>
                                        </div>
                                    }
                                />
                                <SettingRow
                                    icon={AlertTriangle}
                                    title="sound on error"
                                    description="Play a short sound whenever an error is made during the test."
                                    activeTheme={activeTheme}
                                    controls={
                                        <ButtonGroup
                                            activeTheme={activeTheme}
                                            options={[
                                                { label: 'off', value: 'off' },
                                                { label: 'on', value: 'on' }
                                            ]}
                                            value={store.soundOnError}
                                            onChange={(v) => store.setSettings({ soundOnError: v })}
                                        />
                                    }
                                />
                            </>
                        )}
                    </SettingsSection>

                    {/* --- APPEARANCE --- */}
                    <SettingsSection id="appearance" title="appearance" icon={Eye} activeTheme={activeTheme}>
                        <SettingRow
                            icon={Clock}
                            title="play time warning"
                            description="Display a warning after typing for a certain amount of time."
                            activeTheme={activeTheme}
                            controls={
                                <ButtonGroup
                                    activeTheme={activeTheme}
                                    options={[
                                        { label: 'off', value: 'off' },
                                        { label: '10m', value: 10 },
                                        { label: '30m', value: 30 },
                                        { label: '1h', value: 60 }
                                    ]}
                                    value={store.playTimeWarning}
                                    onChange={(v) => store.setSettings({ playTimeWarning: v })}
                                />
                            }
                        />

                        <SettingRow
                            icon={Type}
                            title="font family"
                            description="Change the global font family used throughout the application."
                            activeTheme={activeTheme}
                            controls={
                                <ButtonGroup
                                    activeTheme={activeTheme}
                                    options={[
                                        { label: 'mono', value: 'var(--font-roboto-mono)' },
                                        { label: 'sans', value: 'var(--font-geist-sans)' },
                                        { label: 'lexend', value: '"Lexend Deca", sans-serif' }
                                    ]}
                                    value={store.fontFamily}
                                    onChange={(v) => store.setFontFamily(v)}
                                />
                            }
                        />

                        <SettingRow
                            icon={Type}
                            title="font size"
                            description="Change the physical size of the text typed during a test."
                            activeTheme={activeTheme}
                            controls={
                                <ButtonGroup
                                    activeTheme={activeTheme}
                                    options={[
                                        { label: '1.0x', value: 16 },
                                        { label: '1.25x', value: 20 },
                                        { label: '1.5x', value: 24 },
                                        { label: '2.0x', value: 32 }
                                    ]}
                                    value={store.fontSize}
                                    onChange={(v) => store.setFontSize(v)}
                                />
                            }
                        />
                    </SettingsSection>

                    {/* --- THEME --- */}
                    <SettingsSection id="theme" title="theme" icon={Palette} activeTheme={activeTheme}>
                        <div className="flex flex-col gap-6 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                                {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((key) => {
                                    const themeParams = THEMES[key] as ThemeColors;
                                    const isSelected = store.theme === key;
                                    
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => store.setTheme(key)}
                                            className={clsx(
                                                "flex items-center justify-between p-4 rounded transition-all duration-150 outline-none cursor-pointer border-none",
                                                isSelected ? "opacity-100" : "opacity-60 hover:opacity-100"
                                            )}
                                            style={{
                                                backgroundColor: isSelected ? activeTheme.primary : themeParams.bgAlt,
                                            }}
                                        >
                                            <span className="font-bold text-xs" style={{ color: isSelected ? activeTheme.bg : themeParams.text }}>
                                                {themeParams.name}
                                            </span>
                                            <div className="flex gap-1.5 ml-4 shrink-0">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: themeParams.bg }} />
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: themeParams.primary }} />
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: themeParams.text }} />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </SettingsSection>

                    {/* --- DANGER ZONE --- */}
                    <SettingsSection id="danger" title="danger zone" icon={AlertTriangle} activeTheme={activeTheme}>
                        <SettingRow
                            icon={Trash2}
                            title="reset settings"
                            description="Reset all your settings back to the application defaults."
                            activeTheme={activeTheme}
                            controls={
                                <button
                                    onClick={() => {
                                        store.setTheme('codex');
                                        store.setShowLiveWpm(true);
                                        store.setShowLiveAccuracy(true);
                                        store.setShowLiveTimer(true);
                                        store.setSoundEnabled(false);
                                        store.setSoundVolume(0.5);
                                        store.setSoundType('mechanical');
                                        store.setFontFamily('var(--font-roboto-mono)');
                                        store.setFontSize(24);
                                    }}
                                    className="px-6 py-2 rounded font-bold text-xs transition-transform hover:scale-105 cursor-pointer whitespace-nowrap"
                                    style={{ backgroundColor: activeTheme.error, color: activeTheme.bg }}
                                >
                                    reset defaults
                                </button>
                            }
                        />
                    </SettingsSection>

                </div>

                {/* Back to Top Button */}
                {scrolled && (
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="fixed bottom-8 right-8 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl z-50 hover:scale-110 cursor-pointer"
                        style={{ backgroundColor: activeTheme.bgAlt, color: activeTheme.textDim }}
                    >
                        <ArrowUp size={20} />
                    </button>
                )}
            </div>
            
        </main>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SettingsContent />
        </Suspense>
    );
}
