"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { FaSave, FaFolderOpen, FaFileUpload, FaFilter, FaCog, FaCheck, FaTimes, FaPlus, FaCogs, FaKeyboard, FaGlobe, FaArrowRight } from "react-icons/fa";
import { WORD_POOL, KHMER_WORD_POOL, LAYOUT_MAPS } from "@/constants/words";

const GENERATOR_PRESETS: Record<string, string> = {
    "a-z": "abcdefghijklmnopqrstuvwxyz",
    "0-9": "0123456789",
    "symbols": "!@#$%^&*()-_=+[]{}'\"\\:;,.<>/?",
    "bigrams": "th he in er an re on at en nd st ed or as th hi es it it ti te et th",
    "trigrams": "the and ing her hat his tha ere for ent ion ter was you ith ver"
};

// Removed global toWords to avoid confusion with the one inside the component

interface CustomTextModalProps {
    isOpen: boolean;
    initialValue: string;
    initialMode: "simple" | "repeat" | "shuffle" | "random";
    initialLimitMode: "none" | "word" | "time" | "section";
    initialLimitValue: number;
    initialPipeDelimiter: boolean;
    onClose: () => void;
    onConfirm: (payload: {
        text: string;
        mode: "simple" | "repeat" | "shuffle" | "random";
        limitMode: "none" | "word" | "time" | "section";
        limitValue: number;
        pipeDelimiter: boolean;
    }) => void;
}

