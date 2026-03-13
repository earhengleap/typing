"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { RotateCcw, Timer, Keyboard as KeyboardIcon, Type, Globe, Zap, MousePointer2, Lock, Search, Music, Volume2, VolumeX, Bell, Check, Palette, Star, Terminal, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMonkeyTypeStore, GameMode, GameConfig, Language, Theme, ChartPoint } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import { incrementTestsStarted, getGhostRun, saveTypingResult } from "@/app/actions/typing-results";
import { ACHIEVEMENTS } from "@/constants/achievements";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
    "ប្រទេស", "ទីក្រុង", "ភូមិ", "ផ្លូវ", "ទីផ្សារ", "វត្ត", "សាលារៀន", "មន្ទីរពេទ្យ", "ស្ពាន", "រោងចក្រ",
    "សិស្ស", "គ្រូ", "សៀវភៅ", "ប៊ិច", "ខ្មៅដៃ", "តុ", "កៅអី", "ក្តារខៀន", "ថ្នាក់", "វិទ្យាល័យ",
    "សាកលវិទ្យាល័យ", "ចំណេះដឹង", "បទពិសោធន៍", "ជោគជ័យ", "សុភមង្គល", "សន្តិភាព", "សេរីភាព", "យុត្តិធម៌", "សីលធម៌", "វប្បធម៌",
    "ប្រពៃណី", "ជាតិ", "សាសនា", "ព្រះមហាក្សត្រ", "ប្រវត្តិសាស្ត្រ", "អនាគត", "ពិភពលោក", "ធម្មជាតិ", "បរិស្ថាន", "កីឡា",
    "តន្ត្រី", "សិល្បៈ", "ភាពយន្ត", "ទេសចរណ៍", "អាហារ", "សុខភាព", "កម្លាំង", "ចិត្ត", "គំនិត", "ក្តីស្រមៃ"
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
interface ThemeColors {
    bg: string;
    bgAlt: string;
    text: string;
    textDim: string;
    primary: string;
    error: string;
    primaryRgb: string;
}

// --- Performance Chart Component ---
const PerformanceChart = React.memo(({ data, activeTheme }: { data: ChartPoint[], activeTheme: ThemeColors }) => {
    if (data.length < 2) return (
        <div className="w-full flex items-center justify-center h-[200px] mt-4 opacity-30" style={{ color: activeTheme.textDim }}>
            <span className="text-sm font-mono">not enough data to render graph</span>
        </div>
    );

    const W = 800;
    const H = 200;
    const PX = 52;
    const PY = 20;

    const maxWpm = Math.max(...data.map(d => Math.max(d.wpm, d.raw, 1)));
    // const maxErrors = Math.max(...data.map(d => d.errors), 1); // Unused
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
        <div className="w-full relative mt-2 md:mt-4 aspect-[2/1] md:aspect-auto">
            <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full h-full overflow-visible" preserveAspectRatio="xMidYMid meet">
                {/* Horizontal grid + Y labels */}
                {yTicks.map((t, i) => (
                    <g key={i}>
                        <line x1={PX} y1={t.y} x2={W - PX} y2={t.y}
                            stroke={activeTheme.textDim} strokeOpacity="0.1" strokeDasharray="4 6" />
                        <text x={PX - 10} y={t.y + 4} fill={activeTheme.textDim} fontSize="11"
                            textAnchor="end" fontFamily="monospace" opacity="0.5">{t.val}</text>
                    </g>
                ))}

                {/* Raw fill + curve */}
                <path d={rawFill} fill={activeTheme.textDim} fillOpacity="0.04" />
                <path d={rawCurve} fill="none" stroke={activeTheme.textDim} strokeWidth="1.5"
                    strokeOpacity="0.3" strokeLinecap="round" strokeLinejoin="round" />

                {/* WPM fill + curve */}
                <path d={wpmFill} fill={activeTheme.primary} fillOpacity="0.12" />
                <path d={wpmCurve} fill="none" stroke={activeTheme.primary} strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" />

                {/* WPM dots + error markers */}
                {data.map((d, i) => (
                    <g key={i}>
                        <circle cx={wpmPts[i][0]} cy={wpmPts[i][1]} r="3.5"
                            fill={activeTheme.primary} stroke={activeTheme.bg} strokeWidth="1.5" />
                        {d.errors > 0 && (
                            <g>
                                <circle cx={getX(d.second)} cy={H - PY + 2}
                                    r={Math.min(d.errors * 2 + 2, 7)}
                                    fill={activeTheme.error} fillOpacity="0.75" />
                                <text x={getX(d.second)} y={H - PY + 6} fontSize="8"
                                    fill={activeTheme.bg} textAnchor="middle" fontWeight="bold">{d.errors}</text>
                            </g>
                        )}
                    </g>
                ))}

                {/* X-axis baseline */}
                <line x1={PX} y1={H - PY} x2={W - PX} y2={H - PY}
                    stroke={activeTheme.textDim} strokeOpacity="0.1" />
                <line x1={PX} y1={PY} x2={PX} y2={H - PY}
                    stroke={activeTheme.textDim} strokeOpacity="0.15" />

                {/* X-axis time labels */}
                {xTicks.map((s, i) => (
                    <text key={i} x={getX(s)} y={H + 16} fill={activeTheme.textDim} fontSize="11"
                        textAnchor="middle" fontFamily="monospace" opacity="0.45">{s}s</text>
                ))}
            </svg>

            {/* Legend */}
            <div className="flex gap-8 mt-1 justify-center text-[10px] uppercase tracking-widest font-bold opacity-50">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-[2px] rounded" style={{ backgroundColor: activeTheme.primary }} />
                    <span style={{ color: activeTheme.text }}>wpm</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-[2px] rounded" style={{ backgroundColor: activeTheme.textDim }} />
                    <span style={{ color: activeTheme.text }}>raw</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeTheme.error, opacity: 0.75 }} />
                    <span style={{ color: activeTheme.text }}>errors</span>
                </div>
            </div>
        </div>
    );
});
PerformanceChart.displayName = "PerformanceChart";

// --- KBD Component ---
const Kbd = ({ children, activeTheme }: { children: React.ReactNode, activeTheme: ThemeColors }) => (
    <span
        className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-md font-mono font-bold text-[10px] min-w-[20px] transition-all"
        style={{
            backgroundColor: activeTheme.bgAlt,
            color: activeTheme.primary,
            borderBottom: `2px solid ${activeTheme.textDim}30`,
            boxShadow: `0 1px 0 ${activeTheme.bg}`
        }}
    >
        {children}
    </span>
);

const ShortcutHint = ({ keys, label, activeTheme, splitIndex }: { keys: string[], label: string, activeTheme: ThemeColors, splitIndex?: number }) => (
    <div className="flex items-center gap-2 group cursor-default">
        <div className="flex items-center gap-1">
            {keys.map((key, i) => (
                <React.Fragment key={i}>
                    <Kbd activeTheme={activeTheme}>{key}</Kbd>
                    {i < keys.length - 1 && (
                        <span className="text-[10px] uppercase font-black opacity-20 px-0.5">
                            {i === splitIndex ? "or" : "+"}
                        </span>
                    )}
                </React.Fragment>
            ))}
        </div>
        <span className="text-[10px] uppercase tracking-[0.1em] font-black opacity-30 group-hover:opacity-60 transition-opacity">
            {label}
        </span>
    </div>
);

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
    themeColors: ThemeColors
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
Word.displayName = "Word";

