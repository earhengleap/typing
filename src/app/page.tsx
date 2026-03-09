"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Timer, Keyboard as KeyboardIcon, Type, Globe, Search, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMonkeyTypeStore, GameMode, GameConfig, Language, Theme, ChartPoint } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import { UserMenu } from "@/components/UserMenu";
import { saveTypingResult, incrementTestsStarted, getGhostRun } from "@/app/actions/typing-results";
import { ACHIEVEMENTS } from "@/constants/achievements";
import { saveLeaderboardResult } from "@/app/actions/leaderboard";
import { Leaderboard } from "@/components/Leaderboard";
import { Header } from "@/components/Header";

const WORD_POOL = [
    "function", "variable", "constant", "component", "interface", "generic", "promise", "async", "await", "callback",
    "closure", "hoisting", "recursion", "algorithm", "database", "frontend", "backend", "fullstack", "serverless",
    "container", "docker", "kubernetes", "typescript", "javascript", "react", "angular", "vue", "nextjs", "vite",
    "tailwind", "postcss", "eslint", "prettier", "git", "commit", "push", "pull", "merge", "branch", "conflict",
    "deployment", "continuous", "integration", "delivery", "pipeline", "automation", "testing", "jest", "cypress",
    "debugger", "console", "terminal", "workflow", "production", "staging", "development", "middleware", "package",
    "application", "framework", "library", "module", "export", "import", "class", "object", "array", "string",
    "number", "boolean", "null", "undefined", "symbol", "bigint", "operator", "expression", "statement", "loop",
    "condition", "switch", "case", "default", "try", "catch", "finally", "throw", "error", "event", "listener",
    "handler", "state", "props", "hook", "effect", "context", "reducer", "memo", "ref", "query", "mutation",
    "api", "endpoint", "request", "response", "json", "xml", "html", "css", "scss", "less", "stylus",
    "render", "virtual", "shadow", "proxy", "reflect", "iterator", "generator", "prototype", "constructor",
    "inheritance", "polymorphism", "encapsulation", "abstraction", "singleton", "factory", "observer", "pattern",
    "architecture", "microservice", "monolith", "gateway", "loadbalancer", "cache", "redis", "queue", "stream",
    "socket", "websocket", "protocol", "encryption", "authentication", "authorization", "token", "session",
    "cookie", "header", "payload", "schema", "migration", "transaction", "index", "constraint", "normalize",
    "aggregate", "pipeline", "transform", "validate", "sanitize", "escape", "encode", "decode", "compress",
    "buffer", "channel", "thread", "process", "runtime", "compiler", "interpreter", "bytecode", "assembly",
    "register", "memory", "pointer", "stack", "heap", "garbage", "collection", "reference", "scope", "chain",
    "binding", "dispatch", "middleware", "resolver", "loader", "plugin", "extension", "widget", "component",
    "template", "directive", "decorator", "annotation", "metadata", "reflection", "introspection", "dynamic",
    "static", "immutable", "mutable", "reactive", "declarative", "imperative", "functional", "procedural"
];

const KHMER_WORD_POOL = [
    "សួស្តី", "អរគុណ", "កម្ពុជា", "ភ្នំពេញ", "ស្រលាញ់", "បច្ចេកវិទ្យា", "កម្មវិធី", "កូដ", "ទូរស័ព្ទ", "កុំព្យូទ័រ",
    "ការងារ", "សាលា", "រៀន", "អាន", "សរសេរ", "និយាយ", "ស្តាប់", "យល់", "ដឹង", "ធ្វើ",
    "បាន", "មាន", "អត់", "មិន", "ល្អ", "ច្រើន", "តិច", "ធំ", "តូច", "វែង",
    "ខ្លី", "ថ្ងៃមិញ", "ថ្ងៃនេះ", "ថ្ងៃស្អែក", "ពេល", "ម៉ោង", "នាទី", "វិនាទី", "ប៉ុន្មាន", "ប្រហែល",
    "ប្រាកដ", "ច្បាស់", "ត្រឹមត្រូវ", "ខុស", "ត្រូវ", "ថ្មី", "ចាស់", "ស្អាត", "លឿន", "យឺត",
    "សប្បាយ", "ពិបាក", "ងាយ", "ស្រួល", "ជួយ", "សុំ", "ឲ្យ", "យក", "ទុក", "ចាំ",
    "ភ្លេច", "គិត", "ស្មាន", "ជឿ", "សង្ឃឹម", "ចង់", "ត្រូវការ", "អាច", "គួរ", "មុខ",
    "ក្រោយ", "លើ", "ក្រោម", "ក្នុង", "ក្រៅ", "ឆ្វេង", "ស្តាំ", "កណ្តាល", "គៀន", "ជិត",
    "ឆ្ងាយ", "ដើរ", "រត់", "ឈរ", "អង្គុយ", "ដេក", "ញ៉ាំ", "ផឹក", "មើល", "ឃើញ",
    "ទិញ", "លក់", "ចំណាយ", "ចំណេញ", "ខាត", "ថ្លៃ", "ថោក", "ប្រាក់", "លុយ", "ធនាគារ",
    "ផ្ទះ", "គ្រួសារ", "ម្តាយ", "ឪពុក", "បងប្រុស", "បងស្រី", "កូន", "ប្រពន្ធ", "ប្តី", "មិត្ត",
    "សត្វ", "ឆ្កែ", "ឆ្មា", "បក្សី", "ត្រី", "ដំរី", "ខ្លា", "ក្រពើ", "សេះ", "គោ",
    "ម្ហូប", "បាយ", "ទឹក", "ផ្លែឈើ", "បន្លែ", "សាច់", "ស៊ុប", "នំ", "កាហ្វេ", "តែ",
    "ស្រស់", "ពិសេស", "ឆ្ងាញ់", "ផ្អែម", "ជូរ", "ប្រៃ", "ហឹរ", "ក្តៅ", "ត្រជាក់", "រដូវ",
    "ភ្លៀង", "ខ្យល់", "ព្រះអាទិត្យ", "ព្រះច័ន្ទ", "ផ្កាយ", "មេឃ", "ទន្លេ", "សមុទ្រ", "ភ្នំ", "វាល",
    "ប្រទេស", "ទីក្រុង", "ភូមិ", "ផ្លូវ", "ទីផ្សារ", "វត្ត", "សាលារៀន", "មន្ទីរពេទ្យ", "ស្ពាន", "រោងចក្រ"
];

const KEYBOARD_ROWS = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
    ["shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "shift"],
    ["space"]
];

const KHMER_KEY_MAP: Record<string, { base: string, shift: string }> = {
    // Row 1
    "`": { base: "\u200C", shift: "\u200D" }, // ZWNJ, ZWJ
    "1": { base: "១", shift: "!" }, "2": { base: "២", shift: "ៗ" }, "3": { base: "៣", shift: "\"" }, "4": { base: "៤", shift: "៛" }, "5": { base: "៥", shift: "%" }, "6": { base: "៦", shift: "៍" }, "7": { base: "៧", shift: "័" }, "8": { base: "៨", shift: "៏" }, "9": { base: "៩", shift: "(" }, "0": { base: "០", shift: ")" }, "-": { base: "ឥ", shift: "_" }, "=": { base: "ឲ", shift: "+" },
    // Row 2
    "q": { base: "ឆ", shift: "ឈ" }, "w": { base: "ឹ", shift: "ឺ" }, "e": { base: "េ", shift: "ែ" }, "r": { base: "រ", shift: "ឬ" }, "t": { base: "ត", shift: "ទ" }, "y": { base: "យ", shift: "ួ" }, "u": { base: "ុ", shift: "ូ" }, "i": { base: "ិ", shift: "ី" }, "o": { base: "ោ", shift: "ៅ" }, "p": { base: "ផ", shift: "ភ" }, "[": { base: "ៀ", shift: "ឿ" }, "]": { base: "ឪ", shift: "ឧ" }, "\\": { base: "ឮ", shift: "ឭ" },
    // Row 3
    "a": { base: "ា", shift: "ាំ" }, "s": { base: "ស", shift: "ៃ" }, "d": { base: "ដ", shift: "ឌ" }, "f": { base: "ថ", shift: "ធ" }, "g": { base: "ង", shift: "អ" }, "h": { base: "ហ", shift: "ះ" }, "j": { base: "្", shift: "ញ" }, "k": { base: "ក", shift: "គ" }, "l": { base: "ល", shift: "ឡ" }, ";": { base: "ោះ", shift: "ើ" }, "'": { base: "់", shift: "៉" },
    // Row 4
    "z": { base: "ឋ", shift: "ឍ" }, "x": { base: "ខ", shift: "ឃ" }, "c": { base: "ច", shift: "ជ" }, "v": { base: "វ", shift: "េះ" }, "b": { base: "ប", shift: "ព" }, "n": { base: "ន", shift: "ណ" }, "m": { base: "ម", shift: "ំ" }, ",": { base: ",", shift: "។" }, ".": { base: ".", shift: "ៗ" }, "/": { base: "/", shift: "?" }
};

