"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaClock, FaQuoteLeft, FaMountain, FaWrench } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { useMonkeyTypeStore, GameMode, GameConfig } from "@/hooks/use-monkeytype-store";
import { CustomTextModal } from "./CustomTextModal";

const SEPARATOR = <div className="w-[2px] h-3 rounded-full bg-mt-text-dim opacity-15 mx-[12px]" />;

export function ConfigurationBar() {
    const [mounted, setMounted] = React.useState(false);
    const {
        mode,
        config,
        punctuation,
        numbers,
        customText,
        customTextByLanguage,
        customTextMode,
        customTextLimitMode,
        customTextLimitValue,
        customTextPipeDelimiter,
        language,
        setMode,
        setConfig,
        setPunctuation,
        setNumbers,
        setCustomText,
        setCustomTextForLanguage,
        setCustomTextSettings,
        setLanguage,
        isActive,
        isFinished,
        resetLiveState
    } = useMonkeyTypeStore();
    const [isCustomModalOpen, setIsCustomModalOpen] = React.useState(false);
    const [isCustomTextModalOpen, setIsCustomTextModalOpen] = React.useState(false);
    const [showDueToMouse, setShowDueToMouse] = React.useState(false);

    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
        setMounted(true);
        const handleMouseMove = () => {
            setShowDueToMouse(true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setShowDueToMouse(false);
            }, 2500); // 2.5s hide timeout like Monkeytype
        };
        const handleKeyPress = () => {
            // Hide it immediately when the user starts typing
            setShowDueToMouse(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("keydown", handleKeyPress);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    React.useEffect(() => {
        if (isActive && !isFinished) {
            setShowDueToMouse(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
    }, [isActive, isFinished]);

    if (!mounted) return <div className="h-[48px]" />; // Use 48px to match the actual height

    const isTestActive = isActive && !isFinished;
    const isVisible = !isTestActive || showDueToMouse;

    const handleModeChange = (newMode: GameMode) => {
        let defaultVal: GameConfig = config;
        if (newMode === "time") {
            defaultVal = (config === 15 || config === 30 || config === 60 || config === 120) ? config : 30;
        } else if (newMode === "words") {
            defaultVal = (config === 10 || config === 25 || config === 50 || config === 100) ? config : 25;
        }
        setMode(newMode);
        setConfig(defaultVal);
    };

    const handleConfigChange = (newConfig: GameConfig) => {
        setConfig(newConfig);
    };

    const hasSubOptions = mode === "time" || mode === "words" || mode === "custom";
    const showToggles = mode !== "quote" && mode !== "zen";
    const presetConfigs = [15, 30, 60, 120, 10, 25, 50, 100];
    const sectionTransition = { duration: 0.24, ease: [0.25, 0.1, 0.25, 1] as const };
    const languageCustomText = customTextByLanguage?.[language] ?? (language === "english" ? customText : "");
    const modeOptions: { id: GameMode; label: string; icon: React.ReactNode }[] = [
        { id: "time", label: "time", icon: <FaClock size={12} /> },
        {
            id: "words",
            label: "words",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    className="w-[16px] h-[16px] fill-current"
                >
                    <path d="M432 64H16C7.2 64 0 71.2 0 80v64c0 8.8 7.2 16 16 16h144v288c0 26.5 21.5 48 48 48s48-21.5 48-48V160h144c8.8 0 16-7.2 16-16V80c0-8.8-7.2-16-16-16z" />
                </svg>
            )
        },
        { id: "quote", label: "quote", icon: <FaQuoteLeft size={12} /> },
        { id: "zen", label: "zen", icon: <FaMountain size={12} /> },
        { id: "custom", label: "custom", icon: <FaWrench size={12} /> }
    ];

    return (
        <motion.div
            layout
            transition={{ layout: sectionTransition, duration: 0 }}
            animate={{ 
                opacity: isVisible ? 1 : 0,
                pointerEvents: isVisible ? "auto" : "none"
            }}
            className="flex items-center justify-center bg-mt-bg-alt/90 px-4 rounded-xl text-[11px] font-black lowercase shadow-sm w-fit mx-auto h-[40px] overflow-hidden"
        >
            <motion.div layout transition={{ layout: sectionTransition }} className="flex items-center overflow-hidden">
                <AnimatePresence initial={false}>
                    {showToggles && (
                    <motion.div
                        key="toggles"
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={sectionTransition}
                        className="flex items-center"
                    >
                        <div className="flex items-center gap-[10px]">
                            <button
                                onClick={() => setPunctuation(!punctuation)}
                                className={cn(
                                    "flex items-center gap-2 py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                                    punctuation ? "text-mt-primary" : "text-mt-text-dim"
                                )}
                            >
                                <span className="text-[12px]">@</span> punctuation
                            </button>
                            <button
                                onClick={() => setNumbers(!numbers)}
                                className={cn(
                                    "flex items-center gap-2 py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                                    numbers ? "text-mt-primary" : "text-mt-text-dim"
                                )}
                            >
                                <span className="text-[12px]">#</span> numbers
                            </button>
                        </div>
                        {SEPARATOR}
                    </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Modes */}
            <div className="flex items-center gap-[10px]">
                {modeOptions.map((m) => {
                    const active = mode === m.id;
                    return (
                        <button
                            key={m.id}
                            onClick={() => handleModeChange(m.id)}
                            className={cn(
                                "relative flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer transition-colors duration-200",
                                active ? "text-mt-primary" : "text-mt-text-dim hover:text-mt-text"
                            )}
                            title={m.id === "zen" ? "Zen mode" : undefined}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {m.icon} {m.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            <motion.div layout transition={{ layout: sectionTransition }} className="flex items-center overflow-hidden">
                <AnimatePresence initial={false}>
                    {hasSubOptions ? (
                    <motion.div
                        key={`sub-${mode}`}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={sectionTransition}
                        className="flex items-center"
                    >
                        {SEPARATOR}

                        <div className="flex items-center gap-[10px]">
                            {mode === "time" && [15, 30, 60, 120].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => handleConfigChange(t)}
                                    className={cn(
                                        "py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                                        config === t ? "text-mt-primary" : "text-mt-text-dim"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        {mode === "words" && [10, 25, 50, 100].map((w) => (
                                <button
                                    key={w}
                                    onClick={() => handleConfigChange(w)}
                                    className={cn(
                                        "py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                                        config === w ? "text-mt-primary" : "text-mt-text-dim"
                                    )}
                                >
                                    {w}
                                </button>
                        ))}
                        {(mode === "time" || mode === "words") && (
                            <button
                                onClick={() => setIsCustomModalOpen(true)}
                                className={cn(
                                    "py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                                    !presetConfigs.includes(Number(config)) ? "text-mt-primary" : "text-mt-text-dim"
                                )}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 640 640"
                                    className="w-[14px] h-[14px] fill-current -mt-0.5"
                                >
                                    <path d="M102.8 57.3C108.2 51.9 116.6 51.1 123 55.3L241.9 134.5C250.8 140.4 256.1 150.4 256.1 161.1L256.1 210.7L346.9 301.5C380.2 286.5 420.8 292.6 448.1 320L574.2 446.1C592.9 464.8 592.9 495.2 574.2 514L514.1 574.1C495.4 592.8 465 592.8 446.2 574.1L320.1 448C292.7 420.6 286.6 380.1 301.6 346.8L210.8 256L161.2 256C150.5 256 140.5 250.7 134.6 241.8L55.4 122.9C51.2 116.6 52 108.1 57.4 102.7L102.8 57.3zM247.8 360.8C241.5 397.7 250.1 436.7 274 468L179.1 563C151 591.1 105.4 591.1 77.3 563C49.2 534.9 49.2 489.3 77.3 461.2L212.7 325.7L247.9 360.8zM416.1 64C436.2 64 455.5 67.7 473.2 74.5C483.2 78.3 485 91 477.5 98.6L420.8 155.3C417.8 158.3 416.1 162.4 416.1 166.6L416.1 208C416.1 216.8 423.3 224 432.1 224L473.5 224C477.7 224 481.8 222.3 484.8 219.3L541.5 162.6C549.1 155.1 561.8 156.9 565.6 166.9C572.4 184.6 576.1 203.9 576.1 224C576.1 267.2 558.9 306.3 531.1 335.1L482 286C448.9 253 403.5 240.3 360.9 247.6L304.1 190.8L304.1 161.1L303.9 156.1C303.1 143.7 299.5 131.8 293.4 121.2C322.8 86.2 366.8 64 416.1 63.9z" />
                                </svg>
                            </button>
                        )}
                        {mode === "custom" && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsCustomTextModalOpen(true)}
                                    className="py-1 transition-all duration-150 hover:text-mt-text cursor-pointer text-mt-text-dim"
                                    type="button"
                                >
                                    change
                                </button>
                                <div className="text-[11px] opacity-40 px-1.5 py-0.5 rounded bg-mt-bg-alt/50 cursor-default text-mt-text-dim">
                                    {customTextLimitMode === "time" ? `${customTextLimitValue}s` : (customTextLimitMode === "word" ? `${customTextLimitValue}w` : 'none')}
                                </div>
                            </div>
                        )}
                    </div>
                        {SEPARATOR}
                    </motion.div>
                ) : (
                    <motion.div
                        key="sub-empty"
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={sectionTransition}
                    >
                        {SEPARATOR}
                    </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Language */}
            <div className="flex items-center gap-[14px]">
                <button
                    onClick={() => setLanguage("english")}
                    className={cn(
                        "py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                        language === "english" ? "text-mt-primary" : "text-mt-text-dim"
                    )}
                >
                    english
                </button>
                <button
                    onClick={() => setLanguage("khmer")}
                    className={cn(
                        "py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                        language === "khmer" ? "text-mt-primary" : "text-mt-text-dim"
                    )}
                >
                    khmer
                </button>
            </div>

            {/* Custom Input Modal */}
            <CustomInputModal 
                isOpen={isCustomModalOpen} 
                onClose={() => setIsCustomModalOpen(false)}
                type={mode === "time" ? "time" : "words"}
                onConfirm={(val) => {
                    setConfig(val);
                    resetLiveState(mode === "time" ? val : 30);
                    setIsCustomModalOpen(false);
                }}
            />

            <CustomTextModal
                isOpen={isCustomTextModalOpen}
                initialValue={languageCustomText}
                initialMode={customTextMode}
                initialLimitMode={customTextLimitMode}
                initialLimitValue={customTextLimitValue}
                initialPipeDelimiter={customTextPipeDelimiter}
                onClose={() => setIsCustomTextModalOpen(false)}
                onConfirm={(payload: { text: string; mode: "simple" | "repeat" | "shuffle" | "random"; limitMode: "none" | "word" | "time" | "section"; limitValue: number; pipeDelimiter: boolean }) => {
                    setCustomTextForLanguage(language, payload.text);
                    if (language === "english") setCustomText(payload.text);
                    setCustomTextSettings({
                        customTextMode: payload.mode,
                        customTextLimitMode: payload.limitMode,
                        customTextLimitValue: payload.limitValue,
                        customTextPipeDelimiter: payload.pipeDelimiter
                    });
                    setMode("custom");
                    setIsCustomTextModalOpen(false);
                }}
            />
        </motion.div>
    );
}

interface CustomInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: "time" | "words";
    onConfirm: (val: number) => void;
}


function CustomInputModal({ isOpen, onClose, type, onConfirm }: CustomInputModalProps) {
    const [inputValue, setInputValue] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isOpen) {
            setInputValue("");
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const parseVal = (input: string) => {
        let val = 0;
        if (type === "time") {
            const h = input.match(/(\d+)h/);
            const m = input.match(/(\d+)m/);
            const s = input.match(/(\d+)s/);
            const pureNum = input.match(/^(\d+)$/);

            if (pureNum) {
                val = parseInt(pureNum[1]);
            } else {
                if (h) val += parseInt(h[1]) * 3600;
                if (m) val += parseInt(m[1]) * 60;
                if (s) val += parseInt(s[1]);
            }
        } else {
            val = parseInt(input.replace(/[^0-9]/g, "")) || 0;
        }
        return isNaN(val) ? 0 : val;
    };

    const getDynamicLabel = (val: number) => {
        if (val === 0 || isNaN(val)) return "infinite test";
        if (type === "words") return `${val} words`;
        
        const h = Math.floor(val / 3600);
        const m = Math.floor((val % 3600) / 60);
        const s = val % 60;

        const res = [];
        if (h > 0) res.push(`${h} hour${h > 1 ? 's' : ''}`);
        if (m > 0) res.push(`${m} minute${m > 1 ? 's' : ''}`);
        if (s > 0) res.push(`${s} second${s > 1 ? 's' : ''}`);
        
        if (res.length === 0) return "infinite test";
        if (res.length === 1) return res[0];
        const last = res.pop();
        return `${res.join(", ")} and ${last}`;
    };

    const handleConfirm = () => {
        const val = parseVal(inputValue);
        onConfirm(val);
    };

    const currentVal = parseVal(inputValue);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 cursor-pointer"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div 
                className="relative w-full max-w-md bg-mt-bg p-8 rounded-xl shadow-2xl animate-in zoom-in-95 fade-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col gap-6">
                    <h2 className="text-xl font-bold text-mt-text opacity-50 normal-case">
                        {type === "time" ? "Test duration" : "Custom word amount"}
                    </h2>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="text-mt-primary text-center text-sm font-bold lowercase">
                                {getDynamicLabel(currentVal)}
                            </div>
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value.toLowerCase().replace(type === "time" ? /[^0-9hms]/g : /[^0-9]/g, ""))}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.stopPropagation();
                                            handleConfirm();
                                            return;
                                        }
                                        if (e.key === "Escape") {
                                            e.stopPropagation();
                                            onClose();
                                            return;
                                        }
                                        
                                        // Stop propagation for normal characters and editing keys
                                        // to prevent the global typing engine from stealing focus.
                                        // Allow global shortcuts (Ctrl/Cmd combinations) to bubble.
                                        const isModifier = e.ctrlKey || e.metaKey || e.altKey;
                                        if (!isModifier) {
                                            e.stopPropagation();
                                        }
                                    }}
                                    className="w-full bg-mt-bg-alt/50 border-none outline-none rounded-lg p-4 text-3xl font-mono text-mt-primary text-center selection:bg-mt-primary/30 caret-mt-primary"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-4 text-xs text-mt-text-dim text-center leading-relaxed">
                            {type === "time" && (
                                <div className="opacity-70">
                                    you can use <kbd className="bg-mt-text-dim/10 px-1 rounded text-[10px]">h</kbd> for hours and <kbd className="bg-mt-text-dim/10 px-1 rounded text-[10px]">m</kbd> for minutes, for example <span className="text-mt-text">1h30m</span>.
                                </div>
                            )}

                            <div className="opacity-70">
                                you can start an infinite test by inputting 0. then, to stop the test, use the bail out feature (<kbd className="bg-mt-text-dim/10 px-1 rounded text-[10px]">esc</kbd> or <kbd className="bg-mt-text-dim/10 px-1 rounded text-[10px]">ctrl</kbd>+<kbd className="bg-mt-text-dim/10 px-1 rounded text-[10px]">shift</kbd>+<kbd className="bg-mt-text-dim/10 px-1 rounded text-[10px]">p</kbd> &gt; bail out)
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="w-full py-3 bg-mt-bg-alt/50 hover:bg-mt-bg-alt hover:text-mt-text transition-all rounded-lg text-mt-text-dim font-bold lowercase mt-2 cursor-pointer"
                    >
                        ok
                    </button>
                </div>
            </div>
        </div>
    );
}