// --- Keyboard Component ---
const Keyboard = React.memo(({
    activeKeys,
    errorKey,
    language,
    nextKeyData,
    activeTheme
}: {
    activeKeys: Set<string>,
    errorKey: string | null,
    language: Language,
    nextKeyData: { key: string | null, needsShift: boolean },
    activeTheme: typeof THEMES.codex
}) => {
    return (
        <div className="hidden md:flex flex-col gap-2 origin-top mt-4">
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
Keyboard.displayName = "Keyboard";

export default function MonkeyTypePage() {
    const {
        mode, config, language, theme, stats, chartData, timeLeft, isActive, isFinished, isWrongKeyboardLayout,
        soundEnabled, showLiveWpm, showLiveAccuracy, fontSize, fontFamily, soundType, soundVolume, soundOnError, playTimeWarning, favoriteThemes,
        setIsActive, setIsFinished, setTimeLeft, setStats, setChartData, resetLiveState, addHistory,
        setMode, setConfig, setLanguage, setTheme, setIsWrongKeyboardLayout, setSettings, toggleFavoriteTheme,
        isSearchOpen, setIsSearchOpen, searchQuery, setSearchQuery, selectedIndex, setSelectedIndex, activeCommandGroup, setActiveCommandGroup
    } = useMonkeyTypeStore();

    // -- Advance Sound System --
    const playClickSound = useCallback((forceType?: string, isPreview: boolean = false, overrideVolume?: number) => {
        if (!soundEnabled && !isPreview) return;
        const type = forceType || soundType;

        try {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
            const audioCtx = new AudioContextClass();
            const masterGain = audioCtx.createGain();
            masterGain.connect(audioCtx.destination);
            
            // Use overrideVolume if provided, otherwise use global soundVolume
            const effectiveVolume = overrideVolume !== undefined ? overrideVolume : soundVolume;
            masterGain.gain.setValueAtTime(effectiveVolume * 0.2, audioCtx.currentTime); // Scaled volume

            const now = audioCtx.currentTime;

            const playMechanical = (freq: number, decay: number, noiseAmt: number = 0.5) => {
                const osc = audioCtx.createOscillator();
                const noise = audioCtx.createBufferSource();
                const bufferSize = audioCtx.sampleRate * 0.05;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                noise.buffer = buffer;

                const filter = audioCtx.createBiquadFilter();
                filter.type = 'highpass';
                filter.frequency.value = 1000;

                const noiseGain = audioCtx.createGain();
                noiseGain.gain.setValueAtTime(noiseAmt, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);
                const oscGain = audioCtx.createGain();
                oscGain.gain.setValueAtTime(0.1, now);
                oscGain.gain.exponentialRampToValueAtTime(0.001, now + decay);

                noise.connect(filter);
                filter.connect(noiseGain);
                noiseGain.connect(masterGain);
                osc.connect(oscGain);
                oscGain.connect(masterGain);

                osc.start(now);
                osc.stop(now + decay);
                noise.start(now);
                noise.stop(now + 0.05);
            };

            switch (type) {
                case 'cherry_blue': playMechanical(1200, 0.05, 0.8); break;
                case 'cherry_brown': playMechanical(400, 0.08, 0.3); break;
                case 'cherry_red': playMechanical(200, 0.1, 0.1); break;
                case 'mechanical': playMechanical(300 + Math.random() * 50, 0.05); break;
                case 'plastic': {
                    const osc = audioCtx.createOscillator();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(150, now);
                    const g = audioCtx.createGain();
                    g.gain.setValueAtTime(0.05, now);
                    g.gain.linearRampToValueAtTime(0, now + 0.03);
                    osc.connect(g);
                    g.connect(masterGain);
                    osc.start(); osc.stop(now + 0.03);
                    break;
                }
                case 'wood': {
                    const osc = audioCtx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(120, now);
                    const g = audioCtx.createGain();
                    g.gain.setValueAtTime(0.2, now);
                    g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                    osc.connect(g);
                    g.connect(masterGain);
                    osc.start(); osc.stop(now + 0.1);
                    break;
                }
                case 'metal': {
                    const osc = audioCtx.createOscillator();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(2500, now);
                    const g = audioCtx.createGain();
                    g.gain.setValueAtTime(0.02, now);
                    g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                    osc.connect(g);
                    g.connect(masterGain);
                    osc.start(); osc.stop(now + 0.2);
                    break;
                }
                case 'bubble': {
                    const osc = audioCtx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(800, now);
                    osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
                    const g = audioCtx.createGain();
                    g.gain.setValueAtTime(0.1, now);
                    g.gain.linearRampToValueAtTime(0, now + 0.05);
                    osc.connect(g);
                    g.connect(masterGain);
                    osc.start(); osc.stop(now + 0.05);
                    break;
                }
                case 'typewriter': {
                    playMechanical(1500, 0.02, 0.9);
                    const bell = audioCtx.createOscillator();
                    bell.type = 'sine';
                    bell.frequency.setValueAtTime(3000, now);
                    const bg = audioCtx.createGain();
                    bg.gain.setValueAtTime(0.05, now);
                    bg.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
                    bell.connect(bg);
                    bg.connect(masterGain);
                    bell.start(); bell.stop(now + 0.1);
                    break;
                }
                case 'water': {
                    const osc = audioCtx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);
                    const g = audioCtx.createGain();
                    g.gain.setValueAtTime(0.1, now);
                    g.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
                    osc.connect(g);
                    g.connect(masterGain);
                    osc.start(); osc.stop(now + 0.15);
                    break;
                }
                case 'paper': {
                    const noise = audioCtx.createBufferSource();
                    const bSize = audioCtx.sampleRate * 0.1;
                    const b = audioCtx.createBuffer(1, bSize, audioCtx.sampleRate);
                    const d = b.getChannelData(0);
                    for (let i = 0; i < bSize; i++) d[i] = Math.random() * 2 - 1;
                    noise.buffer = b;
                    const g = audioCtx.createGain();
                    g.gain.setValueAtTime(0.05, now);
                    g.gain.linearRampToValueAtTime(0, now + 0.08);
                    noise.connect(g);
                    g.connect(masterGain);
                    noise.start(); noise.stop(now + 0.08);
                    break;
                }
                case 'stone': playMechanical(80, 0.15, 0.4); break;
                case 'glass': {
                    const osc = audioCtx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(4000, now);
                    const g = audioCtx.createGain();
                    g.gain.setValueAtTime(0.03, now);
                    g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                    osc.connect(g);
                    g.connect(masterGain);
                    osc.start(); osc.stop(now + 0.05);
                    break;
                }
                case 'bamboo': {
                    const osc = audioCtx.createOscillator();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(1200, now);
                    const g = audioCtx.createGain();
                    g.gain.setValueAtTime(0.1, now);
                    g.gain.linearRampToValueAtTime(0, now + 0.02);
                    osc.connect(g);
                    g.connect(masterGain);
                    osc.start(); osc.stop(now + 0.02);
                    break;
                }
                case 'space': {
                    const osc = audioCtx.createOscillator();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(200, now);
                    osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
                    const g = audioCtx.createGain();
                    g.gain.setValueAtTime(0.03, now);
                    g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                    osc.connect(g);
                    g.connect(masterGain);
                    osc.start(); osc.stop(now + 0.2);
                    break;
                }
                case 'beep': {
                    const osc = audioCtx.createOscillator();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(880, now);
                    const g = audioCtx.createGain();
                    g.gain.setValueAtTime(0.02, now);
                    g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                    osc.connect(g);
                    g.connect(masterGain);
                    osc.start(); osc.stop(now + 0.1);
                    break;
                }
                case 'snap': {
                    const osc = audioCtx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(2000, now);
                    const g = audioCtx.createGain();
                    g.gain.setValueAtTime(0.1, now);
                    g.gain.linearRampToValueAtTime(0, now + 0.01);
                    osc.connect(g);
                    g.connect(masterGain);
                    osc.start(); osc.stop(now + 0.01);
                    break;
                }
                case 'pop': {
                    const osc = audioCtx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(100, now);
                    osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
                    const g = audioCtx.createGain();
                    g.gain.setValueAtTime(0.1, now);
                    g.gain.linearRampToValueAtTime(0, now + 0.05);
                    osc.connect(g);
                    g.connect(masterGain);
                    osc.start(); osc.stop(now + 0.05);
                    break;
                }
                case 'tink': {
                    const osc = audioCtx.createOscillator();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(3200, now);
                    const g = audioCtx.createGain();
                    g.gain.setValueAtTime(0.05, now);
                    g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
                    osc.connect(g);
                    g.connect(masterGain);
                    osc.start(); osc.stop(now + 0.05);
                    break;
                }
                case 'clack': playMechanical(200, 0.03, 0.9); break;
                case 'thud': playMechanical(60, 0.2, 0.2); break;
                default:
                    playMechanical(300 + Math.random() * 50, 0.05);
            }

            setTimeout(() => audioCtx.close(), 500);
        } catch (err) {
            console.error("Audio error:", err);
        }
    }, [soundEnabled, soundType, soundVolume]);

    const playErrorSound = useCallback((forceType?: string | boolean, isPreview: boolean = false) => {
        const errorSoundConfig = forceType !== undefined ? forceType : soundOnError;
        if (errorSoundConfig === 'off' || errorSoundConfig === false) return; // 'off' or false

        try {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
            const audioCtx = new AudioContextClass();
            const g = audioCtx.createGain();
            g.connect(audioCtx.destination);
            g.gain.setValueAtTime(soundVolume * 0.1, audioCtx.currentTime);
            const now = audioCtx.currentTime;

            // Synthesis definitions for different error types
            if (errorSoundConfig === 'damage') {
                // Short, sharp noise burst
                const noise = audioCtx.createBufferSource();
                const bufferSize = audioCtx.sampleRate * 0.1;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                noise.buffer = buffer;
                
                const bandpass = audioCtx.createBiquadFilter();
                bandpass.type = 'bandpass';
                bandpass.frequency.value = 1000;
                
                const eg = audioCtx.createGain();
                eg.gain.setValueAtTime(0.5, now);
                eg.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                
                noise.connect(bandpass);
                bandpass.connect(eg);
                eg.connect(g);
                noise.start(now);
                noise.stop(now + 0.1);

            } else if (errorSoundConfig === 'triangle') {
                // Descending triangle wave (retro error)
                const osc = audioCtx.createOscillator();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
                
                const eg = audioCtx.createGain();
                eg.gain.setValueAtTime(0.3, now);
                eg.gain.linearRampToValueAtTime(0, now + 0.2);
                
                osc.connect(eg);
                eg.connect(g);
                osc.start(now);
                osc.stop(now + 0.2);

            } else if (errorSoundConfig === 'square') {
                // Harsh short square beep
                const osc = audioCtx.createOscillator();
                osc.type = 'square';
                osc.frequency.setValueAtTime(150, now);
                
                const eg = audioCtx.createGain();
                eg.gain.setValueAtTime(0.2, now);
                eg.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                
                osc.connect(eg);
                eg.connect(g);
                osc.start(now);
                osc.stop(now + 0.1);

            } else if (errorSoundConfig === 'punch_miss') {
                // Quick whoosh noise burst with low-pass filter
                const noise = audioCtx.createBufferSource();
                const bufferSize = audioCtx.sampleRate * 0.15;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                noise.buffer = buffer;
                
                const lowpass = audioCtx.createBiquadFilter();
                lowpass.type = 'lowpass';
                lowpass.frequency.setValueAtTime(800, now);
                lowpass.frequency.linearRampToValueAtTime(100, now + 0.15);
                
                const eg = audioCtx.createGain();
                eg.gain.setValueAtTime(0.4, now);
                eg.gain.linearRampToValueAtTime(0, now + 0.15);
                
                noise.connect(lowpass);
                lowpass.connect(eg);
                eg.connect(g);
                noise.start(now);
                noise.stop(now + 0.15);

            } else {
                // Default fallback beep (legacy)
                const osc = audioCtx.createOscillator();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.linearRampToValueAtTime(50, now + 0.1);
                
                const eg = audioCtx.createGain();
                eg.gain.setValueAtTime(0.1, now);
                eg.gain.linearRampToValueAtTime(0, now + 0.1);
                
                osc.connect(eg);
                eg.connect(g);
                osc.start(now);
                osc.stop(now + 0.1);
            }

            setTimeout(() => audioCtx.close(), 300);
        } catch { }
    }, [soundOnError, soundVolume]);

    const playWarningSound = useCallback((isPreview: boolean = false) => {
        if (!playTimeWarning && !isPreview) return;
        if (playTimeWarning === 'off' && !isPreview) return;
        try {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
            const audioCtx = new AudioContextClass();
            const g = audioCtx.createGain();
            g.connect(audioCtx.destination);
            g.gain.setValueAtTime(soundVolume * 0.15, audioCtx.currentTime);
            const now = audioCtx.currentTime;

            const playNote = (freq: number, start: number) => {
                const osc = audioCtx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + start);
                const eg = audioCtx.createGain();
                eg.gain.setValueAtTime(0.1, now + start);
                eg.gain.exponentialRampToValueAtTime(0.001, now + start + 0.2);
                osc.connect(eg);
                eg.connect(g);
                osc.start(now + start);
                osc.stop(now + start + 0.2);
            };

            playNote(880, 0);
            playNote(1100, 0.1);
            setTimeout(() => audioCtx.close(), 500);
        } catch { }
    }, [playTimeWarning, soundVolume]);

    const [words, setWords] = useState<string[]>([]);
    const [userInput, setUserInput] = useState("");
    const [startTime, setStartTime] = useState<number | null>(null);

    const [caretPos, setCaretPos] = useState({ top: 0, left: 0 });
    const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
    const [errorKey, setErrorKey] = useState<string | null>(null);
    const [isCapsLock, setIsCapsLock] = useState(false);
    const [lineOffset, setLineOffset] = useState(0);
    const [isFocused, setIsFocused] = useState(true);
    const [xpResult, setXpResult] = useState<{ gained: number; levelUp: boolean; newAchievements?: string[] } | null>(null);
    const [ghost, setGhost] = useState<{ wpm: number, userName: string | null } | null>(null);
    const [ghostPos, setGhostPos] = useState({ top: 0, left: 0, charIndex: 0 });

    useEffect(() => {
        try {
            const stored = localStorage.getItem("capsLockState");
            if (stored === "true") setIsCapsLock(true);
        } catch { }
    }, []);

    useEffect(() => {
        try { localStorage.setItem("capsLockState", String(isCapsLock)); } catch { }
    }, [isCapsLock]);

    useEffect(() => {
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

    const statsRef = useRef(stats);
    const startTimeRef = useRef<number | null>(null);
    const chartDataRef = useRef<ChartPoint[]>([]);
    const lastErrorCountRef = useRef(0);
    useEffect(() => { statsRef.current = stats; }, [stats]);
    useEffect(() => { startTimeRef.current = startTime; }, [startTime]);

    const inputRef = useRef<HTMLInputElement>(null);
    const keystrokeTimes = useRef<number[]>([]);
    const lastKeystrokeTime = useRef<number>(Date.now());
    const wordsRef = useRef<HTMLDivElement>(null);
    const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const restartRef = useRef<HTMLButtonElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [hasMounted, setHasMounted] = useState(false);
    const wasTabPressedRef = useRef(false);
    const isCheatDetected = useRef(false);
    const lastKeystrokeIntervals = useRef<number[]>([]);
    useEffect(() => { setHasMounted(true); }, []);

    const activeTheme = THEMES[theme] || THEMES.codex;


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
    }, [mode, config, language, setWords]);

    const startTest = useCallback(() => {
        setIsActive(true);
        setStartTime(Date.now());
        incrementTestsStarted(); // Track test start

        // Fetch Ghost
        getGhostRun(mode, config as number, language).then(res => {
            if (res.success && res.ghost) {
                setGhost(res.ghost);
            }
        });
    }, [mode, config, language, setIsActive, setStartTime, setGhost]);

    const finishTest = useCallback(() => {
        setIsActive(false);
        setIsFinished(true);
        setGhost(null); // Clear ghost on finish

        const elapsedMs = Date.now() - (startTime || Date.now());
        const durationSeconds = Math.floor(elapsedMs / 1000);

        // Calculate Consistency
        let consistency = 0;
        if (keystrokeTimes.current.length > 2) {
            const offsets = [];
            for (let i = 1; i < keystrokeTimes.current.length; i++) {
                offsets.push(keystrokeTimes.current[i] - keystrokeTimes.current[i - 1]);
            }
            const mean = offsets.reduce((a, b) => a + b, 0) / offsets.length;
            const variance = offsets.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / offsets.length;
            const stdDev = Math.sqrt(variance);
            const cv = stdDev / mean;
            consistency = Math.max(0, Math.min(100, Math.round(100 * (1 - cv))));
        }

        addHistory({
            wpm: stats.wpm,
            rawWpm: stats.rawWpm,
            accuracy: stats.accuracy,
            mode,
            config,
            language,
            theme,
            consistency: stats.consistency,
            duration: durationSeconds,
            afk: stats.afk,
            missedChars: stats.missedChars
        });

        // Save to Database (Which also handles Leaderboard sync)
        saveTypingResult({
            wpm: stats.wpm,
            rawWpm: stats.rawWpm,
            accuracy: stats.accuracy,
            consistency: stats.consistency,
            mode,
            config,
            language,
            theme,
            duration: durationSeconds,
            missedChars: stats.missedChars,
            afk: stats.afk,
            isUnverified: isCheatDetected.current
        }).then((res: { success: boolean; xpGained?: number; levelUp?: boolean; newAchievements?: string[] }) => {
            if (res.success && res.xpGained) {
                setXpResult({
                    gained: res.xpGained,
                    levelUp: !!res.levelUp,
                    newAchievements: res.newAchievements
                });
            }
        });
    }, [addHistory, config, language, mode, startTime, stats, theme, setIsActive, setIsFinished, setGhost, setXpResult]);

    const finishTestRef = useRef(finishTest);
    useEffect(() => {
        finishTestRef.current = finishTest;
    }, [finishTest]);

    useEffect(() => {
        generateWords();
    }, [generateWords]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
        if (isActive && mode === "time" && timeLeft > 0) {
            interval = setInterval(() => {
                const nextTime = useMonkeyTypeStore.getState().timeLeft - 1;
                setTimeLeft(nextTime);
                const warningTime = typeof playTimeWarning === 'string' && playTimeWarning !== 'off' ? parseInt(playTimeWarning) : (typeof playTimeWarning === 'number' ? playTimeWarning : (playTimeWarning === true ? 10 : null));
                if (warningTime !== null && nextTime === warningTime) playWarningSound();
            }, 1000);
        } else if (mode === "time" && timeLeft === 0) {
            finishTestRef.current();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft === 0, mode, setTimeLeft]);

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

            // AFK Detection
            const timeSinceLastKey = Date.now() - lastKeystrokeTime.current;
            let afkSec = 0;
            if (timeSinceLastKey > 2000) {
                afkSec = 1;
            }

            // Consistency Calculation (Variation in WPM samples)
            const wpmSamples = chartDataRef.current.map(p => p.wpm);
            wpmSamples.push(s.wpm);
            let liveConsistency = s.consistency;
            if (wpmSamples.length > 2) {
                const mean = wpmSamples.reduce((a, b) => a + b, 0) / wpmSamples.length;
                const variance = wpmSamples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / wpmSamples.length;
                const stdDev = Math.sqrt(variance);
                const cv = stdDev / (mean || 1);
                liveConsistency = Math.max(0, Math.min(100, Math.round(100 * (1 - cv))));
            }

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
            setStats({ 
                ...s, 
                consistency: liveConsistency,
                afk: s.afk + afkSec 
            });
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


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Anti-cheat: Check if the event is trusted (generated by a user action)
        if (!e.nativeEvent.isTrusted) {
            isCheatDetected.current = true;
            console.warn("Untrusted input detected.");
        }

        const value = e.target.value;
        if (!isActive && !isFinished && value.length > 0) startTest();
        if (isFinished) return;

        setUserInput(value);
        playClickSound();

        // Track keystroke time for consistency and AFK
        const now = Date.now();
        const interval = now - lastKeystrokeTime.current;
        
        lastKeystrokeIntervals.current.push(interval);
        if (lastKeystrokeIntervals.current.length > 30) {
            lastKeystrokeIntervals.current.shift();
            
            // Bot detection: extremely low variance in typing speed (perfect rhythm)
            if (lastKeystrokeIntervals.current.length === 30) {
                const avg = lastKeystrokeIntervals.current.reduce((a, b) => a + b) / 30;
                const variance = lastKeystrokeIntervals.current.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / 30;
                // If variance is basically zero (e.g., < 1ms spread), it's a bot
                if (variance < 0.5 && avg > 0) {
                    isCheatDetected.current = true;
                }
            }
        }

        keystrokeTimes.current.push(now);
        lastKeystrokeTime.current = now;

        // Calculate live stats
        let correct = 0;
        let incorrect = 0;
        let extra = 0;

        for (let i = 0; i < value.length; i++) {
            if (i < targetText.length) {
                if (value[i] === targetText[i]) correct++;
                else incorrect++;
            } else {
                extra++;
            }
        }

        const missed = Math.max(0, targetText.length - value.length);

        // Trigger error sound if precisely this keystroke introduced an error
        if (value.length > userInput.length) {
            const lastCharIdx = value.length - 1;
            const isError = lastCharIdx >= targetText.length || value[lastCharIdx] !== targetText[lastCharIdx];
            if (isError) playErrorSound();
        }

        if (value.length < targetText.length && mode === "words") {
            // Only relevant for words mode completion
        }

        const elapsedMs = now - (startTime || now);
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
            consistency: stats.consistency, // Consistency calculated during snapshots
            afk: stats.afk
        });

        if (mode === "words" && value.length >= targetText.length) {
            // Flag result as unverified if cheat detected
            if (isCheatDetected.current) {
                // We'll handle this in the finishTest or save logic
            }
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
        const store = useMonkeyTypeStore.getState();
        const targetConfig = newConfig ?? store.config;
        const targetMode = newMode ?? store.mode;
        const targetLang = newLang ?? store.language;

        generateWords(targetMode, targetConfig, targetLang);
        setUserInput("");
        setStartTime(null);
        keystrokeTimes.current = [];
        setActiveKeys(new Set());
        setErrorKey(null);
        resetLiveState(targetMode === "time" ? (targetConfig as number) : 30);
        setLineOffset(0);
        setCaretPos({ top: 0, left: 0 });
        setGhost(null); // Clear ghost on reset
        setGhostPos({ top: 0, left: 0, charIndex: 0 });
        isCheatDetected.current = false;
        lastKeystrokeIntervals.current = [];
        setXpResult(null);
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [generateWords, resetLiveState]);
    
    useEffect(() => {
        // Reset test when navigating back to home if it was finished
        // (Zustand store persists across route changes in SPA)
        if (hasMounted && useMonkeyTypeStore.getState().isFinished) {
            resetTest();
        }
    }, [hasMounted, resetTest]);

    // Sync timeLeft to config on initial load (hydration fix)
    useEffect(() => {
        if (hasMounted && !isActive && !isFinished && mode === "time" && timeLeft !== config) {
            setTimeLeft(config as number);
        }
    }, [hasMounted, isActive, isFinished, mode, timeLeft, config, setTimeLeft]);

    interface CommandItem {
        id: string;
        label: string;
        category: string;
        icon?: React.ReactNode;
        isActive?: boolean;
        action: () => void;
    }

    const commands = useMemo(() => {
        const list: CommandItem[] = [];

        if (!activeCommandGroup) {
            // Main Menu
            list.push({ id: "action-restart", label: "Restart Test", category: "Action", action: () => resetTest() });

            // Configuration Groups
            list.push({ id: "group-sound-click", label: "Sound on Click...", category: "Sound", action: () => { setActiveCommandGroup('sound-click'); setSelectedIndex(0); setSearchQuery(""); } });
            list.push({ id: "group-sound-volume", label: "Sound on Volume...", category: "Sound", action: () => { setActiveCommandGroup('sound-volume'); setSelectedIndex(0); setSearchQuery(""); } });
            list.push({ id: "group-sound-error", label: "Sound on Error...", category: "Sound", action: () => { setActiveCommandGroup('sound-error'); setSelectedIndex(0); setSearchQuery(""); } });
            list.push({ id: "group-time-warning", label: "Play Time Warning...", category: "Sound", action: () => { setActiveCommandGroup('time-warning'); setSelectedIndex(0); setSearchQuery(""); } });

            // Core Settings
            list.push({ id: "mode-time", label: "Time Mode", category: "Mode", action: () => { setMode("time"); setConfig(30); resetTest(); setIsSearchOpen(false); } });
            list.push({ id: "mode-words", label: "Words Mode", category: "Mode", action: () => { setMode("words"); setConfig(25); resetTest(); setIsSearchOpen(false); } });

            // Languages
            list.push({ id: "lang-en", label: "English", category: "Language", action: () => { setLanguage("english"); resetTest(); setIsSearchOpen(false); } });
            list.push({ id: "lang-km", label: "Khmer", category: "Language", action: () => { setLanguage("khmer"); resetTest(); setIsSearchOpen(false); } });

            // Themes
            list.push({ id: "group-theme-select", label: "Theme...", category: "Theme", icon: <Palette className="w-4 h-4 opacity-70" />, action: () => { setActiveCommandGroup('theme-select'); setSelectedIndex(0); setSearchQuery(""); } });
            list.push({ id: "action-theme-custom", label: "Custom theme...", category: "Theme", action: () => { setIsSearchOpen(false); } });
            
            const isFav = favoriteThemes.includes(theme);
            list.push({ 
                id: "action-theme-favorite", 
                label: isFav ? "Remove Current theme from favorite" : "Add Current theme to favorite", 
                category: "Theme", 
                icon: <Star className={cn("w-4 h-4", isFav ? "fill-current text-[#e2b714]" : "opacity-70")} />,
                action: () => { toggleFavoriteTheme(theme); setIsSearchOpen(false); } 
            });
            
            list.push({ 
                id: "action-theme-random", 
                label: "Random theme...", 
                category: "Theme", 
                action: () => { 
                    const themeKeys = Object.keys(THEMES) as Theme[];
                    const randomTheme = themeKeys[Math.floor(Math.random() * themeKeys.length)];
                    setTheme(randomTheme); 
                    setIsSearchOpen(false); 
                } 
            });
        } else if (activeCommandGroup === 'sound-click') {
            // Click Sounds Sub-menu
            const soundTypes = [
                { id: 'mechanical', label: 'Mechanical' },
                { id: 'cherry_blue', label: 'Cherry MX Blue' },
                { id: 'cherry_brown', label: 'Cherry MX Brown' },
                { id: 'cherry_red', label: 'Cherry MX Red' },
                { id: 'clack', label: 'Clack' },
                { id: 'tink', label: 'Tink' },
                { id: 'pop', label: 'Pop' },
                { id: 'plastic', label: 'Plastic' },
                { id: 'typewriter', label: 'Typewriter' },
                { id: 'water', label: 'Water Drop' },
            ];
            soundTypes.forEach(s => list.push({
                id: `sound-${s.id}`,
                label: s.label,
                category: "Click Sound",
                icon: <Music className="w-4 h-4 opacity-70" />,
                isActive: soundType === s.id,
                action: () => { setSettings({ soundType: s.id, soundEnabled: true }); setIsSearchOpen(false); setActiveCommandGroup(null); setSearchQuery(""); }
            }));
        } else if (activeCommandGroup === 'sound-volume') {
            // Volume Sub-menu: 0% to 100% in 10% steps
            const volumeOptions = Array.from({ length: 11 }, (_, i) => {
                const percentage = i * 10;
                const val = percentage / 100;
                const label = percentage === 0 ? 'Mute (0%)' : `${percentage}%`;
                
                return {
                    id: `vol-${percentage}`,
                    label,
                    val,
                    category: "Volume",
                    icon: <Volume2 className="w-4 h-4 opacity-70" />,
                    isActive: soundVolume === val,
                    action: () => { 
                        setSettings({ soundVolume: val, soundEnabled: val > 0 }); 
                        setIsSearchOpen(false); 
                        setActiveCommandGroup(null); 
                    }
                };
            });
            volumeOptions.reverse().forEach(v => list.push(v));
        } else if (activeCommandGroup === 'sound-error') {
            const errorOptions = [
                { id: 'off', label: 'OFF' },
                { id: 'damage', label: 'Damage' },
                { id: 'triangle', label: 'Triangle' },
                { id: 'square', label: 'Square' },
                { id: 'punch_miss', label: 'Punch Miss' }
            ];
            errorOptions.forEach(eo => list.push({
                id: `sound-error-${eo.id}`,
                label: eo.label,
                category: "Error Sound",
                icon: <VolumeX className="w-4 h-4 opacity-70" />,
                isActive: soundOnError === eo.id,
                action: () => { 
                    setSettings({ soundOnError: eo.id });
                    setIsSearchOpen(false);
                    setActiveCommandGroup(null);
                }
            }));
        } else if (activeCommandGroup === 'time-warning') {
            const warningOptions = [
                { id: 'off', label: 'OFF', val: 'off' },
                { id: '1s', label: '1 seconds', val: 1 },
                { id: '3s', label: '3 seconds', val: 3 },
                { id: '5s', label: '5 seconds', val: 5 },
                { id: '10s', label: '10 seconds', val: 10 }
            ];
            warningOptions.forEach(wo => list.push({
                id: `time-warning-${wo.id}`,
                label: wo.label,
                category: "Time Warning",
                icon: <Bell className="w-4 h-4 opacity-70" />,
                isActive: playTimeWarning === wo.val,
                action: () => { 
                    setSettings({ playTimeWarning: wo.val });
                    setIsSearchOpen(false);
                    setActiveCommandGroup(null);
                }
            }));
        } else if (activeCommandGroup === 'theme-select') {
            const themeList: CommandItem[] = [];
            Object.entries(THEMES).forEach(([id, t]) => {
                const isFav = favoriteThemes.includes(id as Theme);
                themeList.push({ 
                    id: `theme-${id}`, 
                    label: (t as any).name || id, 
                    category: "Theme", 
                    icon: isFav ? <Star className="w-4 h-4 fill-current text-[#e2b714]" /> : undefined,
                    isActive: theme === id,
                    action: () => { 
                        setTheme(id as Theme); 
                        setIsSearchOpen(false); 
                        setActiveCommandGroup(null);
                    } 
                });
            });
            themeList.sort((a, b) => {
                const aFav = favoriteThemes.includes(a.id.replace('theme-', '') as Theme);
                const bFav = favoriteThemes.includes(b.id.replace('theme-', '') as Theme);
                if (aFav && !bFav) return -1;
                if (!aFav && bFav) return 1;
                return a.label.localeCompare(b.label);
            });
            themeList.forEach(t => list.push(t));
        }

        return list;
    }, [activeCommandGroup, soundOnError, playTimeWarning, resetTest, setSettings, setTheme, setMode, setConfig, setLanguage, language, favoriteThemes, theme, toggleFavoriteTheme]);

    const filteredCommands = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return commands;
        return commands.filter(c => c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    }, [commands, searchQuery]);

    useEffect(() => {
        setSelectedIndex(Math.min(selectedIndex, Math.max(0, filteredCommands.length - 1)));
    }, [selectedIndex, filteredCommands.length]);

    // Track Tab hold state for Tab+Enter restart
    const isTabHeld = useRef(false);

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            // Anti-cheat: check isTrusted
            if (!e.isTrusted) {
                isCheatDetected.current = true;
            }

            if (isSearchOpen) {
                if (e.key === "Escape") {
                    e.preventDefault();
                    if (activeCommandGroup) {
                        setActiveCommandGroup(null);
                        setSelectedIndex(0);
                    } else {
                        setIsSearchOpen(false);
                    }
                } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    const nextIndex = Math.min(selectedIndex + 1, filteredCommands.length - 1);
                    if (nextIndex !== selectedIndex) {
                        setSelectedIndex(nextIndex);
                        const cmd = filteredCommands[nextIndex];
                        if (cmd.category === "Click Sound") {
                            const soundId = cmd.id.replace('sound-', '');
                            playClickSound(soundId, true);
                        } else if (cmd.category === "Volume") {
                            // Play a test sound at the highlighted volume
                            const match = cmd.label.match(/(\d+)%/);
                            const vol = match ? parseInt(match[1]) / 100 : soundVolume;
                            playClickSound(undefined, true, vol);
                        } else if (cmd.category === "Error Sound") {
                            const errorId = cmd.id.replace('sound-error-', '');
                            playErrorSound(errorId, true);
                        } else if (cmd.category === "Time Warning") {
                            playWarningSound(true);
                        }
                    }
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    const prevIndex = Math.max(selectedIndex - 1, 0);
                    if (prevIndex !== selectedIndex) {
                        setSelectedIndex(prevIndex);
                        const cmd = filteredCommands[prevIndex];
                        if (cmd.category === "Click Sound") {
                            const soundId = cmd.id.replace('sound-', '');
                            playClickSound(soundId, true);
                        } else if (cmd.category === "Volume") {
                            // Play a test sound at the selected volume
                            playClickSound(undefined, true);
                        } else if (cmd.category === "Error Sound") {
                            const errorId = cmd.id.replace('sound-error-', '');
                            playErrorSound(errorId, true);
                        } else if (cmd.category === "Time Warning") {
                            playWarningSound(true);
                        }
                    }
                } else if (e.key === "Enter") {
                    e.preventDefault();
                    if (filteredCommands[selectedIndex]) {
                        const cmd = filteredCommands[selectedIndex];
                        if (cmd.category === "Click Sound") {
                            const soundId = cmd.id.replace('sound-', '');
                            playClickSound(soundId, true);
                        } else if (cmd.category === "Volume") {
                            const match = cmd.label.match(/(\d+)%/);
                            const vol = match ? parseInt(match[1]) / 100 : soundVolume;
                            playClickSound(undefined, true, vol);
                        } else if (cmd.category === "Error Sound") {
                            const errorId = cmd.id.replace('sound-error-', '');
                            playErrorSound(errorId, true);
                        } else if (cmd.category === "Time Warning") {
                            playWarningSound(true);
                        }
                        cmd.action();
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

            if (e.key === "Escape" || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "p")) {
                e.preventDefault();
                setIsSearchOpen(true);
                setActiveCommandGroup(null);
                setSearchQuery("");
                setSelectedIndex(0);
                setTimeout(() => searchInputRef.current?.focus(), 50);
                return;
            }

            if (isSearchOpen && e.key === "Backspace" && searchQuery === "" && activeCommandGroup) {
                e.preventDefault();
                setActiveCommandGroup(null);
                setSelectedIndex(0);
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
                const shiftCode = e.code.toLowerCase();
                setActiveKeys(prev => {
                    const next = new Set(prev);
                    next.add(shiftCode);
                    return next;
                });
                setErrorKey(null);
            } else if (!e.ctrlKey && !e.altKey && !e.metaKey && !["Tab", "Enter", "Escape", "Backspace", "Control", "Alt", "Meta"].includes(e.key)) {
                if (document.activeElement !== inputRef.current) {
                    inputRef.current?.focus();
                }

                const currentInput = userInputRef.current;
                const expectedChar = targetText[currentInput.length];
                let isIncorrect = false;

                if (expectedChar === undefined) {
                    isIncorrect = true;
                } else if (language === "english") {
                    if (originalKey.toLowerCase() !== expectedChar.toLowerCase()) isIncorrect = true;
                } else { // Khmer
                    if (originalKey !== expectedChar) isIncorrect = true;
                    // Enforce Shift for Space in Khmer
                    if (expectedChar === " " && !e.shiftKey) isIncorrect = true;
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
            if (e.key === "Shift") {
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
                    if (e.key === " ") {
                        next.delete("space");
                    } else {
                        let matchedQwerty = key;
                        for (const [qKey, chars] of Object.entries(KHMER_KEY_MAP)) {
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

            if (e.key === "Tab") {
                isTabHeld.current = false;
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
    }, [isSearchOpen, filteredCommands, selectedIndex, language, isFinished, resetTest, setIsWrongKeyboardLayout, targetText]);

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
    }, [userInput, words, clusters, clusterIndexes, lineOffset, fontSize, language]);

    if (!hasMounted) {
        return (
            <div className="min-h-screen theme-transition flex flex-col items-center justify-center" style={{ backgroundColor: THEMES.codex.bg }} suppressHydrationWarning>
                {/* Minimal loader or skeleton while hydrating */}
                <div className="flex items-center gap-2" suppressHydrationWarning>
                    <Type className="w-8 h-8 animate-pulse" style={{ color: THEMES.codex.primary }} />
                    <h1 className="text-[32px] tracking-tight font-bold" style={{ color: THEMES.codex.text }}>type<span style={{ color: THEMES.codex.textDim }}>flow</span></h1>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "h-screen h-[100dvh] w-full flex flex-col items-center justify-between overflow-hidden select-none theme-transition",
                "pt-1 sm:pt-1.5 md:pt-3 px-[var(--content-px)] pb-1 sm:pb-2 md:pb-4",
                language === "khmer" ? "font-sans font-medium" : "font-mono"
            )}
            onClick={() => {
                if (isFocused) {
                    inputRef.current?.blur();
                }
            }}
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
                                <Search className="w-5 h-5 opacity-50 shrink-0" style={{ color: activeTheme.text }} />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder={
                                        activeCommandGroup === 'sound-click' ? 'Sound on click...' : 
                                        activeCommandGroup === 'sound-volume' ? 'Sound volume...' : 
                                        activeCommandGroup === 'sound-error' ? 'Sound error...' : 
                                        activeCommandGroup === 'time-warning' ? 'Play time warning...' : 
                                        activeCommandGroup === 'theme-select' ? 'Search themes...' : 
                                        'Search commands...'
                                    }
                                    className="w-full bg-transparent border-none outline-none py-4 px-3 text-lg placeholder-white/20"
                                    style={{ color: activeTheme.text }}
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setSelectedIndex(0); }}
                                    onKeyDown={(e) => {
                                        // Handle backspace when input is empty to go back
                                        if (e.key === "Backspace" && searchQuery === "" && activeCommandGroup) {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setActiveCommandGroup(null);
                                            setSelectedIndex(0);
                                        }
                                    }}
                                />
                                <span className="text-xs opacity-50 px-2 py-1 rounded bg-black/20 shrink-0" style={{ color: activeTheme.textDim }}>ESC</span>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto py-2 custom-scrollbar">
                                {searchQuery.trim() === '' && !activeCommandGroup ? (
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
                                        No commands found matching &quot;{searchQuery}&quot;
                                    </div>
                                ) : (
                                    filteredCommands.map((cmd, i) => (
                                        <div
                                            key={cmd.id}
                                            onClick={() => {
                                                if (cmd.category === "Click Sound") {
                                                    const soundId = cmd.id.replace('sound-', '');
                                                    playClickSound(soundId, true);
                                                } else if (cmd.category === "Volume") {
                                                    const match = cmd.label.match(/(\d+)%/);
                                                    const vol = match ? parseInt(match[1]) / 100 : soundVolume;
                                                    playClickSound(undefined, true, vol);
                                                } else if (cmd.category === "Error Sound") {
                                                    const errorId = cmd.id.replace('sound-error-', '');
                                                    playErrorSound(errorId, true);
                                                } else if (cmd.category === "Time Warning") {
                                                    playWarningSound(true);
                                                }
                                                cmd.action();
                                            }}
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
                                                {cmd.icon && cmd.icon}
                                                <span className="font-semibold">{cmd.label}</span>
                                                {cmd.category === 'Theme' && theme === cmd.id.replace('theme-', '') && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: activeTheme.primary, color: activeTheme.bg }}>active</span>
                                                )}
                                                {cmd.isActive && (
                                                    <Check className="w-4 h-4 opacity-80" style={{ color: activeTheme.primary }} />
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
                        initial={{ opacity: 0, y: -20, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: -20, x: "-50%" }}
                        className="fixed top-24 left-1/2 z-50 w-full max-w-sm"
                    >
                        <div className="bg-[#ca4754] text-white p-4 rounded-xl shadow-2xl flex items-center gap-4 border border-white/10">
                            <div className="shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <KeyboardIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold truncate">Wrong Layout?</h3>
                                <p className="text-[11px] opacity-80 leading-tight">Your keyboard seems to be in English. Switch to Khmer for this test.</p>
                            </div>
                            <button 
                                onClick={() => setIsWrongKeyboardLayout(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>
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
                        className="w-full max-w-[var(--content-max-w)] flex-1 flex flex-col justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 min-h-0"
                    >
                        {/* Mode Selector Config Bar */}
                        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-4 p-1 sm:p-2 rounded-xl self-center text-[10px] sm:text-xs font-bold shadow-2xl theme-transition max-w-full" style={{ backgroundColor: 'var(--mt-bg-alt)' }}>
                            {/* Group 1: Time / Words */}
                            <div className="flex items-center gap-0.5 sm:gap-2">
                                <button onClick={() => { setMode("time"); const nextConfig = (config === 15 || config === 30 || config === 60 || config === 120) ? config : 30; setConfig(nextConfig as GameConfig); resetTest(nextConfig as GameConfig, "time"); }} className={cn("flex items-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 px-1.5 sm:px-3 transition-all outline-none rounded-lg cursor-pointer", mode === "time" ? "text-[var(--mt-primary)] bg-[var(--mt-bg)]/50" : "hover:text-[var(--mt-text)]")}>
                                    <Timer className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> time
                                </button>
                                <button onClick={() => { setMode("words"); const nextConfig = (config === 10 || config === 25 || config === 50 || config === 100) ? config : 25; setConfig(nextConfig as GameConfig); resetTest(nextConfig as GameConfig, "words"); }} className={cn("flex items-center gap-1 sm:gap-1.5 py-1 sm:py-1.5 px-1.5 sm:px-3 transition-all outline-none rounded-lg cursor-pointer", mode === "words" ? "text-[var(--mt-primary)] bg-[var(--mt-bg)]/50" : "hover:text-[var(--mt-text)]")}>
                                    <Type className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> words
                                </button>
                            </div>

                            <div className="hidden md:block w-[3px] h-4 rounded-full bg-[var(--mt-text-dim)] opacity-20" />

                            {/* Group 2: Values (15/30/60... or 10/25/50...) */}
                            <div className="flex items-center justify-center gap-0.5 sm:gap-2">
                                {mode === "time" ? (
                                    [15, 30, 60, 120].map(t => (
                                        <button key={t} onClick={() => { setConfig(t as GameConfig); resetTest(t as GameConfig); }} className={cn("py-1 sm:py-1.5 px-1.5 sm:px-3 transition-all outline-none rounded-lg cursor-pointer", config === t ? "text-[var(--mt-primary)] bg-[var(--mt-bg)]/50" : "hover:text-[var(--mt-text)]")}>
                                            {t}
                                        </button>
                                    ))
                                ) : (
                                    [10, 25, 50, 100].map(w => (
                                        <button key={w} onClick={() => { setConfig(w as GameConfig); resetTest(w as GameConfig); }} className={cn("py-1 sm:py-1.5 px-1.5 sm:px-3 transition-all outline-none rounded-lg cursor-pointer", config === w ? "text-[var(--mt-primary)] bg-[var(--mt-bg)]/50" : "hover:text-[var(--mt-text)]")}>
                                            {w}
                                        </button>
                                    ))
                                )}
                            </div>

                            <div className="hidden md:block w-[3px] h-4 rounded-full bg-[var(--mt-text-dim)] opacity-20" />

                            {/* Group 3: Language */}
                            <div className="flex items-center gap-0.5 sm:gap-2">
                                <button onClick={() => { setLanguage("english"); resetTest(undefined, undefined, "english"); }} className={cn("py-1 sm:py-1.5 px-1.5 sm:px-3 transition-all outline-none rounded-lg cursor-pointer", language === "english" ? "text-[var(--mt-primary)] bg-[var(--mt-bg)]/50" : "hover:text-[var(--mt-text)]")}>
                                    english
                                </button>
                                <button onClick={() => { setLanguage("khmer"); resetTest(undefined, undefined, "khmer"); }} className={cn("py-1 sm:py-1.5 px-1.5 sm:px-3 transition-all outline-none rounded-lg cursor-pointer", language === "khmer" ? "text-[var(--mt-primary)] bg-[var(--mt-bg)]/50" : "hover:text-[var(--mt-text)]")}>
                                    khmer
                                </button>
                            </div>
                        </div>

                        <div className="relative w-full flex flex-col gap-2 sm:gap-4 md:gap-6 lg:gap-8">
                            {/* Inner Container (No longer blurred here) */}
                            <div className="w-full flex flex-col gap-2 sm:gap-4 md:gap-6 lg:gap-8 transition-all">
                                {/* Caps Lock Warning — 1:1 Monkeytype Style */}
                                <AnimatePresence>
                                    {isCapsLock && (
                                        <motion.div
                                            key="capslock"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.1 }}
                                            className="absolute left-1/2 -translate-x-1/2 -top-4 z-[999] flex items-center gap-3 px-4 py-2 rounded-lg font-mono text-base whitespace-nowrap shadow-lg pointer-events-none"
                                            style={{
                                                backgroundColor: activeTheme.primary,
                                                color: activeTheme.bg,
                                            }}
                                        >
                                            <Lock size={18} fill="currentColor" />
                                            <span>Caps Lock</span>
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
                                    className="relative overflow-hidden w-full px-1 sm:px-4 typing-fade-bottom transition-all cursor-text"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        inputRef.current?.focus();
                                    }}
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
                                                    animate={{
                                                        top: ghostPos.top,
                                                        left: ghostPos.left,
                                                        opacity: [0.15, 0.25, 0.15]
                                                    }}
                                                    transition={{
                                                        top: { type: "spring", stiffness: 100, damping: 20 },
                                                        left: { type: "spring", stiffness: 100, damping: 20 },
                                                        opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                                                    }}
                                                    className="absolute w-[1.5px] rounded-full z-0 pointer-events-none flex flex-col items-center"
                                                    style={{
                                                        backgroundColor: activeTheme.textDim,
                                                        height: language === "khmer" ? '34px' : `${fontSize * 1.1}px`,
                                                        marginTop: language === "khmer" ? '6px' : `${fontSize * 0.25}px`,
                                                    }}
                                                >
                                                    <div
                                                        className="absolute bottom-full mb-3 whitespace-nowrap text-[7px] font-black uppercase tracking-[0.25em] px-2 py-0.5 rounded-full border flex items-center gap-1.5 opacity-30 group"
                                                        style={{
                                                            backgroundColor: `${activeTheme.bg}dd`,
                                                            color: activeTheme.textDim,
                                                            borderColor: `${activeTheme.textDim}20`
                                                        }}
                                                    >
                                                        <div className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: activeTheme.textDim }} />
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
                                            onPaste={(e) => e.preventDefault()}
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
                                                <div className="flex items-center gap-3 text-base font-medium tracking-tight" style={{ color: activeTheme.text }}>
                                                    <motion.div
                                                        animate={{
                                                            scale: [1, 1.2, 1],
                                                            opacity: [0.7, 1, 0.7]
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: "easeInOut"
                                                        }}
                                                        style={{ color: activeTheme.primary }}
                                                    >
                                                        <MousePointer2 size={18} fill="currentColor" className="opacity-80" />
                                                    </motion.div>
                                                    <span className="opacity-80">Click here or press any key to focus</span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Keyboard — Desktop only */}
                                <div
                                    className="hidden md:block"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        inputRef.current?.focus();
                                    }}
                                >
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

                                        const nextKeyData = { key: nextKey, needsShift };

                                        return (
                                            <Keyboard
                                                activeKeys={activeKeys}
                                                errorKey={errorKey}
                                                language={language}
                                                nextKeyData={nextKeyData}
                                                activeTheme={activeTheme}
                                            />
                                        );
                                    })()}
                                </div>


                                <div className="flex flex-col items-center gap-3 sm:gap-6 mt-2 sm:mt-4">
                                    <div className="hidden sm:flex items-center gap-10">
                                        <ShortcutHint
                                            keys={["tab", "enter"]}
                                            label="restart"
                                            activeTheme={activeTheme}
                                        />
                                        <ShortcutHint
                                            keys={["esc", (typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)) ? "cmd" : "ctrl", "shift", "p"]}
                                            splitIndex={0}
                                            label="command line"
                                            activeTheme={activeTheme}
                                        />
                                    </div>
                                    <motion.button
                                        ref={restartRef}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => resetTest()}
                                        className="group flex items-center gap-0 hover:gap-3 focus-visible:gap-3 px-4 py-4 rounded-full transition-all duration-300 focus:outline-none cursor-pointer"
                                        style={{ color: activeTheme.textDim }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = activeTheme.text; e.currentTarget.style.backgroundColor = activeTheme.bgAlt; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = activeTheme.textDim; e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        onFocus={(e) => { e.currentTarget.style.color = activeTheme.text; e.currentTarget.style.backgroundColor = activeTheme.bgAlt; }}
                                        onBlur={(e) => { e.currentTarget.style.color = activeTheme.textDim; e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        <RotateCcw className="w-5 h-5 transition-transform duration-500 group-hover:rotate-180 group-focus-visible:rotate-180" />
                                        <span className="text-xs font-bold uppercase tracking-widest overflow-hidden whitespace-nowrap w-0 group-hover:w-24 group-focus-visible:w-24 transition-all duration-300 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
                                            restart test
                                        </span>
                                    </motion.button>
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
                        className="w-full max-w-[var(--content-max-w)] flex-1 flex flex-col py-4 sm:py-6 gap-0 justify-center min-h-0"
                    >
                        {/* Main 2-Column Layout */}
                        <div className="flex flex-col md:flex-row w-full gap-4 md:gap-8 flex-1 min-h-0">

                            {/* LEFT — WPM, Acc + Stats */}
                            <div className="flex flex-col w-full md:w-[320px] shrink-0 gap-8">
                                {/* WPM */}
                                <div className="flex flex-col gap-6">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="flex flex-col"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: activeTheme.textDim }}>wpm</span>
                                            {(() => {
                                                const { history } = useMonkeyTypeStore.getState();
                                                const prevBest = history
                                                    .filter(h => h.mode === mode && h.config === config && h.language === language)
                                                    .reduce((max, h) => Math.max(max, h.wpm), 0);
                                                if (prevBest > 0 && stats.wpm > prevBest) {
                                                    return <span className="text-[8px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded font-black uppercase">Personal Best!</span>
                                                }
                                                return null;
                                            })()}
                                        </div>
                                        <span className="text-[96px] font-black leading-none tracking-tighter" style={{ color: activeTheme.primary }}>{stats.wpm}</span>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                        className="flex flex-col"
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-40" style={{ color: activeTheme.textDim }}>acc</span>
                                        <span className="text-[96px] font-black leading-none tracking-tighter" style={{ color: stats.accuracy === 100 ? activeTheme.primary : (stats.accuracy > 90 ? activeTheme.text : activeTheme.error) }}>{stats.accuracy}%</span>
                                    </motion.div>
                                </div>

                                {/* Rewards Card */}
                                <AnimatePresence>
                                    {xpResult && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 rounded-2xl border flex flex-col gap-3"
                                            style={{ backgroundColor: `${activeTheme.bgAlt}40`, borderColor: `${activeTheme.primary}20` }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${activeTheme.primary}20`, color: activeTheme.primary }}>
                                                        <Zap size={16} fill="currentColor" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40" style={{ color: activeTheme.textDim }}>exp earned</span>
                                                        <span className="text-sm font-black" style={{ color: activeTheme.primary }}>+{xpResult.gained} XP</span>
                                                    </div>
                                                </div>
                                                {xpResult.levelUp && (
                                                    <div className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-[10px] font-black uppercase">Lvl Up!</div>
                                                )}
                                            </div>
                                            
                                            {xpResult.newAchievements && xpResult.newAchievements.length > 0 && (
                                                <div className="flex flex-col gap-2 pt-2 border-t" style={{ borderColor: `${activeTheme.bgAlt}` }}>
                                                    {xpResult.newAchievements.map(id => {
                                                        const ach = ACHIEVEMENTS[id];
                                                        if (!ach) return null;
                                                        return (
                                                            <div key={id} className="flex items-center gap-2">
                                                                <ach.icon size={12} style={{ color: ach.color }} />
                                                                <span className="text-[9px] font-bold" style={{ color: activeTheme.text }}>{ach.name} unlocked</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Detailed Stats Grid */}
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="grid grid-cols-2 gap-y-8 gap-x-4"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1" style={{ color: activeTheme.textDim }}>test type</span>
                                        <span className="text-xl font-bold" style={{ color: activeTheme.text }}>{mode} {config}</span>
                                        <span className="text-[10px] font-medium opacity-40 mt-1" style={{ color: activeTheme.textDim }}>{theme}</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1" style={{ color: activeTheme.textDim }}>raw</span>
                                        <span className="text-3xl font-black" style={{ color: activeTheme.primary }}>{stats.rawWpm}</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1" style={{ color: activeTheme.textDim }}>characters</span>
                                        <div className="flex gap-1.5 items-baseline">
                                            <span className="text-xl font-bold" style={{ color: activeTheme.text }}>{stats.correctChars}</span>
                                            <span className="opacity-20">/</span>
                                            <span className="text-sm font-bold opacity-60" style={{ color: activeTheme.error }}>{stats.incorrectChars}</span>
                                            <span className="opacity-20">/</span>
                                            <span className="text-sm font-bold opacity-60" style={{ color: activeTheme.error }}>{stats.extraChars}</span>
                                            <span className="opacity-20">/</span>
                                            <span className="text-sm font-bold opacity-40" style={{ color: activeTheme.textDim }}>{stats.missedChars}</span>
                                        </div>
                                        <span className="text-[8px] font-bold uppercase opacity-30 mt-1" style={{ color: activeTheme.textDim }}>corr/inc/extra/miss</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1" style={{ color: activeTheme.textDim }}>consistency</span>
                                        <span className="text-xl font-black" style={{ color: stats.consistency > 70 ? activeTheme.text : (stats.consistency > 50 ? activeTheme.textDim : activeTheme.error) }}>{stats.consistency}%</span>
                                    </div>

                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1" style={{ color: activeTheme.textDim }}>time</span>
                                        <span className="text-xl font-bold" style={{ color: activeTheme.text }}>{chartData.length}s</span>
                                    </div>

                                    {stats.afk > 0 && (
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-1" style={{ color: activeTheme.textDim }}>afk</span>
                                            <span className="text-xl font-bold" style={{ color: activeTheme.error }}>{stats.afk}s</span>
                                        </div>
                                    )}
                                </motion.div>
                            </div>

                            {/* RIGHT — Graph */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="flex-1 flex flex-col min-w-0 pt-2"
                            >
                                <PerformanceChart data={chartData} activeTheme={activeTheme} />
                            </motion.div>
                        </div>

                        {/* Bottom — Restart hint + button */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 pt-6 border-t" style={{ borderColor: `${activeTheme.textDim}15` }}>
                            <div className="hidden sm:flex items-center gap-10">
                                <ShortcutHint
                                    keys={["tab", "enter"]}
                                    label="restart"
                                    activeTheme={activeTheme}
                                />
                                <ShortcutHint
                                    keys={["esc", (typeof navigator !== 'undefined' && /Mac/i.test(navigator.platform)) ? "cmd" : "ctrl", "shift", "p"]}
                                    splitIndex={0}
                                    label="command line"
                                    activeTheme={activeTheme}
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <Link href="/leaderboards">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="group flex items-center gap-3 px-6 py-4 rounded-full transition-all duration-300 focus:outline-none cursor-pointer"
                                        style={{ color: activeTheme.textDim }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = activeTheme.text; e.currentTarget.style.backgroundColor = `${activeTheme.bgAlt}50`; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = activeTheme.textDim; e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        <Crown className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                                        <span className="text-xs font-bold uppercase tracking-widest">
                                            leaderboard
                                        </span>
                                    </motion.button>
                                </Link>

                                <motion.button
                                    ref={restartRef}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => resetTest()}
                                    className="group flex items-center gap-0 hover:gap-3 focus-visible:gap-3 px-6 py-4 rounded-full transition-all duration-300 focus:outline-none cursor-pointer"
                                    style={{ color: activeTheme.textDim }}
                                    onMouseEnter={(e) => { e.currentTarget.style.color = activeTheme.text; e.currentTarget.style.backgroundColor = activeTheme.bgAlt; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.color = activeTheme.textDim; e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    onFocus={(e) => { e.currentTarget.style.color = activeTheme.text; e.currentTarget.style.backgroundColor = activeTheme.bgAlt; }}
                                    onBlur={(e) => { e.currentTarget.style.color = activeTheme.textDim; e.currentTarget.style.backgroundColor = 'transparent'; }}
                                >
                                    <RotateCcw className="w-5 h-5 transition-transform duration-500 group-hover:rotate-180 group-focus-visible:rotate-180" />
                                    <span className="text-xs font-bold uppercase tracking-widest overflow-hidden whitespace-nowrap w-0 group-hover:w-24 group-focus-visible:w-24 transition-all duration-300 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100">
                                        restart test
                                    </span>
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence >


            <div className="fixed bottom-3 sm:bottom-6 right-3 sm:right-6 text-[8px] sm:text-[10px] font-bold tracking-[0.3em] uppercase opacity-20 pointer-events-none" style={{ color: activeTheme.textDim }}>
                TypeFlow 1.0
            </div>

            <button
                onClick={() => setIsSearchOpen(true)}
                className="fixed lg:hidden bottom-3 sm:bottom-6 left-3 sm:left-6 z-50 p-2.5 sm:p-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center opacity-80 hover:opacity-100 cursor-pointer"
                style={{ backgroundColor: activeTheme.primary, color: activeTheme.bg }}
                title="Open Command Palette"
            >
                <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <Footer />
        </div >
    );
}
