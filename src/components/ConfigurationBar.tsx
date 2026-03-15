"use client";

import React from "react";
import { FaClock, FaKeyboard, FaQuoteLeft, FaMountain, FaWrench, FaGear } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { useMonkeyTypeStore, GameMode, GameConfig } from "@/hooks/use-monkeytype-store";

const SEPARATOR = <div className="w-[2px] h-4 rounded-full bg-mt-text-dim opacity-15 mx-[24px]" />;

export function ConfigurationBar() {
    const [mounted, setMounted] = React.useState(false);
    const {
        mode,
        config,
        punctuation,
        numbers,
        language,
        setMode,
        setConfig,
        setPunctuation,
        setNumbers,
        setLanguage,
        isActive,
        isFinished,
        resetLiveState
    } = useMonkeyTypeStore();
    const [isCustomModalOpen, setIsCustomModalOpen] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="h-[40px]" />; // Prevent hydration mismatch

    // Hide when active (unless finished)
    if (isActive && !isFinished) return null;

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

    return (
        <div 
            className="flex items-center justify-center bg-mt-bg-alt/90 px-8 rounded-xl text-[14px] font-bold lowercase transition-all duration-300 shadow-sm w-fit mx-auto h-[48px]"
        >
            {/* Toggles */}
            <div className="flex items-center gap-[14px]">
                <button
                    onClick={() => setPunctuation(!punctuation)}
                    className={cn(
                        "flex items-center gap-2 py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                        punctuation ? "text-mt-primary" : "text-mt-text-dim"
                    )}
                >
                    <span className="text-[15px]">@</span> punctuation
                </button>
                <button
                    onClick={() => setNumbers(!numbers)}
                    className={cn(
                        "flex items-center gap-2 py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                        numbers ? "text-mt-primary" : "text-mt-text-dim"
                    )}
                >
                    <span className="text-[15px]">#</span> numbers
                </button>
            </div>

            {SEPARATOR}

            {/* Modes */}
            <div className="flex items-center gap-[14px]">
                <button
                    onClick={() => handleModeChange("time")}
                    className={cn(
                        "flex items-center gap-2 py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                        mode === "time" ? "text-mt-primary" : "text-mt-text-dim"
                    )}
                >
                    <FaClock size={16} /> time
                </button>
                <button
                    onClick={() => handleModeChange("words")}
                    className={cn(
                        "flex items-center gap-2 py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                        mode === "words" ? "text-mt-primary" : "text-mt-text-dim"
                    )}
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 448 512"
                        className="w-[16px] h-[16px] fill-current"
                    >
                        <path d="M432 64H16C7.2 64 0 71.2 0 80v64c0 8.8 7.2 16 16 16h144v288c0 26.5 21.5 48 48 48s48-21.5 48-48V160h144c8.8 0 16-7.2 16-16V80c0-8.8-7.2-16-16-16z"/>
                    </svg> words
                </button>
                <button
                    onClick={() => handleModeChange("quote")}
                    className={cn(
                        "flex items-center gap-2 py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                        mode === "quote" ? "text-mt-primary" : "text-mt-text-dim"
                    )}
                >
                    <FaQuoteLeft size={16} /> quote
                </button>
                <button
                    onClick={() => handleModeChange("zen")}
                    className={cn(
                        "flex items-center gap-2 py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                        mode === "zen" ? "text-mt-primary" : "text-mt-text-dim"
                    )}
                >
                    <FaMountain size={16} /> zen
                </button>
                <button
                    onClick={() => handleModeChange("custom")}
                    className={cn(
                        "flex items-center gap-2 py-1 transition-all duration-150 hover:text-mt-text cursor-pointer",
                        mode === "custom" ? "text-mt-primary" : "text-mt-text-dim"
                    )}
                >
                    <FaWrench size={16} /> custom
                </button>
            </div>

            {SEPARATOR}

            {/* Sub-options */}
            <div className="flex items-center gap-[14px]">
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
                            ![15, 30, 60, 120, 10, 25, 50, 100].includes(config as any) ? "text-mt-primary" : "text-mt-text-dim"
                        )}
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 640 640"
                            className="w-[18px] h-[18px] fill-current -mt-0.5"
                        >
                            <path d="M102.8 57.3C108.2 51.9 116.6 51.1 123 55.3L241.9 134.5C250.8 140.4 256.1 150.4 256.1 161.1L256.1 210.7L346.9 301.5C380.2 286.5 420.8 292.6 448.1 320L574.2 446.1C592.9 464.8 592.9 495.2 574.2 514L514.1 574.1C495.4 592.8 465 592.8 446.2 574.1L320.1 448C292.7 420.6 286.6 380.1 301.6 346.8L210.8 256L161.2 256C150.5 256 140.5 250.7 134.6 241.8L55.4 122.9C51.2 116.6 52 108.1 57.4 102.7L102.8 57.3zM247.8 360.8C241.5 397.7 250.1 436.7 274 468L179.1 563C151 591.1 105.4 591.1 77.3 563C49.2 534.9 49.2 489.3 77.3 461.2L212.7 325.7L247.9 360.8zM416.1 64C436.2 64 455.5 67.7 473.2 74.5C483.2 78.3 485 91 477.5 98.6L420.8 155.3C417.8 158.3 416.1 162.4 416.1 166.6L416.1 208C416.1 216.8 423.3 224 432.1 224L473.5 224C477.7 224 481.8 222.3 484.8 219.3L541.5 162.6C549.1 155.1 561.8 156.9 565.6 166.9C572.4 184.6 576.1 203.9 576.1 224C576.1 267.2 558.9 306.3 531.1 335.1L482 286C448.9 253 403.5 240.3 360.9 247.6L304.1 190.8L304.1 161.1L303.9 156.1C303.1 143.7 299.5 131.8 293.4 121.2C322.8 86.2 366.8 64 416.1 63.9z"/>
                        </svg>
                    </button>
                )}
                {mode === "quote" && (
                    <button className="py-1 text-mt-text-dim hover:text-mt-text cursor-pointer transition-all">all</button>
                )}
            </div>

            {SEPARATOR}

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
        </div>
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

        let res = [];
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
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div 
                className="relative w-full max-w-md bg-mt-bg p-8 rounded-xl shadow-2xl animate-in zoom-in-95 fade-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col gap-6">
                    <h2 className="text-xl font-bold text-mt-text opacity-50">
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
                                    className="w-full bg-mt-bg-alt/50 border-none outline-none rounded-lg p-4 text-3xl font-mono text-mt-primary text-center selection:bg-mt-primary/30"
                                    placeholder="0"
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
                        className="w-full py-3 bg-mt-bg-alt/50 hover:bg-mt-bg-alt hover:text-mt-text transition-all rounded-lg text-mt-text-dim font-bold lowercase mt-2"
                    >
                        ok
                    </button>
                </div>
            </div>
        </div>
    );
}
