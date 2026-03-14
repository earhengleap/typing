"use client";

import React, { Suspense, useEffect, useState } from "react";
import { THEMES } from "@/constants/themes";
import { useMonkeyTypeStore, ThemeColors } from "@/hooks/use-monkeytype-store";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
    Eye
} from "lucide-react";
import { clsx } from "clsx";

// --- Custom MonkeyType Settings UI Components ---

function SettingsSection({ id, title, icon: Icon, children, activeTheme }: { id: string, title: string, icon: any, children: React.ReactNode, activeTheme: ThemeColors }) {
    return (
        <section id={id} className="scroll-mt-24 w-full flex flex-col gap-6">
            <h2 className="text-2xl font-black flex items-center gap-3" style={{ color: activeTheme.text }}>
                <Icon size={24} />
                {title}
            </h2>
            <div className="flex flex-col gap-8">
                {children}
            </div>
        </section>
    );
}

function SettingRow({ icon: Icon, title, description, controls, activeTheme }: { icon: any, title: string, description: string, controls: React.ReactNode, activeTheme: ThemeColors }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 opacity-50" style={{ color: activeTheme.textDim }}>
                <Icon size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">{title}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <p className="text-base max-w-2xl leading-relaxed" style={{ color: activeTheme.textDim }}>{description}</p>
                <div className="shrink-0">{controls}</div>
            </div>
        </div>
    );
}