const ENGLISH_BASE_MAP: Record<string, string> = {
    '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0', '_': '-', '+': '=',
    '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/'
};

const LEFT_SIDE_KEYS = new Set([
    '1', '2', '3', '4', '5',
    'q', 'w', 'e', 'r', 't',
    'a', 's', 'd', 'f', 'g',
    'z', 'x', 'c', 'v', 'b'
]);

// THEMES config imported from @/constants/themes

// --- Performance Chart Component ---
const PerformanceChart = React.memo(({ data, theme }: { data: ChartPoint[], theme: typeof THEMES.codex }) => {
    if (data.length < 2) return (
        <div className="w-full flex items-center justify-center h-[200px] mt-4 opacity-30" style={{ color: theme.textDim }}>
            <span className="text-sm font-mono">not enough data to render graph</span>
        </div>
    );

    const W = 800;
    const H = 200;
    const PX = 52;
    const PY = 20;

    const maxWpm = Math.max(...data.map(d => Math.max(d.wpm, d.raw, 1)));
    const maxErrors = Math.max(...data.map(d => d.errors), 1);
    const maxSec = data[data.length - 1].second;

    const getX = (s: number) => (s / maxSec) * (W - PX * 2) + PX;
    const getY = (v: number, max: number) => H - PY - ((v / (max * 1.15)) * (H - PY * 2));

    // Smooth cubic bezier path
    const smoothPath = (pts: [number, number][]) => {
        if (pts.length < 2) return "";
        let d = `M ${pts[0][0]},${pts[0][1]}`;
        for (let i = 1; i < pts.length; i++) {
            const cpX = (pts[i - 1][0] + pts[i][0]) / 2;
            d += ` C ${cpX},${pts[i - 1][1]} ${cpX},${pts[i][1]} ${pts[i][0]},${pts[i][1]}`;
        }
        return d;
    };

    const wpmPts: [number, number][] = data.map(d => [getX(d.second), getY(d.wpm, maxWpm)]);
    const rawPts: [number, number][] = data.map(d => [getX(d.second), getY(d.raw, maxWpm)]);

    const wpmCurve = smoothPath(wpmPts);
    const rawCurve = smoothPath(rawPts);
    const wpmFill = `${wpmCurve} L ${wpmPts[wpmPts.length - 1][0]},${H - PY} L ${wpmPts[0][0]},${H - PY} Z`;
    const rawFill = `${rawCurve} L ${rawPts[rawPts.length - 1][0]},${H - PY} L ${rawPts[0][0]},${H - PY} Z`;

    // Y-axis ticks (WPM)
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map(p => ({ val: Math.round(maxWpm * p * 1.15), y: getY(maxWpm * p, maxWpm) }));

    // X-axis ticks
    const totalTicks = Math.min(maxSec, 6);
    const xTicks = Array.from({ length: totalTicks + 1 }, (_, i) => Math.round((i / totalTicks) * maxSec));

    return (
        <div className="w-full relative mt-2">
            <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full overflow-visible">
                {/* Horizontal grid + Y labels */}
                {yTicks.map((t, i) => (
                    <g key={i}>
                        <line x1={PX} y1={t.y} x2={W - PX} y2={t.y}
                            stroke={theme.textDim} strokeOpacity="0.1" strokeDasharray="4 6" />
                        <text x={PX - 10} y={t.y + 4} fill={theme.textDim} fontSize="11"
                            textAnchor="end" fontFamily="monospace" opacity="0.5">{t.val}</text>
                    </g>
                ))}

                {/* Raw fill + curve */}
                <path d={rawFill} fill={theme.textDim} fillOpacity="0.04" />
                <path d={rawCurve} fill="none" stroke={theme.textDim} strokeWidth="1.5"
                    strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round" />

                {/* WPM fill + curve */}
                <path d={wpmFill} fill={theme.primary} fillOpacity="0.12" />
                <path d={wpmCurve} fill="none" stroke={theme.primary} strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" />

                {/* WPM dots + error markers */}
                {data.map((d, i) => (
                    <g key={i}>
                        <circle cx={wpmPts[i][0]} cy={wpmPts[i][1]} r="3.5"
                            fill={theme.primary} stroke={theme.bg} strokeWidth="1.5" />
                        {d.errors > 0 && (
                            <g>
                                <circle cx={getX(d.second)} cy={H - PY + 2}
                                    r={Math.min(d.errors * 2 + 2, 7)}
                                    fill={theme.error} fillOpacity="0.75" />
                                <text x={getX(d.second)} y={H - PY + 6} fontSize="8"
                                    fill={theme.bg} textAnchor="middle" fontWeight="bold">{d.errors}</text>
                            </g>
                        )}
                    </g>
                ))}

                {/* X-axis baseline */}
                <line x1={PX} y1={H - PY} x2={W - PX} y2={H - PY}
                    stroke={theme.textDim} strokeOpacity="0.15" />
                <line x1={PX} y1={PY} x2={PX} y2={H - PY}
                    stroke={theme.textDim} strokeOpacity="0.15" />

                {/* X-axis time labels */}
                {xTicks.map((s, i) => (
                    <text key={i} x={getX(s)} y={H + 16} fill={theme.textDim} fontSize="11"
                        textAnchor="middle" fontFamily="monospace" opacity="0.45">{s}s</text>
                ))}
            </svg>

            {/* Legend */}
            <div className="flex gap-8 mt-1 justify-center text-[10px] uppercase tracking-widest font-bold opacity-50">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-[2px] rounded" style={{ backgroundColor: theme.primary }} />
                    <span style={{ color: theme.text }}>wpm</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-[2px] rounded" style={{ backgroundColor: theme.textDim }} />
                    <span style={{ color: theme.text }}>raw</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.error, opacity: 0.75 }} />
                    <span style={{ color: theme.text }}>errors</span>
                </div>
            </div>
        </div>
    );
});

// --- Word Component ---
const Word = React.memo(({
    group,
    clusters,
    clusterIndexes,
    wordUserInput,
    wordTargetText,
    charRefs,
    themeColors
}: {
    group: number[],
    clusters: string[],
    clusterIndexes: number[],
    wordUserInput: string,
    wordTargetText: string,
    charRefs: React.MutableRefObject<(HTMLSpanElement | null)[]>,
    themeColors: { text: string, textDim: string, primary: string, error: string }
}) => {
    return (
        <span className="inline-block whitespace-nowrap">
            {group.map(i => {
                const cluster = clusters[i];
                const clusterInWordStart = clusterIndexes[i] - clusterIndexes[group[0]];
                const clusterInWordEnd = clusterInWordStart + cluster.length;

                // Default: untyped — dim color
                let color = themeColors.textDim;
                let underline = false;

                if (wordUserInput.length > clusterInWordStart) {
                    const typedPart = wordUserInput.substring(clusterInWordStart, Math.min(wordUserInput.length, clusterInWordEnd));
                    const targetPart = wordTargetText.substring(clusterInWordStart, Math.min(wordTargetText.length, clusterInWordStart + typedPart.length));

                    if (typedPart === targetPart) {
                        // Correctly typed — bright text
                        color = wordUserInput.length >= clusterInWordEnd ? themeColors.text : themeColors.primary;
                    } else {
                        // Incorrectly typed — error color with underline
                        color = themeColors.error;
                        underline = true;
                    }
                }

                return (
                    <span
                        key={i}
                        ref={el => { charRefs.current[i] = el; }}
                        style={{
                            color,
                            transition: 'color 0.15s ease',
                            borderBottom: underline ? `2px solid ${themeColors.error}` : 'none',
                        }}
                    >
                        {cluster === " " ? "\u00A0" : cluster}
                    </span>
                );
            })}
        </span>
    );
});