export function CustomTextModal({
    isOpen,
    initialValue,
    initialMode,
    initialLimitMode,
    initialLimitValue,
    initialPipeDelimiter,
    onClose,
    onConfirm
}: CustomTextModalProps) {
    const [value, setValue] = React.useState(initialValue);
    const [mode, setMode] = React.useState<"simple" | "repeat" | "shuffle" | "random">(initialMode);
    const [limitMode, setLimitMode] = React.useState<"none" | "word" | "time" | "section">(initialLimitMode);
    const [limitValue, setLimitValue] = React.useState(`${initialLimitValue || ""}`);
    const [pipeDelimiter, setPipeDelimiter] = React.useState(initialPipeDelimiter);
    const [removeZeroWidth, setRemoveZeroWidth] = React.useState(true);
    const [removeFancy, setRemoveFancy] = React.useState(true);
    const [replaceControl, setReplaceControl] = React.useState(true);
    const [replaceNewlines, setReplaceNewlines] = React.useState<"off" | "space" | "periodSpace">("off");
    const [savedTexts, setSavedTexts] = React.useState<{ name: string; text: string; isBookMode?: boolean }[]>([]);
    const [showWordsFilterPopup, setShowWordsFilterPopup] = React.useState(false);
    const [showGeneratorPopup, setShowGeneratorPopup] = React.useState(false);
    const [showSavePopup, setShowSavePopup] = React.useState(false);
    const [showSavedTextsPopup, setShowSavedTextsPopup] = React.useState(false);
    const [saveName, setSaveName] = React.useState("");
    const [isBookMode, setIsBookMode] = React.useState(false);
    const [filterMin, setFilterMin] = React.useState("");
    const [filterMax, setFilterMax] = React.useState("");
    const [filterInclude, setFilterInclude] = React.useState("");
    const [filterExclude, setFilterExclude] = React.useState("");
    const [filterExactMatch, setFilterExactMatch] = React.useState(false);
    const [filterLanguage, setFilterLanguage] = React.useState<"english" | "khmer">("english");
    const [filterPreset, setFilterPreset] = React.useState("home keys");
    const [filterLayout, setFilterLayout] = React.useState("qwerty");
    const [generatorPreset, setGeneratorPreset] = React.useState("a-z");
    const [generatorCharset, setGeneratorCharset] = React.useState("abcdefghijklmnopqrstuvwxyz");
    const [generatorMin, setGeneratorMin] = React.useState("2");
    const [generatorMax, setGeneratorMax] = React.useState("5");
    const [generatorCount, setGeneratorCount] = React.useState("100");

    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    const fileRef = React.useRef<HTMLInputElement>(null);
    const saveNameRef = React.useRef<HTMLInputElement>(null);
    const SAVED_KEY = "mt_custom_text_saved_v1";

    const loadSaved = React.useCallback(() => {
        try {
            const parsed = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
            if (Array.isArray(parsed)) {
                setSavedTexts(parsed.filter((x: any) => x && typeof x.name === "string" && typeof x.text === "string"));
            }
        } catch { setSavedTexts([]); }
    }, []);

    React.useEffect(() => {
        if (!isOpen) return;
        setValue(initialValue);
        setMode(initialMode);
        setLimitMode(initialLimitMode);
        setLimitValue(`${initialLimitValue || ""}`);
        setPipeDelimiter(initialPipeDelimiter);
        loadSaved();
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [isOpen, initialValue, initialMode, initialLimitMode, initialLimitValue, initialPipeDelimiter, loadSaved]);

    const cleanTypography = (text: string) => text
        .replace(/[""„‟]/g, "\"")
        .replace(/[''‚‛]/g, "'")
        .replace(/[–—]/g, "-")
        .replace(/…/g, "...");

    const processText = React.useCallback((raw: string) => {
        let text = raw.normalize();
        text = text.replace(/[\u2000-\u200A\u202F\u205F\u00A0]/g, " ");
        if (removeZeroWidth) text = text.replace(/[\u200B-\u200D\u2060\uFEFF]/g, "");
        if (replaceControl) text = text.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\r/g, "\r");
        text = text.replace(/ +/g, " ");
        if (removeFancy) text = cleanTypography(text);
        if (replaceNewlines === "space") text = text.replace(/\r?\n/g, " ");
        if (replaceNewlines === "periodSpace") text = text.replace(/\r?\n/g, ". ").replace(/\.\. /g, ". ");
        return text;
    }, [removeZeroWidth, replaceControl, removeFancy, replaceNewlines]);

    const toWords = React.useCallback((raw: string) => {
        const processed = processText(raw);
        return (pipeDelimiter ? processed.split("|") : processed.split(/\s+/))
            .map(w => w.trim()).filter(Boolean);
    }, [processText, pipeDelimiter]);

    // Memoize word and character counts to avoid heavy regex on every render
    const { wordCount, charCount } = React.useMemo(() => ({
        wordCount: toWords(value).length,
        charCount: value.length
    }), [value, toWords]);

    // Global ESC handler — works even when no input is focused
    React.useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                if (showSavePopup) {
                    setShowSavePopup(false);
                } else if (showSavedTextsPopup) {
                    setShowSavedTextsPopup(false);
                } else if (showWordsFilterPopup) {
                    setShowWordsFilterPopup(false);
                } else if (showGeneratorPopup) {
                    setShowGeneratorPopup(false);
                } else {
                    onClose();
                }
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, showSavePopup, showSavedTextsPopup, onClose]);

    if (!isOpen) return null;



    const openSavePopup = () => {
        setSaveName("");
        setIsBookMode(false);
        setShowSavePopup(true);
        setShowSavedTextsPopup(false);
        setTimeout(() => saveNameRef.current?.focus(), 50);
    };

    const openSavedTextsPopup = () => {
        loadSaved();
        setShowSavedTextsPopup(true);
        setShowSavePopup(false);
        setShowWordsFilterPopup(false);
    };

    const openWordsFilterPopup = () => {
        setShowWordsFilterPopup(true);
        setShowSavePopup(false);
        setShowSavedTextsPopup(false);
        setShowGeneratorPopup(false);
    };

    const openGeneratorPopup = () => {
        setShowGeneratorPopup(true);
        setShowWordsFilterPopup(false);
        setShowSavePopup(false);
        setShowSavedTextsPopup(false);
    };

    const handleLoadSavedText = (text: string) => {
        setValue(text);
        setShowSavedTextsPopup(false);
    };

    const handleSaveConfirm = () => {
        if (!saveName.trim()) return;
        const next = [{ name: saveName.trim(), text: value, isBookMode }, ...savedTexts.filter(s => s.name !== saveName.trim())].slice(0, 50);
        localStorage.setItem(SAVED_KEY, JSON.stringify(next));
        setSavedTexts(next);
        setShowSavePopup(false);
    };

    const handleDeleteSaved = (name: string) => {
        const next = savedTexts.filter(s => s.name !== name);
        localStorage.setItem(SAVED_KEY, JSON.stringify(next));
        setSavedTexts(next);
    };

    const applyWordFilter = (action: "set" | "add") => {
        const pool = filterLanguage === "english" ? WORD_POOL : KHMER_WORD_POOL;
        const minLen = filterMin ? parseInt(filterMin, 10) : 0;
        const maxLen = filterMax ? parseInt(filterMax, 10) : Infinity;
        const includeChars = filterInclude.toLowerCase().split(" ").filter(Boolean);
        const excludeChars = filterExclude.toLowerCase().split(" ").filter(Boolean);

        const filtered = pool.filter(word => {
            const w = word.toLowerCase();
            if (w.length < minLen) return false;
            if (w.length > maxLen) return false;

            if (includeChars.length > 0) {
                if (filterExactMatch) {
                    if (!includeChars.includes(w)) return false;
                } else {
                    if (!includeChars.some(char => w.includes(char))) return false;
                }
            }

            if (excludeChars.length > 0) {
                if (excludeChars.some(char => w.includes(char))) return false;
            }

            return true;
        });

        if (filtered.length === 0) {
            alert("No words found matching these filters");
            return;
        }

        const resultText = filtered.join(pipeDelimiter ? "|" : " ");
        setValue(action === "set" ? resultText : (value.trim() ? `${value.trim()} ${resultText}` : resultText));
        setShowWordsFilterPopup(false);
    };

    const applyPresetGenerator = () => {
        const val = GENERATOR_PRESETS[generatorPreset];
        if (val) setGeneratorCharset(val);
    };

    const applyPresetFilter = () => {
        // Simple implementation of home keys etc. for qwerty
        const layout = LAYOUT_MAPS[filterLayout] || LAYOUT_MAPS.qwerty;
        let pKeys = "";
        if (filterPreset === "home keys") pKeys = "f j";
        else if (filterPreset === "home row") pKeys = "a s d f g h j k l ; '";
        else if (filterPreset === "top row") pKeys = "q w e r t y u i o p [ ] \\";
        else if (filterPreset === "bottom row") pKeys = "z x c v b n m , . /";
        else if (filterPreset === "left hand") pKeys = "q w e r t a s d f g z x c v b";
        else if (filterPreset === "right hand") pKeys = "y u i o p h j k l n m";

        setFilterInclude(pKeys);
        setFilterExactMatch(false);
    };

    const applyGenerator = (action: "set" | "add") => {
        const charsetTokens = generatorCharset.includes(" ")
            ? generatorCharset.split(/\s+/).filter(Boolean)
            : generatorCharset.split("");
        if (charsetTokens.length === 0) return;
        const min = Math.max(1, parseInt(generatorMin || "1", 10));
        const max = Math.max(min, parseInt(generatorMax || generatorMin || "1", 10));
        const count = Math.max(1, parseInt(generatorCount || "1", 10));
        const generated: string[] = [];
        for (let i = 0; i < count; i++) {
            const len = Math.floor(Math.random() * (max - min + 1)) + min;
            let wordBuf: string[] = new Array(len);
            for (let j = 0; j < len; j++) {
                wordBuf[j] = charsetTokens[Math.floor(Math.random() * charsetTokens.length)];
            }
            generated.push(wordBuf.join(""));
        }
        const text = generated.join(pipeDelimiter ? "|" : " ");
        setValue(action === "set" ? text : `${value.trim()} ${text}`.trim());
        setShowGeneratorPopup(false);
    };

    const handleFileOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setValue(String(reader.result || ""));
        reader.readAsText(file, "UTF-8");
        e.target.value = "";
    };

    const handleApply = () => {
        const words = toWords(value);
        if (words.length === 0) return;
        const normalizedMode = mode === "simple" ? "repeat" : mode;
        const normalizedLimitMode = mode === "simple" ? (pipeDelimiter ? "section" : "word") : limitMode;
        const explicitLimit = Math.max(0, parseInt(limitValue || "0", 10));
        const normalizedLimitValue = (mode === "simple" && explicitLimit === 0)
            ? words.length
            : (normalizedLimitMode === "none" ? 0 : explicitLimit);
        onConfirm({
            text: words.join(pipeDelimiter ? "|" : " "),
            mode: normalizedMode,
            limitMode: normalizedLimitMode,
            limitValue: normalizedLimitValue,
            pipeDelimiter
        });
    };

    const stopPropagation = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            e.stopPropagation();
            if (showSavePopup) {
                setShowSavePopup(false);
            } else if (showSavedTextsPopup) {
                setShowSavedTextsPopup(false);
            } else if (showWordsFilterPopup) {
                setShowWordsFilterPopup(false);
            } else if (showGeneratorPopup) {
                setShowGeneratorPopup(false);
            } else {
                onClose();
            }
            return;
        }
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); handleApply(); return; }
        const isModifier = e.ctrlKey || e.metaKey || e.altKey;
        if (!isModifier) e.stopPropagation();
    };

    const Btn = ({ active, onClick, children, className: cx }: { active?: boolean; onClick: () => void; children: React.ReactNode; className?: string }) => (
        <button onClick={onClick} className={cn(
            "px-3 py-1.5 rounded text-xs font-bold lowercase transition-all duration-150 cursor-pointer",
            active ? "text-mt-primary bg-mt-primary/10" : "text-mt-text-dim bg-mt-bg-alt/50 hover:bg-mt-bg-alt hover:text-mt-text",
            cx
        )}>{children}</button>
    );

    const SectionHeader = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
        <div className="flex gap-2.5 items-start mb-2">
            <div className="text-mt-text-dim mt-0.5 text-sm opacity-60">{icon}</div>
            <div>
                <div className="text-xs font-bold text-mt-text lowercase leading-tight">{title}</div>
                <div className="text-[10px] text-mt-text-dim opacity-60 leading-snug mt-0.5">{desc}</div>
            </div>
        </div>
    );

    const ToggleRow = ({ label, desc, options, value: val, onChange }: {
        label: string; desc: string;
        options: { id: string; label: string }[];
        value: string; onChange: (v: string) => void;
    }) => (
        <div className="py-2 border-b border-mt-bg-alt/40 last:border-b-0">
            <div className="text-[11px] font-bold text-mt-text lowercase mb-0.5">{label}</div>
            <div className="text-[10px] text-mt-text-dim opacity-50 mb-1.5">{desc}</div>
            <div className="flex flex-wrap gap-1.5">
                {options.map(o => (
                    <Btn key={o.id} active={val === o.id} onClick={() => onChange(o.id)}>{o.label}</Btn>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200 cursor-pointer" onClick={() => {
                if (showSavePopup) setShowSavePopup(false);
                else if (showSavedTextsPopup) setShowSavedTextsPopup(false);
                else if (showWordsFilterPopup) setShowWordsFilterPopup(false);
                else if (showGeneratorPopup) setShowGeneratorPopup(false);
                else onClose();
            }} />

            {/* Main custom text modal — hidden when any popup is active */}
            <div className={cn(
                "relative w-full max-w-5xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-mt-bg rounded-xl shadow-2xl animate-in zoom-in-95 fade-in duration-200",
                (showSavePopup || showSavedTextsPopup || showWordsFilterPopup || showGeneratorPopup) && "hidden"
            )}
                onClick={e => e.stopPropagation()} onKeyDown={stopPropagation}>

                <div className="p-5 sm:p-6 flex flex-col gap-4">
                    {/* Top action bar */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Btn onClick={openSavePopup}><span className="flex items-center gap-1.5"><FaSave size={11} /> save</span></Btn>
                        <Btn onClick={openSavedTextsPopup}><span className="flex items-center gap-1.5"><FaFolderOpen size={11} /> saved texts</span></Btn>
                        <input ref={fileRef} type="file" accept=".txt" className="hidden" onChange={handleFileOpen} />
                        <Btn onClick={() => fileRef.current?.click()}><span className="flex items-center gap-1.5"><FaFileUpload size={11} /> open file</span></Btn>
                        <Btn active={showWordsFilterPopup} onClick={openWordsFilterPopup}>
                            <span className="flex items-center gap-1.5"><FaFilter size={10} /> words filter</span>
                        </Btn>
                        <Btn active={showGeneratorPopup} onClick={openGeneratorPopup}>
                            <span className="flex items-center gap-1.5"><FaCog size={11} /> custom generator</span>
                        </Btn>
                    </div>



                    {/* Two-column layout */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Left: Textarea */}
                        <div className="flex-1 min-w-0">
                            <textarea
                                ref={inputRef}
                                value={value}
                                onChange={e => setValue(e.target.value)}
                                onKeyDown={stopPropagation}
                                className="w-full h-64 md:h-80 bg-mt-bg-alt/40 border border-mt-bg-alt/60 outline-none rounded-lg p-4 text-sm leading-relaxed text-mt-text selection:bg-mt-primary/30 caret-mt-primary resize-none focus:border-mt-primary/30 transition-colors"
                                placeholder="type or paste your custom text here"
                            />
                            <div className="flex items-center justify-between text-[10px] text-mt-text-dim mt-1.5 px-1">
                                <span className="opacity-50">ctrl+enter to apply</span>
                                <span className="opacity-50">{charCount} chars · {wordCount} words</span>
                            </div>
                        </div>

                        {/* Right: Settings sidebar */}
                        <div className="w-full md:w-72 flex flex-col gap-0 bg-mt-bg-alt/20 border border-mt-bg-alt/40 rounded-lg p-4 overflow-y-auto max-h-[380px] custom-scrollbar">
                            {/* Mode */}
                            <div className="pb-3 border-b border-mt-bg-alt/40">
                                <SectionHeader icon={<span>⚙</span>} title="mode" desc="Change the way words are generated." />
                                <div className="flex flex-wrap gap-1.5">
                                    {(["simple", "repeat", "shuffle", "random"] as const).map(m => (
                                        <Btn key={m} active={mode === m} onClick={() => setMode(m)}>{m}</Btn>
                                    ))}
                                </div>
                            </div>

                            {/* Limit */}
                            <div className="py-3 border-b border-mt-bg-alt/40">
                                <SectionHeader icon={<span>#</span>} title="limit" desc="Control how many words to generate or for how long." />
                                <div className="flex items-center gap-2">
                                    <input
                                        value={limitMode === "word" || limitMode === "none" ? limitValue : ""}
                                        onChange={e => { setLimitMode("word"); setLimitValue(e.target.value.replace(/[^0-9]/g, "")); }}
                                        onKeyDown={stopPropagation}
                                        className="w-20 px-2 py-1.5 rounded bg-mt-bg-alt/40 text-xs text-mt-text border border-transparent focus:border-mt-primary/30 outline-none transition-colors"
                                        placeholder="words"
                                    />
                                    <span className="text-[10px] text-mt-text-dim opacity-40">or</span>
                                    <input
                                        value={limitMode === "time" ? limitValue : ""}
                                        onChange={e => { setLimitMode("time"); setLimitValue(e.target.value.replace(/[^0-9]/g, "")); }}
                                        onKeyDown={stopPropagation}
                                        className="w-20 px-2 py-1.5 rounded bg-mt-bg-alt/40 text-xs text-mt-text border border-transparent focus:border-mt-primary/30 outline-none transition-colors"
                                        placeholder="time"
                                    />
                                </div>
                            </div>

                            {/* Word delimiter */}
                            <ToggleRow label="word delimiter" desc="Change how words are separated."
                                options={[{ id: "pipe", label: "pipe" }, { id: "space", label: "space" }]}
                                value={pipeDelimiter ? "pipe" : "space"}
                                onChange={v => setPipeDelimiter(v === "pipe")} />

                            {/* Cleanup toggles */}
                            <ToggleRow label="remove zero-width characters" desc="Fully remove zero-width characters."
                                options={[{ id: "no", label: "no" }, { id: "yes", label: "yes" }]}
                                value={removeZeroWidth ? "yes" : "no"}
                                onChange={v => setRemoveZeroWidth(v === "yes")} />

                            <ToggleRow label="remove fancy typography" desc='Standardises typography symbols (e.g. " and " become ")'
                                options={[{ id: "no", label: "no" }, { id: "yes", label: "yes" }]}
                                value={removeFancy ? "yes" : "no"}
                                onChange={v => setRemoveFancy(v === "yes")} />

                            <ToggleRow label="replace control characters" desc="Replace control characters (\n becomes a new line)"
                                options={[{ id: "no", label: "no" }, { id: "yes", label: "yes" }]}
                                value={replaceControl ? "yes" : "no"}
                                onChange={v => setReplaceControl(v === "yes")} />

                            <ToggleRow label="replace new lines with spaces" desc="Replace all new line characters with spaces."
                                options={[{ id: "off", label: "off" }, { id: "space", label: "space" }, { id: "periodSpace", label: "period + space" }]}
                                value={replaceNewlines}
                                onChange={v => setReplaceNewlines(v as "off" | "space" | "periodSpace")} />
                        </div>
                    </div>


                    {/* Old custom generator panel removed */}

                    {/* OK button */}
                    <button onClick={handleApply}
                        className="w-full py-3 bg-mt-bg-alt/40 hover:bg-mt-bg-alt hover:text-mt-text transition-all rounded-lg text-mt-text-dim font-bold lowercase text-sm cursor-pointer">
                        ok
                    </button>
                </div>
            </div>

            {/* Save Custom Text Popup — replaces the main modal, click outside returns to custom modal */}
            {showSavePopup && (
                <div
                    className="relative w-full max-w-md bg-mt-bg rounded-xl shadow-2xl animate-in zoom-in-95 fade-in duration-200"
                    onClick={e => e.stopPropagation()}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") { e.stopPropagation(); setShowSavePopup(false); }
                        if (e.key === "Enter") { e.preventDefault(); handleSaveConfirm(); }
                        const isMod = e.ctrlKey || e.metaKey || e.altKey;
                        if (!isMod) e.stopPropagation();
                    }}
                >
                        <div className="p-6 flex flex-col gap-5">
                            {/* Title */}
                            <h3 className="text-lg font-bold text-mt-text lowercase">save custom text</h3>

                            {/* Name input with validation icon */}
                            <div className="relative group/input">
                                <input
                                    ref={saveNameRef}
                                    value={saveName}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val === "" || /^[a-zA-Z0-9 _-]+$/.test(val)) {
                                            setSaveName(val);
                                        }
                                    }}
                                    className="w-full bg-mt-bg-alt/50 border border-mt-bg-alt/70 outline-none rounded-lg pl-4 pr-10 py-3 text-sm text-mt-text caret-mt-primary selection:bg-mt-primary/30 focus:border-mt-text-dim/40 transition-colors"
                                    placeholder="name"
                                />
                                {/* Validation icon: red ✗ when empty/invalid, yellow ✓ when valid */}
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 group/icon">
                                    {saveName.trim() && /^[a-zA-Z0-9 _-]+$/.test(saveName) ? (
                                        /* Valid — yellow checkmark */
                                        <svg className="w-4 h-4 text-mt-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        /* Invalid — red x with tooltip */
                                        <>
                                            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            {/* Tooltip on hover */}
                                            <div className="absolute right-0 top-full mt-2 w-72 px-3 py-2.5 rounded bg-[#1a1a1a] border border-[#333] shadow-xl opacity-0 invisible group-hover/icon:opacity-100 group-hover/icon:visible transition-all duration-150 z-10 pointer-events-none">
                                                <p className="text-[11px] text-[#aaa] leading-relaxed">
                                                    String must contain at least 1 character(s), Name can only contain letters, numbers, spaces, underscores and hyphens.
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Book mode checkbox — Monkeytype style: inline yellow ✓ before label */}
                            <div className="flex flex-col gap-1.5">
                                <label
                                    className="flex items-center gap-2 cursor-pointer group"
                                    onClick={() => setIsBookMode(!isBookMode)}
                                >
                                    <svg className={cn(
                                        "w-4 h-4 shrink-0 transition-colors duration-150",
                                        isBookMode ? "text-mt-primary" : "text-mt-text-dim/30 group-hover:text-mt-text-dim/50"
                                    )} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-sm text-mt-text lowercase">Long text (book mode)</span>
                                </label>

                                <p className="text-[11px] text-mt-text-dim leading-relaxed opacity-60 ml-6">
                                    Disables editing this text but allows you to save progress by pressing shift + enter or bailing out. You can then load this text again to continue where you left off.
                                </p>
                            </div>

                            {/* Save button — Monkeytype dark style */}
                            <button
                                onClick={handleSaveConfirm}
                                className="w-full py-3 rounded-lg bg-mt-bg-alt/50 hover:bg-mt-bg-alt/80 text-mt-text-dim hover:text-mt-text font-bold lowercase text-sm transition-all duration-150 cursor-pointer"
                                disabled={!saveName.trim()}
                            >
                                save
                            </button>
                        </div>
                </div>
            )}

            {/* Saved Texts Popup — replaces the main modal */}
            {showSavedTextsPopup && (
                <div
                    className="relative w-full max-w-lg bg-mt-bg rounded-xl shadow-2xl animate-in zoom-in-95 fade-in duration-200"
                    onClick={e => e.stopPropagation()}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") { e.stopPropagation(); setShowSavedTextsPopup(false); }
                        const isMod = e.ctrlKey || e.metaKey || e.altKey;
                        if (!isMod) e.stopPropagation();
                    }}
                >
                    <div className="p-6 flex flex-col gap-4">
                        {/* Saved texts section */}
                        <h3 className="text-lg text-mt-text-dim/50 lowercase">Saved texts</h3>
                        {savedTexts.filter(s => !s.isBookMode).length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {savedTexts.filter(s => !s.isBookMode).map(s => (
                                    <div key={s.name} className="flex gap-2">
                                        <button
                                            onClick={() => handleLoadSavedText(s.text)}
                                            className="flex-1 py-2.5 px-4 rounded-lg bg-mt-bg-alt/50 hover:bg-mt-bg-alt/80 text-sm text-mt-text-dim hover:text-mt-text transition-all duration-150 text-center lowercase cursor-pointer"
                                        >
                                            {s.name}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSaved(s.name)}
                                            className="px-3 py-2.5 rounded-lg bg-mt-bg-alt/50 hover:bg-red-500/20 text-mt-text-dim hover:text-red-400 transition-all duration-150 cursor-pointer"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-mt-text font-bold lowercase">No saved custom texts found</p>
                        )}

                        {/* Saved long texts section */}
                        <h3 className="text-lg text-mt-text-dim/50 lowercase mt-2">Saved long texts</h3>
                        {savedTexts.filter(s => s.isBookMode).length > 0 ? (
                            <div className="flex flex-col gap-2">
                                {savedTexts.filter(s => s.isBookMode).map(s => (
                                    <div key={s.name} className="flex gap-2">
                                        <button
                                            onClick={() => handleLoadSavedText(s.text)}
                                            className="flex-1 py-2.5 px-4 rounded-lg bg-mt-bg-alt/50 hover:bg-mt-bg-alt/80 text-sm text-mt-text-dim hover:text-mt-text transition-all duration-150 text-center lowercase cursor-pointer"
                                        >
                                            {s.name}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSaved(s.name)}
                                            className="px-3 py-2.5 rounded-lg bg-mt-bg-alt/50 hover:bg-red-500/20 text-mt-text-dim hover:text-red-400 transition-all duration-150 cursor-pointer"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-mt-text font-bold lowercase">No saved long custom texts found</p>
                        )}

                        {/* Divider + disclaimer */}
                        <div className="border-t border-mt-bg-alt/40 pt-4 mt-2">
                            <p className="text-[11px] text-mt-text-dim/50 leading-relaxed">
                                Heads up! These texts are only stored locally. If you switch devices or clear your local browser data they will be lost.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Words Filter Popup — 1:1 Monkeytype Style */}
            {showWordsFilterPopup && (
                <div
                    className="relative w-full max-w-2xl bg-mt-bg rounded-xl shadow-2xl animate-in zoom-in-95 fade-in duration-200 overflow-hidden"
                    onClick={e => e.stopPropagation()}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") { e.stopPropagation(); setShowWordsFilterPopup(false); }
                        const isMod = e.ctrlKey || e.metaKey || e.altKey;
                        if (!isMod) e.stopPropagation();
                    }}
                >
                    <div className="p-6 sm:p-8 flex flex-col gap-6">
                        {/* Language Selection Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <FaGlobe className="text-mt-text-dim text-sm" />
                                    <select 
                                        value={filterLanguage} 
                                        onChange={(e) => setFilterLanguage(e.target.value as any)}
                                        className="bg-transparent text-mt-text font-bold text-sm outline-none cursor-pointer border-b border-mt-text-dim/20 pb-0.5 hover:border-mt-primary/50 transition-colors lowercase"
                                    >
                                        <option value="english" className="bg-mt-bg">english</option>
                                        <option value="khmer" className="bg-mt-bg">khmer</option>
                                    </select>
                                </div>
                            </div>
                            <div className="text-[10px] text-mt-text-dim max-w-[280px] leading-relaxed text-right opacity-60">
                                You can manually filter words by length, words or characters (separated by spaces) on the left side. On the right side you can generate filters based on a preset and selected layout.
                            </div>
                        </div>

                        {/* Two Column Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 border-y border-mt-bg-alt/40">
                            {/* Left Column: Manual Filters */}
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] text-mt-text-dim lowercase px-1 opacity-60 cursor-pointer hover:opacity-100 transition-opacity">min length</label>
                                        <input 
                                            value={filterMin} 
                                            onChange={e => setFilterMin(e.target.value.replace(/[^0-9]/g, ""))}
                                            onKeyDown={stopPropagation}
                                            className="w-full bg-mt-bg-alt/50 border border-mt-bg-alt/70 outline-none rounded-lg px-3 py-2 text-xs text-mt-text focus:border-mt-primary/30 hover:border-mt-text-dim/30 transition-all cursor-pointer"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] text-mt-text-dim lowercase px-1 opacity-60 cursor-pointer hover:opacity-100 transition-opacity">max length</label>
                                        <input 
                                            value={filterMax} 
                                            onChange={e => setFilterMax(e.target.value.replace(/[^0-9]/g, ""))} 
                                            onKeyDown={stopPropagation}
                                            className="w-full bg-mt-bg-alt/50 border border-mt-bg-alt/70 outline-none rounded-lg px-3 py-2 text-xs text-mt-text focus:border-mt-primary/30 hover:border-mt-text-dim/30 transition-all cursor-pointer"
                                            placeholder="inf"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] text-mt-text-dim lowercase px-1 opacity-60 cursor-pointer hover:opacity-100 transition-opacity">include</label>
                                    <input 
                                        value={filterInclude} 
                                        onChange={e => setFilterInclude(e.target.value)} 
                                        onKeyDown={stopPropagation}
                                        className="w-full bg-mt-bg-alt/50 border border-mt-bg-alt/70 outline-none rounded-lg px-3 py-2 text-xs text-mt-text focus:border-mt-primary/30 hover:border-mt-text-dim/30 transition-all"
                                        placeholder="char or word"
                                    />
                                    <label className="flex items-center gap-2 cursor-pointer mt-1 group" onClick={() => setFilterExactMatch(!filterExactMatch)}>
                                        <div className={cn(
                                            "w-3.5 h-3.5 rounded flex items-center justify-center transition-all duration-150 border",
                                            filterExactMatch ? "bg-mt-primary border-mt-primary" : "bg-mt-bg-alt border-mt-bg-alt/60 group-hover:border-mt-text-dim"
                                        )}>
                                            {filterExactMatch && <FaCheck className="text-[8px] text-mt-bg" />}
                                        </div>
                                        <span className="text-[10px] text-mt-text-dim lowercase opacity-60 group-hover:opacity-100 transition-opacity">Exact match only</span>
                                    </label>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] text-mt-text-dim lowercase px-1 opacity-60 cursor-pointer hover:opacity-100 transition-opacity">exclude</label>
                                    <input 
                                        value={filterExclude} 
                                        onChange={e => setFilterExclude(e.target.value)} 
                                        onKeyDown={stopPropagation}
                                        className="w-full bg-mt-bg-alt/50 border border-mt-bg-alt/70 outline-none rounded-lg px-3 py-2 text-xs text-mt-text focus:border-mt-primary/30 hover:border-mt-text-dim/30 transition-all"
                                        placeholder="char or word"
                                    />
                                </div>
                            </div>

                            {/* Right Column: Presets */}
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] text-mt-text-dim lowercase px-1 opacity-60 cursor-pointer hover:opacity-100 transition-opacity">presets</label>
                                    <select 
                                        value={filterPreset}
                                        onChange={e => setFilterPreset(e.target.value)}
                                        className="w-full bg-mt-bg-alt/50 border border-mt-bg-alt/70 outline-none rounded-lg px-3 py-2 text-xs text-mt-text appearance-none cursor-pointer focus:border-mt-primary/30 hover:border-mt-text-dim/30 transition-all lowercase"
                                    >
                                        {["home keys", "left hand", "right hand", "home row", "top row", "bottom row"].map(p => (
                                            <option key={p} value={p} className="bg-mt-bg">{p}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] text-mt-text-dim lowercase px-1 opacity-60 cursor-pointer hover:opacity-100 transition-opacity">layout</label>
                                    <select 
                                        value={filterLayout}
                                        onChange={e => setFilterLayout(e.target.value)}
                                        className="w-full bg-mt-bg-alt/50 border border-mt-bg-alt/70 outline-none rounded-lg px-3 py-2 text-xs text-mt-text appearance-none cursor-pointer focus:border-mt-primary/30 hover:border-mt-text-dim/30 transition-all lowercase"
                                    >
                                        {Object.keys(LAYOUT_MAPS).map(l => (
                                            <option key={l} value={l} className="bg-mt-bg">{l}</option>
                                        ))}
                                    </select>
                                </div>

                                <button 
                                    onClick={applyPresetFilter}
                                    className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-mt-bg-alt/50 border border-mt-bg-alt/60 hover:bg-mt-bg-alt/80 hover:text-white transition-all text-xs font-bold text-mt-text-dim lowercase cursor-pointer"
                                >
                                    <FaArrowRight className="text-[10px]" /> apply preset
                                </button>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex flex-col gap-4">
                            <p className="text-[10px] text-mt-text-dim leading-relaxed text-center opacity-60 px-4">
                                "Set" replaces the current custom word list with the filter result, "Add" appends the filter result to the current custom word list.
                            </p>
                            
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={() => applyWordFilter("set")}
                                    className="w-full py-3 rounded-lg bg-mt-bg-alt/60 hover:bg-mt-primary/20 hover:text-mt-primary transition-all text-sm font-bold text-mt-text lowercase border border-transparent hover:border-mt-primary/30"
                                >
                                    set
                                </button>
                                <button 
                                    onClick={() => applyWordFilter("add")}
                                    className="w-full py-3 rounded-lg bg-mt-bg-alt/40 hover:bg-mt-bg-alt/80 transition-all text-sm font-bold text-mt-text-dim hover:text-mt-text lowercase border border-mt-bg-alt/30"
                                >
                                    add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Generator Popup — replaces the main modal */}
            {showGeneratorPopup && (
                <div 
                    className="relative w-full max-w-xl bg-mt-bg rounded-xl shadow-2xl animate-in zoom-in-95 fade-in duration-200"
                    onClick={e => e.stopPropagation()}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") { e.stopPropagation(); setShowGeneratorPopup(false); }
                        const isMod = e.ctrlKey || e.metaKey || e.altKey;
                        if (!isMod) e.stopPropagation();
                    }}
                >
                    <div className="p-6 flex flex-col gap-6">
                        <div className="space-y-4">
                            {/* Presets */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-mt-text-dim lowercase px-1 opacity-50">presets</label>
                                <div className="space-y-3">
                                    <select 
                                        value={generatorPreset}
                                        onChange={e => setGeneratorPreset(e.target.value)}
                                        className="w-full bg-mt-bg-alt/50 border border-mt-bg-alt/70 outline-none rounded-lg px-3 py-2.5 text-xs text-mt-text appearance-none cursor-pointer focus:border-mt-primary/30 hover:border-mt-text-dim/30 transition-all lowercase"
                                    >
                                        {Object.keys(GENERATOR_PRESETS).map(p => (
                                            <option key={p} value={p} className="bg-mt-bg">{p}</option>
                                        ))}
                                    </select>
                                    <button 
                                        onClick={applyPresetGenerator}
                                        className="w-full py-2.5 rounded-lg bg-mt-bg-alt/60 hover:bg-mt-bg-alt hover:text-mt-text text-sm font-bold text-mt-text-dim transition-all duration-150 cursor-pointer text-center lowercase"
                                    >
                                        apply
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-mt-bg-alt/40" />

                            {/* Character Set */}
                            <div className="space-y-2">
                                <p className="text-[10px] text-mt-text-dim leading-relaxed opacity-60">
                                    Enter characters or strings separated by spaces. Random combinations will be generated using these inputs.
                                </p>
                                <label className="text-xs font-bold text-mt-text-dim lowercase px-1 opacity-50">character set</label>
                                <textarea 
                                    value={generatorCharset} 
                                    onChange={e => setGeneratorCharset(e.target.value)} 
                                    onKeyDown={stopPropagation}
                                    className="w-full h-24 bg-mt-bg-alt/50 border border-mt-bg-alt/70 outline-none rounded-lg p-3 text-xs text-mt-text caret-mt-primary focus:border-mt-primary/30 hover:border-mt-text-dim/30 transition-all resize-none selection:bg-mt-primary/30"
                                    placeholder="abcdef..."
                                />
                            </div>

                            {/* Length & Count Constraints */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-mt-text-dim lowercase px-1 opacity-50">min length</label>
                                    <input 
                                        value={generatorMin} 
                                        onChange={e => setGeneratorMin(e.target.value.replace(/[^0-9]/g, ""))} 
                                        onKeyDown={stopPropagation}
                                        className="w-full bg-mt-bg-alt/50 border border-mt-bg-alt/70 outline-none rounded-lg px-3 py-2.5 text-xs text-mt-text focus:border-mt-primary/30 hover:border-mt-text-dim/30 transition-all"
                                        placeholder="min"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-mt-text-dim lowercase px-1 opacity-50">max length</label>
                                    <input 
                                        value={generatorMax} 
                                        onChange={e => setGeneratorMax(e.target.value.replace(/[^0-9]/g, ""))} 
                                        onKeyDown={stopPropagation}
                                        className="w-full bg-mt-bg-alt/50 border border-mt-bg-alt/70 outline-none rounded-lg px-3 py-2.5 text-xs text-mt-text focus:border-mt-primary/30 hover:border-mt-text-dim/30 transition-all"
                                        placeholder="max"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-mt-text-dim lowercase px-1 opacity-50">word count</label>
                                <input 
                                    value={generatorCount} 
                                    onChange={e => setGeneratorCount(e.target.value.replace(/[^0-9]/g, ""))} 
                                    onKeyDown={stopPropagation}
                                    className="w-full bg-mt-bg-alt/50 border border-mt-bg-alt/70 outline-none rounded-lg px-3 py-2.5 text-xs text-mt-text focus:border-mt-primary/30 hover:border-mt-text-dim/30 transition-all"
                                    placeholder="count"
                                />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex flex-col gap-4 pt-2">
                            <p className="text-[10px] text-mt-text-dim leading-relaxed text-center opacity-60">
                                "Set" replaces the current custom text with generated words, "Add" appends generated words to the current custom text.
                            </p>
                            
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={() => applyGenerator("set")}
                                    className="w-full py-3 rounded-lg bg-mt-bg-alt/60 hover:bg-mt-primary/20 hover:text-mt-primary transition-all text-sm font-bold text-mt-text lowercase border border-transparent hover:border-mt-primary/30 cursor-pointer"
                                >
                                    set
                                </button>
                                <button 
                                    onClick={() => applyGenerator("add")}
                                    className="w-full py-3 rounded-lg bg-mt-bg-alt/40 hover:bg-mt-bg-alt/80 transition-all text-sm font-bold text-mt-text-dim hover:text-mt-text lowercase border border-mt-bg-alt/30 cursor-pointer"
                                >
                                    add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