function ButtonGroup({ options, value, onChange, activeTheme }: { options: { label: string, value: any }[], value: any, onChange: (val: any) => void, activeTheme: ThemeColors }) {
    return (
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl" style={{ backgroundColor: activeTheme.bgAlt }}>
            {options.map((opt) => {
                const isActive = value === opt.value;
                return (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className={clsx(
                            "px-4 py-2 text-sm font-bold rounded-lg transition-colors duration-200"
                        )}
                        style={{
                            backgroundColor: isActive ? activeTheme.primary : 'transparent',
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
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    const navItems = [
        { id: 'behavior', icon: Zap, label: 'Behavior' },
        { id: 'sound', icon: Volume2, label: 'Sound' },
        { id: 'appearance', icon: Eye, label: 'Appearance' },
        { id: 'theme', icon: Palette, label: 'Theme' },
        { id: 'danger', icon: AlertTriangle, label: 'Danger Zone' },
    ];

    return (
        <main className="min-h-screen transition-colors duration-300 font-sans flex flex-col pt-1 sm:pt-1.5 md:pt-3 px-[var(--content-px)]" style={{ backgroundColor: activeTheme.bg }}>
            <Header activeTheme={activeTheme} />
            
            <div className="flex-1 w-full py-8 md:py-12 flex flex-col gap-12">
                
                {/* Sticky Sub-Navigation (Clone of Monkeytype .nav) */}
                <nav 
                    className={clsx(
                        "sticky top-4 z-40 flex flex-wrap items-center gap-2 py-3 px-4 rounded-2xl transition-all duration-300 shadow-sm backdrop-blur-md",
                        scrolled ? "bg-opacity-90" : "bg-opacity-0"
                    )}
                    style={{ backgroundColor: scrolled ? activeTheme.bg : 'transparent' }}
                >
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => scrollTo(item.id)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all hover:bg-black/10 group cursor-pointer"
                            style={{ color: activeTheme.textDim }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = activeTheme.text;
                                e.currentTarget.style.backgroundColor = activeTheme.bgAlt;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = activeTheme.textDim;
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <item.icon size={14} className="group-hover:scale-110 transition-transform" />
                            <span className="hidden sm:inline">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="flex flex-col gap-24 py-8 w-full">
                    
                    {/* --- BEHAVIOR --- */}
                    <SettingsSection id="behavior" title="Behavior" icon={Zap} activeTheme={activeTheme}>
                        <SettingRow
                            icon={Eye}
                            title="Live WPM"
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
                            title="Live Accuracy"
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
                            title="Live Timer"
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
                    <SettingsSection id="sound" title="Sound" icon={Volume2} activeTheme={activeTheme}>
                        <SettingRow
                            icon={VolumeX}
                            title="Play Sound on Click"
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
                                    title="Sound Type"
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
                                    title="Sound Volume"
                                    description="Adjust the volume of the keystroke sounds."
                                    activeTheme={activeTheme}
                                    controls={
                                        <input 
                                            type="range" 
                                            min="0" max="1" step="0.1" 
                                            value={store.soundVolume} 
                                            onChange={(e) => store.setSoundVolume(parseFloat(e.target.value))}
                                            className="w-48 appearance-none h-2 rounded-full cursor-pointer outline-none mt-2"
                                            style={{ background: activeTheme.bgAlt, accentColor: activeTheme.primary }}
                                        />
                                    }
                                />
                            </>
                        )}
                    </SettingsSection>

                    {/* --- APPEARANCE --- */}
                    <SettingsSection id="appearance" title="Appearance" icon={Eye} activeTheme={activeTheme}>
                        <SettingRow
                            icon={Type}
                            title="Font Family"
                            description="Change the global font family used throughout the application."
                            activeTheme={activeTheme}
                            controls={
                                <ButtonGroup
                                    activeTheme={activeTheme}
                                    options={[
                                        { label: 'mono', value: 'var(--font-geist-mono)' },
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
                            title="Font Size"
                            description="Change the physical size of the text typed during a test."
                            activeTheme={activeTheme}
                            controls={
                                <ButtonGroup
                                    activeTheme={activeTheme}
                                    options={[
                                        { label: '1rem', value: 16 },
                                        { label: '1.25rem', value: 20 },
                                        { label: '1.5rem', value: 24 },
                                        { label: '2rem', value: 32 }
                                    ]}
                                    value={store.fontSize}
                                    onChange={(v) => store.setFontSize(v)}
                                />
                            }
                        />
                    </SettingsSection>

                    {/* --- THEME --- */}
                    <SettingsSection id="theme" title="Theme" icon={Palette} activeTheme={activeTheme}>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 opacity-50" style={{ color: activeTheme.textDim }}>
                                <Palette size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Select Theme</span>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                                {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((key) => {
                                    const themeParams = THEMES[key] as ThemeColors;
                                    const isSelected = store.theme === key;
                                    
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => store.setTheme(key)}
                                            className={clsx(
                                                "flex items-center justify-between p-4 rounded-xl transition-all duration-200 border-2 outline-none cursor-pointer",
                                                isSelected ? "scale-[1.02]" : "hover:-translate-y-1"
                                            )}
                                            style={{
                                                backgroundColor: themeParams.bgAlt,
                                                borderColor: isSelected ? themeParams.primary : 'transparent',
                                            }}
                                        >
                                            <span className="font-bold text-sm" style={{ color: themeParams.text }}>
                                                {themeParams.name}
                                            </span>
                                            <div className="flex gap-1 ml-4 shrink-0">
                                                <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: themeParams.bg }} />
                                                <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: themeParams.primary }} />
                                                <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: themeParams.text }} />
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </SettingsSection>

                    {/* --- DANGER ZONE --- */}
                    <SettingsSection id="danger" title="Danger Zone" icon={AlertTriangle} activeTheme={activeTheme}>
                        <SettingRow
                            icon={Trash2}
                            title="Reset Settings"
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
                                        store.setFontFamily('var(--font-geist-mono)');
                                        store.setFontSize(24);
                                    }}
                                    className="px-6 py-3 rounded-lg font-bold text-sm transition-transform hover:scale-105 cursor-pointer whitespace-nowrap"
                                    style={{ backgroundColor: activeTheme.error, color: activeTheme.bg }}
                                >
                                    Reset Defaults
                                </button>
                            }
                        />
                    </SettingsSection>

                </div>
            </div>
            
            <Footer />
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