// --- Keyboard Component ---
const Keyboard = React.memo(({
    activeKeys,
    errorKey,
    language,
    isShiftPressed,
    nextKeyData,
    activeTheme
}: {
    activeKeys: Set<string>,
    errorKey: string | null,
    language: Language,
    isShiftPressed: boolean,
    nextKeyData: { key: string | null, needsShift: boolean },
    activeTheme: typeof THEMES.codex
}) => {
    return (
        <div className="flex flex-col gap-2 origin-top mt-4">
            {KEYBOARD_ROWS.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-2">
                    {row.map((qwertyKey, charIndex) => {
                        const mapping = KHMER_KEY_MAP[qwertyKey];
                        const isLeftShift = rowIndex === 3 && charIndex === 0;
                        const isRightShift = rowIndex === 3 && charIndex === row.length - 1;

                        const isReallyPressed = activeKeys.has(qwertyKey);
                        const isShiftReallyPressed = (isLeftShift && activeKeys.has('shiftleft')) || (isRightShift && activeKeys.has('shiftright'));
                        const isPressed = isReallyPressed || (qwertyKey === "shift" && isShiftReallyPressed);

                        const isErrorPress = errorKey === qwertyKey;
                        const isShiftKey = qwertyKey === "shift";

                        const isNextTarget = nextKeyData.key === qwertyKey;

                        // Dynamic Shift Logic: If target key is on Left side, use Right Shift. If on Right side, use Left Shift.
                        const targetSide = nextKeyData.key && LEFT_SIDE_KEYS.has(nextKeyData.key) ? 'left' : 'right';
                        const suggestedShift = targetSide === 'left' ? 'right' : 'left';
                        const isSuggestedShift = (isLeftShift && suggestedShift === 'left') || (isRightShift && suggestedShift === 'right');

                        // Hint remains until the CORRECT shift is pressed
                        const needsShiftHint = nextKeyData.needsShift && !isShiftReallyPressed && isSuggestedShift;

                        const isNext = (isNextTarget && !isShiftKey) || needsShiftHint;

                        return (
                            <motion.div
                                key={`${qwertyKey}-${charIndex}`}
                                animate={{
                                    scale: isPressed ? 0.92 : 1,
                                    y: isPressed ? 2 : 0,
                                }}
                                transition={{ type: "spring", stiffness: 700, damping: 25, mass: 0.4 }}
                                className={cn(
                                    "h-11 px-3 flex items-center justify-center rounded-lg text-sm font-black relative overflow-hidden border-2 transition-all duration-100",
                                    qwertyKey === "space" ? "w-72 uppercase" : (isShiftKey ? "min-w-[80px]" : "min-w-11"),
                                    language === "khmer" ? "font-hanuman font-normal" : "uppercase"
                                )}
                                style={{
                                    backgroundColor: isPressed
                                        ? (isErrorPress ? activeTheme.error : activeTheme.primary)
                                        : (isNext ? `rgba(${activeTheme.primaryRgb}, 0.12)` : activeTheme.bgAlt),
                                    borderColor: isPressed
                                        ? (isErrorPress ? activeTheme.error : activeTheme.primary)
                                        : (isNext ? activeTheme.primary : 'rgba(255,255,255,0.06)'),
                                    color: isPressed
                                        ? activeTheme.bg
                                        : (isNext ? activeTheme.text : activeTheme.textDim),
                                    boxShadow: isPressed
                                        ? `0 0 18px ${isErrorPress ? activeTheme.error : activeTheme.primary}60`
                                        : (isNext ? `0 0 12px ${activeTheme.primary}40` : '0 3px 0 rgba(0,0,0,0.25)'),
                                }}
                            >
                                {qwertyKey !== "space" ? (
                                    language === "khmer" && mapping ? (
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            <span className={cn("absolute top-1 right-1 text-[9px] font-bold leading-none transition-opacity", isPressed ? "opacity-30" : "opacity-40")}>
                                                {mapping.shift}
                                            </span>
                                            <span className="text-lg leading-none mt-1">
                                                {mapping.base}
                                            </span>
                                        </div>
                                    ) : qwertyKey
                                ) : "space"}
                                {isNext && !isPressed && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: 'var(--mt-primary)' }} />}
                            </motion.div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
});

export default function MonkeyTypePage() {
    const {
        mode, config, language, theme, stats, chartData, timeLeft, isActive, isFinished, isWrongKeyboardLayout,
        soundEnabled, showLiveWpm, showLiveAccuracy, fontSize, fontFamily,
        setIsActive, setIsFinished, setTimeLeft, setStats, setChartData, resetLiveState, addHistory,
        setMode, setConfig, setLanguage, setTheme, setIsWrongKeyboardLayout
    } = useMonkeyTypeStore();

    const [words, setWords] = useState<string[]>([]);
    const [userInput, setUserInput] = useState("");
    const [startTime, setStartTime] = useState<number | null>(null);

    const [caretPos, setCaretPos] = useState({ top: 0, left: 0 });
    const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
    const [errorKey, setErrorKey] = useState<string | null>(null);
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    // Init Caps Lock to false (SSR-safe), then hydrate from localStorage after mount
    const [isCapsLock, setIsCapsLock] = useState(false);
    const [lineOffset, setLineOffset] = useState(0);
    const [isFocused, setIsFocused] = useState(true);
    const [xpResult, setXpResult] = useState<{ gained: number, levelUp: boolean, newAchievements?: string[] } | null>(null);
    const [ghost, setGhost] = useState<{ wpm: number, userName: string | null } | null>(null);
    const [ghostPos, setGhostPos] = useState({ top: 0, left: 0, charIndex: 0 });

    // Hydrate from localStorage after client mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem("capsLockState");
            if (stored === "true") setIsCapsLock(true);
        } catch { }
    }, []);

    // Persist Caps Lock state and detect it from mouse events on load
    useEffect(() => {
        try { localStorage.setItem("capsLockState", String(isCapsLock)); } catch { }
    }, [isCapsLock]);

    useEffect(() => {
        // Detect Caps Lock from the first pointer interaction (works before any keydown)
        const detectFromPointer = (e: MouseEvent | PointerEvent) => {
            if (e.getModifierState) {
                setIsCapsLock(e.getModifierState("CapsLock"));
            }
        };
        window.addEventListener("mousemove", detectFromPointer, { once: true });
        window.addEventListener("pointerdown", detectFromPointer, { once: true });
        return () => {
            window.removeEventListener("mousemove", detectFromPointer);
            window.removeEventListener("pointerdown", detectFromPointer);
        };
    }, []);

    const userInputRef = useRef(userInput);
    const wordsRefData = useRef(words);
    useEffect(() => { userInputRef.current = userInput; }, [userInput]);
    useEffect(() => { wordsRefData.current = words; }, [words]);

    // Refs for chart snapshot — avoid stale closures in intervals
    const statsRef = useRef(stats);
    const startTimeRef = useRef<number | null>(null);
    const chartDataRef = useRef<ChartPoint[]>([]);
    const lastErrorCountRef = useRef(0);
    useEffect(() => { statsRef.current = stats; }, [stats]);
    useEffect(() => { startTimeRef.current = startTime; }, [startTime]);

    const inputRef = useRef<HTMLInputElement>(null);
    const wordsRef = useRef<HTMLDivElement>(null);
    const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const ghostTimerRef = useRef<NodeJS.Timeout | null>(null);
    const restartRef = useRef<HTMLButtonElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [hasMounted, setHasMounted] = useState(false);
    const wasTabPressedRef = useRef(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Load theme and other persisted settings
    const activeTheme = THEMES[theme] || THEMES.codex;

    // --- Search / Command Palette Logic ---
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);

    const playClickSound = useCallback(() => {
        if (!soundEnabled) return;
        try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(150 + Math.random() * 50, audioCtx.currentTime);

            gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.05);

            setTimeout(() => audioCtx.close(), 100);
        } catch (e) { }
    }, [soundEnabled]);

    const targetText = useMemo(() => {
        return words.join(" ");
    }, [words]);

    const generateWords = useCallback((newMode?: GameMode, newConfig?: GameConfig, newLang?: Language) => {
        const targetMode = newMode || mode;
        const targetConfig = newConfig || config;
        const targetLang = newLang || language;

        const count = targetMode === "words" ? (targetConfig as number) : 300;
        const generated: string[] = [];
        const pool = targetLang === "khmer" ? KHMER_WORD_POOL : WORD_POOL;
        for (let i = 0; i < count; i++) {
            generated.push(pool[Math.floor(Math.random() * pool.length)]);
        }
        setWords(generated);
    }, [mode, config, language]);

    useEffect(() => {
        generateWords();
    }, [generateWords]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
        if (isActive && mode === "time" && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (mode === "time" && timeLeft === 0) {
            finishTest();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    // Snapshot logic for the chart — runs once on mount/isActive change,
    // reads live values via refs to avoid stale closures
    useEffect(() => {
        if (!isActive || isFinished) return;

        chartDataRef.current = [];
        lastErrorCountRef.current = 0;
        setChartData([]);

        const interval = setInterval(() => {
            const st = startTimeRef.current;
            if (!st) return;
            const elapsedSec = Math.floor((Date.now() - st) / 1000);
            if (elapsedSec <= 0) return;

            const s = statsRef.current;
            const totalErrors = s.incorrectChars + s.extraChars;
            const deltaErrors = Math.max(0, totalErrors - lastErrorCountRef.current);
            lastErrorCountRef.current = totalErrors;

            const point: ChartPoint = {
                wpm: s.wpm,
                raw: s.rawWpm,
                errors: deltaErrors,
                second: elapsedSec
            };

            chartDataRef.current = [...chartDataRef.current, point];
            setChartData([...chartDataRef.current]);
        }, 1000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, isFinished]);

    // Ghost Simulation Effect
    useEffect(() => {
        if (!isActive || !ghost || isFinished) {
            setGhostPos({ top: 0, left: 0, charIndex: 0 });
            return;
        }

        const charsPerSec = (ghost.wpm * 5) / 60;
        const interval = setInterval(() => {
            const elapsed = (Date.now() - (startTime || Date.now())) / 1000;
            const charIndex = Math.min(Math.floor(elapsed * charsPerSec), targetText.length);

            const charEl = charRefs.current[charIndex];
            if (charEl && wordsRef.current) {
                const rect = charEl.getBoundingClientRect();
                const containerRect = wordsRef.current.getBoundingClientRect();
                setGhostPos({
                    top: rect.top - containerRect.top,
                    left: rect.left - containerRect.left,
                    charIndex
                });
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isActive, ghost, isFinished, startTime, targetText.length]);

    const startTest = () => {
        setIsActive(true);
        setStartTime(Date.now());
        incrementTestsStarted(); // Track test start

        // Fetch Ghost
        getGhostRun(mode, config as number, language).then(res => {
            if (res.success && res.ghost) {
                setGhost(res.ghost);
            }
        });
    };

    const finishTest = () => {
        setIsActive(false);
        setIsFinished(true);

        const elapsedMs = Date.now() - (startTime || Date.now());
        const durationSeconds = Math.floor(elapsedMs / 1000);

        addHistory({
            wpm: stats.wpm,
            rawWpm: stats.rawWpm,
            accuracy: stats.accuracy,
            mode,
            config,
            language,
            theme,
        });

        // Save to Database
        saveTypingResult({
            wpm: stats.wpm,
            rawWpm: stats.rawWpm,
            accuracy: stats.accuracy,
            mode,
            config,
            language,
            theme,
            duration: durationSeconds,
        }).then(res => {
            if (res.success && res.xpGained) {
                setXpResult({
                    gained: res.xpGained,
                    levelUp: !!res.levelUp,
                    newAchievements: res.newAchievements
                });
            }
        });

        // Save to Global Leaderboard (Redis)
        if (stats.wpm > 0) {
            const currentMode = config.toString();
            // Save to all-time, weekly, and daily categories with the current language
            saveLeaderboardResult(stats.wpm, stats.accuracy, stats.rawWpm, "allTime", currentMode, language);
            saveLeaderboardResult(stats.wpm, stats.accuracy, stats.rawWpm, "weekly", currentMode, language);
            saveLeaderboardResult(stats.wpm, stats.accuracy, stats.rawWpm, "daily", currentMode, language);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (!isActive && !isFinished && value.length > 0) startTest();
        if (isFinished) return;

        setUserInput(value);
        playClickSound();

        // Calculate live stats
        let correct = 0;
        let incorrect = 0;
        let extra = 0;
        let missed = 0;

        for (let i = 0; i < value.length; i++) {
            if (i < targetText.length) {
                const typedChar = value[i];
                const expectedChar = targetText[i];

                if (typedChar === expectedChar) correct++;
                else incorrect++;
            } else {
                extra++;
            }
        }

        if (value.length < targetText.length && mode === "words") {
            // Only relevant for words mode completion
        }

        const elapsedMs = Date.now() - (startTime || Date.now());
        const wpm = calculateWPM(correct, elapsedMs);
        const rawWpm = calculateWPM(value.length, elapsedMs);

        setStats({
            ...stats,
            correctChars: correct,
            incorrectChars: incorrect,
            extraChars: extra,
            missedChars: missed,
            totalChars: value.length,
            wpm,
            rawWpm,
            accuracy: value.length > 0 ? Math.round((correct / (correct + incorrect + extra)) * 100) : 100,
            consistency: 80 // Placeholder for now, could be calculated from chart data variance
        });

        if (mode === "words" && value.length >= targetText.length) {
            finishTest();
            setActiveKeys(new Set());
            setErrorKey(null);
        }
    };

    const calculateWPM = (correctChars: number, timeMs: number) => {
        const minutes = timeMs / 60000;
        if (minutes <= 0) return 0;
        return Math.round((correctChars / 5) / minutes);
    };

    const resetTest = useCallback((newConfig?: GameConfig, newMode?: GameMode, newLang?: Language) => {
        const targetConfig = newConfig || config;
        const targetMode = newMode || mode;
        const targetLang = newLang || language;

        generateWords(targetMode, targetConfig, targetLang);
        setUserInput("");
        setStartTime(null);
        setActiveKeys(new Set());
        setErrorKey(null);
        setIsShiftPressed(false);
        resetLiveState(targetMode === "time" ? (targetConfig as number) : 30);
        setLineOffset(0);
        setCaretPos({ top: 0, left: 0 });
        setXpResult(null);
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [generateWords, mode, config, language, resetLiveState]);

    const commands = useMemo(() => {
        const list: { id: string, label: string, category: string, action: () => void }[] = [];

        // Modes
        list.push({ id: "mode-time", label: "Time", category: "Mode", action: () => { setMode("time"); setConfig(30); resetTest(); } });
        list.push({ id: "mode-words", label: "Words", category: "Mode", action: () => { setMode("words"); setConfig(25); resetTest(); } });

        // Durations/Word Counts
        if (mode === "time") {
            [15, 30, 60, 120].forEach(t => list.push({ id: `time-${t}`, label: `${t} Seconds`, category: "Duration", action: () => { setConfig(t as GameConfig); resetTest(); } }));
        } else {
            [10, 25, 50, 100].forEach(w => list.push({ id: `words-${w}`, label: `${w} Words`, category: "Amount", action: () => { setConfig(w as GameConfig); resetTest(); } }));
        }

        // Languages
        list.push({ id: "lang-en", label: "English", category: "Language", action: () => { setLanguage("english"); resetTest(); } });
        list.push({ id: "lang-km", label: "Khmer", category: "Language", action: () => { setLanguage("khmer"); resetTest(); } });

        // Themes
        (Object.keys(THEMES) as Theme[]).forEach(t => list.push({ id: `theme-${t}`, label: t.charAt(0).toUpperCase() + t.slice(1), category: "Theme", action: () => { setTheme(t); } }));

        // Actions
        list.push({ id: "action-restart", label: "Restart Test", category: "Action", action: () => resetTest() });

        return list;
    }, [mode, setMode, setConfig, setLanguage, setTheme, resetTest]);

    const filteredCommands = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase().trim();
        return commands.filter(c => c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    }, [commands, searchQuery]);

    useEffect(() => {
        setSelectedIndex(Math.min(selectedIndex, Math.max(0, filteredCommands.length - 1)));
    }, [selectedIndex, filteredCommands.length]);

    // Track Tab hold state for Tab+Enter restart
    const isTabHeld = useRef(false);

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (isSearchOpen) {
                if (e.key === "Escape") {
                    e.preventDefault();
                    setIsSearchOpen(false);
                } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSelectedIndex(prev => Math.max(prev - 1, 0));
                } else if (e.key === "Enter") {
                    e.preventDefault();
                    if (filteredCommands[selectedIndex]) {
                        filteredCommands[selectedIndex].action();
                        setIsSearchOpen(false);
                        setSearchQuery("");
                    }
                }
                return;
            }

            if (e.key === "Tab") {
                e.preventDefault();
                isTabHeld.current = true;
                restartRef.current?.focus();
                return;
            }

            // Tab+Enter = restart from anywhere (game or results)
            if (e.key === "Enter" && isTabHeld.current) {
                e.preventDefault();
                resetTest();
                return;
            }

            if (e.key === "Escape") {
                e.preventDefault();
                setIsSearchOpen(true);
                setSearchQuery("");
                setSelectedIndex(0);
                setTimeout(() => searchInputRef.current?.focus(), 50);
                return;
            }

            const key = e.key.toLowerCase();
            const originalKey = e.key;

            // Detect Caps Lock on every keyboard event
            if (e.getModifierState) {
                setIsCapsLock(e.getModifierState("CapsLock"));
            }

            if (language === "khmer" && !e.ctrlKey && !e.altKey && !e.metaKey && originalKey.length === 1) {
                if (/^[a-zA-Z]$/.test(originalKey)) {
                    setIsWrongKeyboardLayout(true);
                } else if (/[\u1780-\u17FF]/.test(originalKey)) {
                    setIsWrongKeyboardLayout(false);
                }
            }

            if (e.key === "Shift") {
                setIsShiftPressed(true);
                const shiftCode = e.code.toLowerCase();
                setActiveKeys(prev => {
                    const next = new Set(prev);
                    next.add(shiftCode);
                    return next;
                });
                setErrorKey(null);
            } else if (!e.ctrlKey && !e.altKey && !e.metaKey && !["Tab", "Enter", "Escape", "Backspace", "Control", "Alt", "Meta"].includes(e.key)) {
                const currentInput = userInputRef.current;
                const expectedChar = targetText[currentInput.length];
                let isIncorrect = false;

                if (expectedChar === undefined) {
                    isIncorrect = true;
                } else if (language === "english") {
                    if (originalKey.toLowerCase() !== expectedChar.toLowerCase()) isIncorrect = true;
                } else { // Khmer
                    if (originalKey !== expectedChar) {
                        isIncorrect = true;
                    }
                    // Enforce Shift for Space in Khmer
                    if (expectedChar === " " && !e.shiftKey) {
                        isIncorrect = true;
                    }
                }

                if (key === " ") {
                    setActiveKeys(prev => {
                        const next = new Set(prev);
                        next.add("space");
                        return next;
                    });
                    setErrorKey(isIncorrect ? "space" : null);
                } else {
                    let matchedQwerty = key;
                    for (const [qKey, chars] of Object.entries(KHMER_KEY_MAP)) {
                        if (originalKey === chars.base || originalKey === chars.shift) {
                            matchedQwerty = qKey;
                            break;
                        }
                    }
                    setActiveKeys(prev => {
                        const next = new Set(prev);
                        next.add(matchedQwerty);
                        return next;
                    });
                    setErrorKey(isIncorrect ? matchedQwerty : null);
                }
            }

            if (document.activeElement !== inputRef.current && !["Tab", "Enter", "Escape", "Shift", "Control", "Alt", "Meta"].includes(e.key)) {
                inputRef.current?.focus();
            }
        };

        const handleGlobalKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            const code = e.code.toLowerCase();

            if (e.key === "Shift") {
                setIsShiftPressed(false);
                setActiveKeys(prev => {
                    const next = new Set(prev);
                    next.delete('shiftleft');
                    next.delete('shiftright');
                    return next;
                });
                setErrorKey(null);
            } else {
                setActiveKeys(prev => {
                    const next = new Set(prev);
                    // Match the same logic as KeyDown to find which QWERTY key to release
                    if (e.key === " ") {
                        next.delete("space");
                    } else {
                        let matchedQwerty = key;
                        for (const [qKey, chars] of Object.entries(KHMER_KEY_MAP)) {
                            // On keyup, e.key might be the base or shift char depending on current state
                            // More robust is to use e.code for single char keys if possible,
                            // but our layout uses qKeys which are usually the key property
                            if (chars.base === e.key || chars.shift === e.key) {
                                matchedQwerty = qKey;
                                break;
                            }
                        }
                        next.delete(matchedQwerty);
                    }
                    return next;
                });
                setErrorKey(null);
            }
        };

        const handleTabKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Tab") isTabHeld.current = false;
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        window.addEventListener("keyup", handleGlobalKeyUp);
        window.addEventListener("keyup", handleTabKeyUp);
        return () => {
            window.removeEventListener("keydown", handleGlobalKeyDown);
            window.removeEventListener("keyup", handleGlobalKeyUp);
            window.removeEventListener("keyup", handleTabKeyUp);
        };
    }, [isSearchOpen, filteredCommands, selectedIndex, language, isFinished]);

    // Caret and 3-Line Shifting Logic
    // Split target text into visual grapheme clusters to avoid broken combining characters in Khmer
    const clusters = useMemo(() => {
        if (!targetText) return [];

        // Use Intl.Segmenter with a fallback/manual check for Khmer combining marks
        const segmenter = new Intl.Segmenter(language === 'khmer' ? 'km' : 'en', { granularity: 'grapheme' });
        const rawSegments = Array.from(segmenter.segment(targetText)).map(s => s.segment);

        if (language !== 'khmer') return rawSegments;

        // Manual re-clustering to ensure Khmer vowels and signs always attach to a preceding consonant
        const khmerClusters: string[] = [];
        for (const seg of rawSegments) {
            const firstChar = seg.charCodeAt(0);
            const isCombiningMark = (firstChar >= 0x17B4 && firstChar <= 0x17D3);

            if (isCombiningMark && khmerClusters.length > 0) {
                khmerClusters[khmerClusters.length - 1] += seg;
            } else if (khmerClusters.length > 0 && khmerClusters[khmerClusters.length - 1].endsWith('\u17D2')) {
                // If previous segment ended with Coeng sign, this consonant must be part of that cluster
                khmerClusters[khmerClusters.length - 1] += seg;
            } else {
                khmerClusters.push(seg);
            }
        }
        return khmerClusters;
    }, [targetText, language]);

    // Map each cluster to its starting index in the raw string so we can track exact codepoint typing
    const clusterIndexes = useMemo(() => {
        let currentIndex = 0;
        const indexes: number[] = [];
        for (const cluster of clusters) {
            indexes.push(currentIndex);
            currentIndex += cluster.length;
        }
        return indexes;
    }, [clusters]);

    // Group clusters into words for layout wrapping
    const wordGroups = useMemo(() => {
        const groups: number[][] = [];
        let currentGroup: number[] = [];

        clusters.forEach((cluster, i) => {
            currentGroup.push(i);
            if (cluster === " " || cluster === "\u00A0") {
                groups.push(currentGroup);
                currentGroup = [];
            }
        });

        if (currentGroup.length > 0) {
            groups.push(currentGroup);
        }

        return groups;
    }, [clusters]);

    useEffect(() => {
        if (userInput.length === 0) {
            if (charRefs.current[0] && wordsRef.current) {
                const charRect = charRefs.current[0].getBoundingClientRect();
                const containerRect = wordsRef.current.getBoundingClientRect();
                setCaretPos({
                    top: charRect.top - containerRect.top,
                    left: charRect.left - containerRect.left
                });
            } else {
                setCaretPos({ top: 0, left: 0 });
            }
            setLineOffset(0);
            return;
        }

        // Find the active cluster based on the user's current input length
        let activeClusterIndex = 0;
        for (let i = 0; i < clusterIndexes.length; i++) {
            if (userInput.length >= clusterIndexes[i]) {
                activeClusterIndex = i;
            } else {
                break;
            }
        }

        const activeCharElement = charRefs.current[activeClusterIndex];
        if (activeCharElement && wordsRef.current) {
            const charRect = activeCharElement.getBoundingClientRect();
            const containerRect = wordsRef.current.getBoundingClientRect();

            const lineHeightVal = language === "khmer" ? 58 : (fontSize * 1.6);
            setCaretPos({
                top: charRect.top - containerRect.top + lineOffset,
                left: charRect.left - containerRect.left
            });

            // Smart 3-line scroll logic: shift when we enter the 3rd line
            const relativeTop = charRect.top - containerRect.top + lineOffset;
            const scrollThreshold = lineHeightVal * 1.5;
            if (relativeTop > scrollThreshold) {
                setLineOffset(prev => prev - lineHeightVal);
            }
        }
    }, [userInput, words, clusters, clusterIndexes, lineOffset]);

    if (!hasMounted) {
        return (
            <div className="min-h-screen theme-transition flex flex-col items-center justify-center" style={{ backgroundColor: THEMES.codex.bg }}>
                {/* Minimal loader or skeleton while hydrating */}
                <div className="flex items-center gap-2">
                    <Type className="w-8 h-8 animate-pulse" style={{ color: THEMES.codex.primary }} />
                    <h1 className="text-[32px] tracking-tight font-bold" style={{ color: THEMES.codex.text }}>type<span style={{ color: THEMES.codex.textDim }}>flow</span></h1>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "min-h-screen min-h-[100dvh] w-full flex flex-col items-center justify-start select-none theme-transition",
                "pt-2 sm:pt-4 md:pt-8 px-[var(--content-px)]",
                language === "khmer" ? "font-sans font-medium" : "font-mono"
            )}
            onClick={() => inputRef.current?.focus()}
            style={{
                backgroundColor: activeTheme.bg,
                color: activeTheme.textDim,
                '--mt-bg': activeTheme.bg,
                '--mt-bg-alt': activeTheme.bgAlt,
                '--mt-text': activeTheme.text,
                '--mt-text-dim': activeTheme.textDim,
                '--mt-primary': activeTheme.primary,
                '--mt-error': activeTheme.error,
            } as React.CSSProperties}
        >
            {/* Header / Nav */}
            <Header activeTheme={activeTheme} />

            {/* Local Command Palette */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 backdrop-blur-sm px-4"
                        onClick={() => setIsSearchOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: -20 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col border border-white/10"
                            style={{ backgroundColor: activeTheme.bg }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center px-4 border-b border-white/5" style={{ backgroundColor: activeTheme.bgAlt }}>
                                <Search className="w-5 h-5 opacity-50" style={{ color: activeTheme.text }} />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Search commands..."
                                    className="w-full bg-transparent border-none outline-none py-4 px-3 text-lg placeholder-white/20"
                                    style={{ color: activeTheme.text }}
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setSelectedIndex(0); }}
                                />
                                <span className="text-xs opacity-50 px-2 py-1 rounded bg-black/20" style={{ color: activeTheme.textDim }}>ESC</span>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto py-2 custom-scrollbar">
                                {searchQuery.trim() === '' ? (
                                    <div className="px-6 py-10 text-center space-y-4">
                                        <div className="text-sm opacity-40" style={{ color: activeTheme.textDim }}>
                                            Type to search commands
                                        </div>
                                        <div className="flex flex-wrap gap-2 justify-center text-[10px] font-mono opacity-30" style={{ color: activeTheme.textDim }}>
                                            {['theme', 'mode', 'language', 'time', 'restart'].map(hint => (
                                                <span key={hint} className="px-2 py-1 rounded" style={{ backgroundColor: activeTheme.bgAlt }}>{hint}</span>
                                            ))}
                                        </div>
                                    </div>
                                ) : filteredCommands.length === 0 ? (
                                    <div className="px-6 py-8 text-center opacity-50" style={{ color: activeTheme.textDim }}>
                                        No commands found matching "{searchQuery}"
                                    </div>
                                ) : (
                                    filteredCommands.map((cmd, i) => (
                                        <div
                                            key={cmd.id}
                                            onClick={() => { cmd.action(); setIsSearchOpen(false); setSearchQuery(""); }}
                                            onMouseEnter={() => setSelectedIndex(i)}
                                            className={cn(
                                                "px-6 py-3 flex items-center justify-between cursor-pointer transition-colors duration-150",
                                                i === selectedIndex ? "bg-white/5" : ""
                                            )}
                                            style={{ color: i === selectedIndex ? activeTheme.primary : activeTheme.text }}
                                        >
                                            <div className="flex items-center gap-3">
                                                {cmd.category === 'Theme' && (
                                                    <div className="flex gap-1">
                                                        {(() => {
                                                            const t = THEMES[cmd.id.replace('theme-', '') as Theme];
                                                            return t ? (
                                                                <>
                                                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.bg, border: `1px solid ${t.textDim}` }} />
                                                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.primary }} />
                                                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.text }} />
                                                                </>
                                                            ) : null;
                                                        })()}
                                                    </div>
                                                )}
                                                <span className="font-semibold">{cmd.label}</span>
                                                {cmd.category === 'Theme' && theme === cmd.id.replace('theme-', '') && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: activeTheme.primary, color: activeTheme.bg }}>active</span>
                                                )}
                                            </div>
                                            <span className="text-xs px-2 py-1 rounded-full opacity-60" style={{ backgroundColor: activeTheme.bgAlt }}>
                                                {cmd.category}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isWrongKeyboardLayout && language === "khmer" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#2c2e31] p-8 rounded-2xl max-w-md w-full shadow-2xl border border-[#e2b714]/20 flex flex-col items-center gap-6"
                        >
                            <div className="w-16 h-16 rounded-full bg-[#ca4754]/10 flex items-center justify-center text-[#ca4754]">
                                <KeyboardIcon className="w-8 h-8" />
                            </div>

                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-bold text-[#d1d0c5]">Wrong Keyboard Layout Detected</h2>
                                <p className="text-sm text-[#646669]">
                                    It looks like your system keyboard is set to English, but the test is in Khmer. Please switch your system keyboard layout to Khmer (e.g., NiDA).
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 w-full mt-4">
                                <button
                                    onClick={() => {
                                        setLanguage("english");
                                        setIsWrongKeyboardLayout(false);
                                        resetTest();
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#2c2e31] hover:bg-[#323437] text-[#e2b714] border border-[#e2b714]/30 hover:border-[#e2b714] transition-all rounded-xl font-bold font-mono text-sm group"
                                >
                                    <Globe className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                                    Switch test to English
                                </button>

                                <button
                                    onClick={() => {
                                        setIsWrongKeyboardLayout(false);
                                        inputRef.current?.focus();
                                    }}
                                    className="w-full py-3 px-4 bg-[#e2b714] hover:bg-[#d1a700] text-[#323437] transition-all rounded-xl font-bold font-mono text-sm"
                                >
                                    I've switched to Khmer
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {!isFinished ? (
                    <motion.div
                        key="game"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-full max-w-[var(--content-max-w)] flex flex-col gap-4 sm:gap-6 md:gap-10 lg:gap-12"
                    >
                        {/* Mode Selector Config Bar */}
                        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 p-1 sm:p-1.5 rounded-xl self-center text-[10px] sm:text-xs font-bold shadow-2xl theme-transition" style={{ backgroundColor: 'var(--mt-bg-alt)' }}>
                            <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 border-r border-white/5">
                                <button onClick={() => { setMode("time"); setConfig(30); resetTest(30, "time"); }} className={cn("flex items-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 transition-all outline-none min-h-[36px] sm:min-h-0 cursor-pointer", mode === "time" ? "text-[var(--mt-primary)]" : "hover:text-[var(--mt-text)]")}>
                                    <Timer className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> time
                                </button>
                                <button onClick={() => { setMode("words"); setConfig(25); resetTest(25, "words"); }} className={cn("flex items-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 transition-all outline-none min-h-[36px] sm:min-h-0 cursor-pointer", mode === "words" ? "text-[var(--mt-primary)]" : "hover:text-[var(--mt-text)]")}>
                                    <Type className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> words
                                </button>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 border-r border-white/5">
                                {mode === "time" ? (
                                    [15, 30, 60, 120].map(t => (
                                        <button key={t} onClick={() => { setConfig(t as GameConfig); resetTest(t as GameConfig); }} className={cn("py-1.5 sm:py-2 transition-all outline-none min-h-[36px] sm:min-h-0 cursor-pointer", config === t ? "text-[var(--mt-primary)]" : "hover:text-[var(--mt-text)]")}>
                                            {t}
                                        </button>
                                    ))
                                ) : (
                                    [10, 25, 50, 100].map(w => (
                                        <button key={w} onClick={() => { setConfig(w as GameConfig); resetTest(w as GameConfig); }} className={cn("py-1.5 sm:py-2 transition-all outline-none min-h-[36px] sm:min-h-0 cursor-pointer", config === w ? "text-[var(--mt-primary)]" : "hover:text-[var(--mt-text)]")}>
                                            {w}
                                        </button>
                                    ))
                                )}
                            </div>

                            <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 border-r border-white/5">
                                <button onClick={() => { setLanguage("english"); resetTest(undefined, undefined, "english"); }} className={cn("py-1.5 sm:py-2 transition-all outline-none min-h-[36px] sm:min-h-0 cursor-pointer", language === "english" ? "text-[var(--mt-primary)]" : "hover:text-[var(--mt-text)]")}>
                                    english
                                </button>
                                <button onClick={() => { setLanguage("khmer"); resetTest(undefined, undefined, "khmer"); }} className={cn("py-1.5 sm:py-2 transition-all outline-none min-h-[36px] sm:min-h-0 cursor-pointer", language === "khmer" ? "text-[var(--mt-primary)]" : "hover:text-[var(--mt-text)]")}>
                                    khmer
                                </button>
                            </div>
                        </div>

                        <div className="relative w-full flex flex-col gap-4 sm:gap-6 md:gap-10 lg:gap-12">
                            {/* Inner Container (No longer blurred here) */}
                            <div className="w-full flex flex-col gap-4 sm:gap-6 md:gap-10 lg:gap-12 transition-all">
                                {/* Caps Lock Warning — like monkeytype.com */}
                                <AnimatePresence>
                                    {isCapsLock && (
                                        <motion.div
                                            key="capslock"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="flex items-center justify-center gap-2 overflow-hidden"
                                        >
                                            <div
                                                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase"
                                                style={{
                                                    color: activeTheme.error,
                                                    backgroundColor: `${activeTheme.error}15`,
                                                }}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 17v.01" />
                                                    <path d="M12 13V7" />
                                                    <circle cx="12" cy="12" r="10" />
                                                </svg>
                                                <span>caps lock</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="h-8 flex justify-center items-center gap-4">
                                    {isActive && (
                                        <>
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold transition-colors duration-500" style={{ color: activeTheme.primary }}>
                                                {mode === "time" ? timeLeft : `${userInput.split(" ").length - 1}/${config}`}
                                            </motion.div>
                                            {showLiveWpm && stats.wpm > 0 && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} className="text-xl font-bold transition-colors duration-500" style={{ color: activeTheme.text }}>
                                                    {stats.wpm} wpm
                                                </motion.div>
                                            )}
                                            {showLiveAccuracy && stats.accuracy > 0 && (
                                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} className="text-lg font-bold transition-colors duration-500" style={{ color: activeTheme.textDim }}>
                                                    {stats.accuracy}%
                                                </motion.div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* 3-Line Typing Window */}
                                <div
                                    className="relative overflow-hidden w-full px-1 sm:px-4 typing-fade-bottom transition-all"
                                    style={{
                                        height: language === "khmer" ? "174px" : `${fontSize * 1.6 * 3}px`,
                                    }}
                                >
                                    {/* Inner blurred wrapper */}
                                    <div
                                        className="w-full h-full transition-all"
                                        style={{
                                            filter: (!isFocused && !isFinished) ? 'blur(2.5px)' : 'none',
                                            opacity: (!isFocused && !isFinished) ? 0.25 : 1,
                                            transition: 'all 0.25s ease',
                                        }}
                                    >
                                        <motion.div
                                            animate={{ y: lineOffset }}
                                            transition={userInput.length === 0 ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
                                            ref={wordsRef}
                                            className="relative tracking-tight"
                                            style={{
                                                fontSize: language === "khmer" ? 'var(--khmer-font-size)' : `${fontSize}px`,
                                                lineHeight: language === "khmer" ? 'var(--khmer-line-height)' : `${fontSize * 1.6}px`,
                                                fontFamily: fontFamily === 'monospace' ? 'inherit' : fontFamily
                                            }}
                                        >
                                            {/* Smooth Caret */}
                                            <motion.div
                                                animate={{ top: caretPos.top, left: caretPos.left }}
                                                transition={userInput.length === 0 ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 35 }}
                                                className={cn(
                                                    "absolute w-[2.5px] rounded-full z-10 pointer-events-none will-change-transform",
                                                    !isActive && "caret-idle"
                                                )}
                                                style={{
                                                    backgroundColor: 'var(--mt-primary)',
                                                    height: language === "khmer" ? '34px' : `${fontSize * 1.1}px`,
                                                    marginTop: language === "khmer" ? '6px' : `${fontSize * 0.25}px`,
                                                    transition: 'all 0.1s ease',
                                                }}
                                            />

                                            {/* Ghost Caret */}
                                            {ghost && isActive && (
                                                <motion.div
                                                    animate={{ top: ghostPos.top, left: ghostPos.left }}
                                                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                                    className="absolute w-[2px] rounded-full z-[5] pointer-events-none opacity-40 flex flex-col items-center"
                                                    style={{
                                                        backgroundColor: activeTheme.text,
                                                        height: language === "khmer" ? '34px' : `${fontSize * 1.1}px`,
                                                        marginTop: language === "khmer" ? '6px' : `${fontSize * 0.25}px`,
                                                    }}
                                                >
                                                    <div className="absolute bottom-full mb-1 whitespace-nowrap text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-black/40 text-white backdrop-blur-sm border border-white/10 scale-90 origin-bottom">
                                                        {ghost.userName || "Ghost"}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Words Grid */}
                                            <div className={cn("flex flex-wrap w-full", language === "khmer" ? "font-hanuman" : "")}>
                                                {wordGroups.map((group, groupIdx) => {
                                                    const wordStart = clusterIndexes[group[0]];
                                                    const wordEnd = clusterIndexes[group[group.length - 1]] + clusters[group[group.length - 1]].length;

                                                    // Only pass the relevant slice of userInput to the Word component.
                                                    // This ensures only the word currently being typed re-renders.
                                                    const wordUserInput = userInput.substring(wordStart, Math.min(userInput.length, wordEnd));
                                                    const wordTargetText = targetText.substring(wordStart, wordEnd);

                                                    return (
                                                        <Word
                                                            key={groupIdx}
                                                            group={group}
                                                            clusters={clusters}
                                                            clusterIndexes={clusterIndexes}
                                                            wordUserInput={wordUserInput}
                                                            wordTargetText={wordTargetText}
                                                            charRefs={charRefs}
                                                            themeColors={activeTheme}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </motion.div>

                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={userInput}
                                            onChange={handleInputChange}
                                            onFocus={() => {
                                                setIsFocused(true);
                                                wasTabPressedRef.current = false;
                                            }}
                                            onBlur={() => {
                                                setIsFocused(false);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Tab") {
                                                    wasTabPressedRef.current = true;
                                                }
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 outline-none cursor-default"
                                            autoFocus
                                            spellCheck={false}
                                            autoComplete="off"
                                        />
                                    </div>

                                    {/* Focus-lost overlay — now INSIDE the typing window for clipping */}
                                    <AnimatePresence>
                                        {!isFocused && !isFinished && !wasTabPressedRef.current && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="absolute inset-0 z-20 flex items-center justify-center cursor-pointer rounded-lg"
                                                onClick={() => inputRef.current?.focus()}
                                            >
                                                <div className="flex items-center gap-3 text-base font-normal tracking-normal" style={{ color: activeTheme.text }}>
                                                    <svg width="14" height="14" viewBox="0 0 512 512" fill="currentColor">
                                                        <path d="M302.189 329.126l16.297-39.757 141.6 141.6c11.31 11.31 11.31 29.65 0 40.96a28.84 28.84 0 01-20.48 8.48c-7.394 0-14.788-2.827-20.48-8.48L277.53 330.334l-39.757 16.297L134.453 0z" />
                                                    </svg>
                                                    Click here or press any key to focus
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Keyboard — Desktop only */}
                                <div className="hidden md:block">
                                    {(() => {
                                        // Always show next key to press, updating as the user types
                                        const remainingTarget = targetText.slice(userInput.length);
                                        let nextKey: string | null = null;
                                        let needsShift = false;

                                        if (remainingTarget) {
                                            if (language === "khmer") {
                                                if (remainingTarget.startsWith(" ")) {
                                                    nextKey = "space";
                                                    needsShift = true;
                                                } else {
                                                    for (const [qKey, m] of Object.entries(KHMER_KEY_MAP)) {
                                                        if (remainingTarget.startsWith(m.base)) {
                                                            nextKey = qKey;
                                                            needsShift = false;
                                                            break;
                                                        }
                                                        if (remainingTarget.startsWith(m.shift)) {
                                                            nextKey = qKey;
                                                            needsShift = true;
                                                            break;
                                                        }
                                                    }
                                                }
                                            } else {
                                                const char = remainingTarget[0];
                                                if (char === " ") {
                                                    nextKey = "space";
                                                } else if (char) {
                                                    const baseKey = ENGLISH_BASE_MAP[char] || char.toLowerCase();
                                                    for (const row of KEYBOARD_ROWS) {
                                                        if (row.includes(baseKey)) {
                                                            nextKey = baseKey;
                                                            break;
                                                        }
                                                    }
                                                    needsShift = /[A-Z!@#$%^&*()_+{}|:"<>?]/.test(char);
                                                }
                                            }
                                        }

                                        return (
                                            <Keyboard
                                                activeKeys={activeKeys}
                                                errorKey={errorKey}
                                                language={language}
                                                isShiftPressed={isShiftPressed}
                                                nextKeyData={{ key: nextKey, needsShift }}
                                                activeTheme={activeTheme}
                                            />
                                        );
                                    })()}
                                </div>


                                <div className="flex flex-col items-center gap-3 sm:gap-6 mt-2 sm:mt-4">
                                    <div className="hidden sm:flex text-xs font-bold tracking-[0.2em] uppercase gap-8" style={{ color: activeTheme.textDim }}>
                                        <span><span className="text-[var(--mt-primary)] font-bold px-1.5 py-0.5 rounded mr-1" style={{ backgroundColor: 'var(--mt-bg-alt)' }}>Tab</span> + <span className="text-[var(--mt-primary)] font-bold px-1.5 py-0.5 rounded ml-1" style={{ backgroundColor: 'var(--mt-bg-alt)' }}>Enter</span> Restart</span>
                                        <span><span className="text-[var(--mt-primary)] font-bold px-1.5 py-0.5 rounded mr-1" style={{ backgroundColor: 'var(--mt-bg-alt)' }}>Esc</span> Quick Reset</span>
                                    </div>

                                    <button
                                        ref={restartRef}
                                        onClick={() => resetTest()}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); resetTest(); } }}
                                        className="p-5 rounded-full transition-all transform hover:rotate-180 duration-500 focus:outline-none"
                                        style={{
                                            color: 'var(--mt-text-dim)'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--mt-text)'; e.currentTarget.style.backgroundColor = 'var(--mt-bg-alt)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--mt-text-dim)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        onFocus={(e) => { e.currentTarget.style.color = 'var(--mt-primary)'; e.currentTarget.style.backgroundColor = 'var(--mt-bg-alt)'; }}
                                        onBlur={(e) => { e.currentTarget.style.color = 'var(--mt-text-dim)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        <RotateCcw className="w-8 h-8" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="w-full max-w-[var(--content-max-w)] flex flex-col py-4 sm:py-6 gap-0 justify-between"
                        style={{ minHeight: 'calc(100dvh - 80px)' } as React.CSSProperties}
                    >
                        {/* Main 2-Column Layout */}
                        <div className="flex flex-col md:flex-row w-full gap-4 md:gap-8 flex-1 min-h-0">

                            {/* LEFT — WPM, Acc + Stats */}
                            <div className="flex flex-col justify-between w-full md:w-[300px] md:shrink-0 md:border-r md:pr-8" style={{ borderColor: `${activeTheme.textDim}15` }}>
                                {/* WPM */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1, duration: 0.4 }}
                                    className="flex flex-col"
                                >
                                    <span className="text-xs font-bold uppercase tracking-[0.2em] mb-1 opacity-60" style={{ color: activeTheme.textDim }}>wpm</span>
                                    <span className="text-[56px] sm:text-[80px] font-black leading-none tracking-tighter" style={{ color: activeTheme.primary }}>{stats.wpm}</span>
                                    {(() => {
                                        const { history } = useMonkeyTypeStore.getState();
                                        const prevBest = history
                                            .filter(h => h.mode === mode && h.config === config && h.language === language)
                                            .slice(1)
                                            .reduce((max, h) => Math.max(max, h.wpm), 0);
                                        if (prevBest > 0 && stats.wpm > prevBest) {
                                            return (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: 0.5 }}
                                                    className="flex items-center gap-1.5 mt-2 text-xs font-bold px-2.5 py-1 rounded-full w-fit"
                                                    style={{ backgroundColor: `${activeTheme.primary}20`, color: activeTheme.primary }}
                                                >
                                                    🏆 New Personal Best!
                                                </motion.div>
                                            );
                                        }
                                        return null;
                                    })()}

                                    {/* XP Gained */}
                                    <AnimatePresence>
                                        {xpResult && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex flex-col gap-1 mt-4"
                                            >
                                                <div className="flex items-center gap-2 text-sm font-bold" style={{ color: activeTheme.primary }}>
                                                    <Zap size={14} fill="currentColor" />
                                                    +{xpResult.gained} XP
                                                </div>
                                                {xpResult.levelUp && (
                                                    <motion.div
                                                        initial={{ scale: 0.9 }}
                                                        animate={{ scale: [1, 1.1, 1] }}
                                                        className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/10 w-fit"
                                                        style={{ color: activeTheme.primary }}
                                                    >
                                                        Level Up! 🚀
                                                    </motion.div>
                                                )}
                                                {xpResult.newAchievements && xpResult.newAchievements.length > 0 && (
                                                    <div className="flex flex-col gap-2 mt-2">
                                                        {xpResult.newAchievements.map(id => {
                                                            const ach = ACHIEVEMENTS[id];
                                                            if (!ach) return null;
                                                            return (
                                                                <motion.div
                                                                    key={id}
                                                                    initial={{ x: -20, opacity: 0 }}
                                                                    animate={{ x: 0, opacity: 1 }}
                                                                    className="flex items-center gap-2 p-2 rounded-xl border border-white/5 bg-white/5"
                                                                >
                                                                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${ach.color}20`, color: ach.color }}>
                                                                        <ach.icon size={14} />
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: activeTheme.text }}>Achievement Unlocked!</span>
                                                                        <span className="text-[10px] font-bold opacity-60" style={{ color: ach.color }}>{ach.name}</span>
                                                                    </div>
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>

                                {/* Accuracy with ring */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2, duration: 0.4 }}
                                    className="flex items-center gap-4 mt-3 sm:mt-4"
                                >
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                            <circle cx="18" cy="18" r="15.5" fill="none" stroke={`${activeTheme.textDim}20`} strokeWidth="3" />
                                            <motion.circle
                                                cx="18" cy="18" r="15.5" fill="none"
                                                stroke={stats.accuracy >= 95 ? activeTheme.primary : stats.accuracy >= 80 ? activeTheme.text : activeTheme.error}
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeDasharray={`${stats.accuracy * 0.9738} 97.38`}
                                                initial={{ strokeDasharray: "0 97.38" }}
                                                animate={{ strokeDasharray: `${stats.accuracy * 0.9738} 97.38` }}
                                                transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-base sm:text-lg font-black" style={{ color: activeTheme.text }}>{stats.accuracy}%</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40" style={{ color: activeTheme.textDim }}>accuracy</span>
                                        <span className="text-[10px] mt-1 opacity-50" style={{ color: activeTheme.textDim }}>
                                            {stats.accuracy >= 95 ? "Excellent" : stats.accuracy >= 85 ? "Good" : stats.accuracy >= 70 ? "Average" : "Needs work"}
                                        </span>
                                    </div>
                                </motion.div>

                                {/* Divider */}
                                <div className="my-3 sm:my-5 border-t" style={{ borderColor: `${activeTheme.textDim}15` }} />

                                {/* Character Breakdown — visual */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3, duration: 0.4 }}
                                    className="flex flex-col gap-2"
                                >
                                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-35" style={{ color: activeTheme.textDim }}>characters</span>
                                    <div className="flex gap-3 flex-wrap">
                                        {[
                                            { label: "correct", value: stats.correctChars, color: activeTheme.primary },
                                            { label: "incorrect", value: stats.incorrectChars, color: activeTheme.error },
                                            { label: "extra", value: stats.extraChars, color: `${activeTheme.error}80` },
                                            { label: "missed", value: stats.missedChars, color: activeTheme.textDim },
                                        ].map((c, i) => (
                                            <motion.div
                                                key={c.label}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 + i * 0.08 }}
                                                className="flex flex-col items-center px-3 py-2 rounded-lg"
                                                style={{ backgroundColor: `${c.color}12` }}
                                            >
                                                <span className="text-lg font-black leading-none" style={{ color: c.color }}>{c.value}</span>
                                                <span className="text-[8px] font-bold uppercase tracking-wider mt-1 opacity-60" style={{ color: c.color }}>{c.label}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Secondary Stats */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4, duration: 0.4 }}
                                    className="flex flex-row md:flex-col gap-3 sm:gap-4 flex-1 flex-wrap mt-3"
                                >
                                    {[
                                        { label: "test type", value: `${mode} ${config}`, sub: language, primary: true },
                                        { label: "raw wpm", value: String(stats.rawWpm), primary: true },
                                        { label: "consistency", value: `${stats.consistency}%`, primary: false },
                                        { label: "time", value: `${chartData.length > 0 ? chartData[chartData.length - 1].second : 0}s`, primary: false },
                                    ].map((s, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 + i * 0.06 }}
                                            className="flex flex-col"
                                        >
                                            <span className="text-[9px] font-bold uppercase tracking-widest opacity-35 mb-0.5" style={{ color: activeTheme.textDim }}>{s.label}</span>
                                            <span className="text-xl font-black leading-tight tracking-tighter" style={{ color: s.primary ? activeTheme.primary : activeTheme.text }}>
                                                {s.value}
                                            </span>
                                            {s.sub && <span className="text-[10px] opacity-35 mt-0.5" style={{ color: activeTheme.textDim }}>{s.sub}</span>}
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>

                            {/* RIGHT — Graph */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="flex-1 flex flex-col min-w-0 pt-2"
                            >
                                <PerformanceChart data={chartData} theme={activeTheme} />
                            </motion.div>
                        </div>

                        {/* Bottom — Restart hint + button */}
                        <div className="flex items-center justify-center gap-4 sm:gap-6 pt-4 border-t" style={{ borderColor: `${activeTheme.textDim}15` }}>
                            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono opacity-30" style={{ color: activeTheme.textDim }}>
                                <span className="px-2 py-0.5 rounded" style={{ backgroundColor: activeTheme.bgAlt, color: activeTheme.primary }}>tab</span>
                                <span>+</span>
                                <span className="px-2 py-0.5 rounded" style={{ backgroundColor: activeTheme.bgAlt, color: activeTheme.primary }}>enter</span>
                                <span>to restart</span>
                            </div>

                            <motion.button
                                ref={restartRef}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => resetTest()}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); resetTest(); } }}
                                className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-sm tracking-widest uppercase transition-all focus:outline-none"
                                style={{ backgroundColor: activeTheme.bgAlt, color: activeTheme.textDim }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = activeTheme.text; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = activeTheme.textDim; }}
                                onFocus={(e) => { e.currentTarget.style.color = activeTheme.primary; e.currentTarget.style.outline = `2px solid ${activeTheme.primary}`; }}
                                onBlur={(e) => { e.currentTarget.style.color = activeTheme.textDim; e.currentTarget.style.outline = 'none'; }}
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                next test
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence >


            <div className="fixed bottom-3 sm:bottom-6 right-3 sm:right-6 text-[8px] sm:text-[10px] font-bold tracking-[0.3em] uppercase opacity-20 pointer-events-none" style={{ color: activeTheme.textDim }}>
                TypeFlow 1.0
            </div>
        </div >
    );
}
