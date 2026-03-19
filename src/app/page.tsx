"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { RotateCcw, Timer, Type, Globe, Zap, MousePointer2, Lock, Search, Music, Volume2, VolumeX, Bell, Check, Palette, Star, Terminal, Keyboard as LucideKeyboard } from "lucide-react";
import { FaLock, FaMountain } from "react-icons/fa6";
import { AuthenticCrown } from "@/components/icons/AuthenticCrown";
import { AuthenticKeyboard } from "@/components/icons/AuthenticKeyboard";
import { cn } from "@/lib/utils";
import { useMonkeyTypeStore, GameMode, GameConfig, Language, Theme, ChartPoint, KeymapMode, KeymapStyle, KeymapLegendStyle, KeymapShowTopRow } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import { incrementTestsStarted, getGhostRun, saveTypingResult } from "@/app/actions/typing-results";
import { ACHIEVEMENTS } from "@/constants/achievements";
import { ConfigurationBar } from "@/components/ConfigurationBar";

import { WORD_POOL, KHMER_WORD_POOL, LAYOUT_MAPS } from "@/constants/words";

const KEYBOARD_ROWS = LAYOUT_MAPS.qwerty;

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
    typedWord,
    targetWord,
    isActive,
    isFinished,
    charRefs,
    extraCharRefs,
    themeColors,
}: {
    group: number[],
    clusters: string[],
    clusterIndexes: number[],
    typedWord: string,
    targetWord: string,
    isActive: boolean,
    isFinished: boolean,
    charRefs: React.MutableRefObject<(HTMLSpanElement | null)[]>,
    extraCharRefs: React.MutableRefObject<(HTMLSpanElement | null)[]>,
    themeColors: ThemeColors,
    language: Language
}) => {
    const wordClusters = group.map(i => clusters[i]);
    
    // Strict border logic:
    // Only finished and incorrect words show the error color border.
    // The active word should NOT have an underline as per user request.
    const isIncorrect = isFinished && typedWord !== targetWord;
    
    return (
        <span 
            className={cn(
                "inline-block whitespace-nowrap px-[0.1em] transition-all duration-150 relative",
                isIncorrect && "border-b-2"
            )}
            style={{
                borderColor: isIncorrect ? themeColors.error : undefined,
                marginBottom: isIncorrect ? '-2px' : '0'
            }}
        >
            {group.map((clusterIdx, i) => {
                const cluster = wordClusters[i];
                const clusterInWordStart = clusterIndexes[clusterIdx] - clusterIndexes[group[0]];
                const clusterInWordEnd = clusterInWordStart + cluster.length;

                let color = themeColors.textDim;

                if (typedWord.length > clusterInWordStart) {
                    const typedPart = typedWord.substring(clusterInWordStart, Math.min(typedWord.length, clusterInWordEnd));
                    const targetPart = cluster;

                    if (typedPart === targetPart) {
                        color = themeColors.text;
                    } else {
                        color = themeColors.error;
                    }
                }

                return (
                    <span
                        key={clusterIdx}
                        ref={el => { charRefs.current[clusterIdx] = el; }}
                        style={{ color }}
                    >
                        {cluster === " " ? "\u00A0" : cluster}
                    </span>
                );
            })}
            
            {/* Render extra characters (overyping) - Fixed: No brackets, clean red border */}
            {typedWord.length > targetWord.length && (
                <span className="flex inline-flex">
                    {Array.from(typedWord.substring(targetWord.length)).map((char, i) => (
                        <span
                            key={`extra-${i}`}
                            ref={el => { if (isActive) extraCharRefs.current[i] = el; }}
                            className="border-b-2"
                            style={{
                                color: themeColors.error,
                                borderColor: themeColors.error,
                                opacity: 0.8
                            }}
                        >
                            {char === " " ? "\u00A0" : char}
                        </span>
                    ))}
                </span>
            )}
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
    activeTheme,
    keymapMode = "static",
    keymapStyle = "staggered",
    keymapLegendStyle = "lowercase",
    keymapSize = 1.0,
    keymapLayout = "qwerty",
    keymapShowTopRow = "always"
}: {
    activeKeys: Set<string>,
    errorKey: string | null,
    language: Language,
    nextKeyData: { key: string | null, needsShift: boolean },
    activeTheme: typeof THEMES.codex,
    keymapMode?: KeymapMode,
    keymapStyle?: KeymapStyle,
    keymapLegendStyle?: KeymapLegendStyle,
    keymapSize?: number,
    keymapLayout?: string,
    keymapShowTopRow?: KeymapShowTopRow
}) => {
    const layoutRows = LAYOUT_MAPS[keymapLayout as keyof typeof LAYOUT_MAPS] || LAYOUT_MAPS.qwerty;
    const rowsToRender = keymapShowTopRow === "never" ? layoutRows.slice(1) : layoutRows;

    return (
        <div 
            className="hidden md:flex flex-col gap-2 origin-top mt-4 transition-transform duration-200"
            style={{ 
                transform: `scale(${keymapSize})`,
                marginBottom: `${(keymapSize - 1) * 100}px` // Adjust margin to compensate for scale
            }}
        >
            {rowsToRender.map((row, rowIndex) => {
                const isSplit = keymapStyle === "split" || keymapStyle === "split_matrix";
                const isMatrix = keymapStyle === "matrix" || keymapStyle === "split_matrix";
                
                const leftHalf = isSplit ? row.slice(0, Math.ceil(row.length / 2)) : row;
                const rightHalf = isSplit ? row.slice(Math.ceil(row.length / 2)) : [];

                const renderRowContent = (keys: string[], side?: 'left' | 'right') => (
                    <div key={side || rowIndex} className={cn(
                        "flex gap-2",
                        !isMatrix && rowIndex === 1 && "ml-4",
                        !isMatrix && rowIndex === 2 && "ml-8",
                        !isMatrix && rowIndex === 3 && side !== 'right' && "ml-12",
                        keymapStyle === "staggered" && "justify-center"
                    )}>
                        {keys.map((qwertyKey, charIndex) => {
                            const actualRowIndex = keymapShowTopRow === "never" ? rowIndex + 1 : rowIndex;
                            const mapping = KHMER_KEY_MAP[qwertyKey];
                            const isLeftShift = actualRowIndex === 3 && charIndex === 0 && side !== 'right';
                            const isRightShift = actualRowIndex === 3 && (isSplit ? charIndex === keys.length - 1 : charIndex === row.length - 1) && (side === 'right' || !isSplit);

                            const isReallyPressed = activeKeys.has(qwertyKey);
                            const isShiftReallyPressed = (isLeftShift && activeKeys.has('shiftleft')) || (isRightShift && activeKeys.has('shiftright'));
                            const isPressed = isReallyPressed || (qwertyKey === "shift" && isShiftReallyPressed);

                            const isErrorPress = errorKey === qwertyKey;
                            const isShiftKey = qwertyKey === "shift";

                            const isNextTarget = nextKeyData.key === qwertyKey;

                            const targetSide = nextKeyData.key && LEFT_SIDE_KEYS.has(nextKeyData.key) ? 'left' : 'right';
                            const suggestedShift = targetSide === 'left' ? 'right' : 'left';
                            const isSuggestedShift = (isLeftShift && suggestedShift === 'left') || (isRightShift && suggestedShift === 'right');

                            const needsShiftHint = nextKeyData.needsShift && !isShiftReallyPressed && isSuggestedShift;
                            const isNext = (isNextTarget && !isShiftKey) || needsShiftHint;

                            const showNextHighlight = keymapMode === "next" && isNext;

                            let displayKey = qwertyKey;
                            if (keymapLegendStyle === "blank") {
                                displayKey = "";
                            } else if (keymapLegendStyle === "uppercase" && qwertyKey !== "space") {
                                displayKey = qwertyKey.toUpperCase();
                            } else if (keymapLegendStyle === "lowercase" && qwertyKey !== "space") {
                                displayKey = qwertyKey.toLowerCase();
                            } else if (keymapLegendStyle === "dynamic") {
                                displayKey = qwertyKey.toLowerCase();
                            }

                            return (
                                <motion.div
                                    key={`${qwertyKey}-${charIndex}-${side || 'main'}`}
                                    animate={{
                                        scale: isPressed ? 0.92 : 1,
                                        y: isPressed ? 2 : 0,
                                    }}
                                    transition={{ type: "spring", stiffness: 700, damping: 25, mass: 0.4 }}
                                    className={cn(
                                        "h-11 px-3 flex items-center justify-center rounded-lg text-sm font-black relative overflow-hidden border-2 transition-all duration-100",
                                        qwertyKey === "space" ? "w-72" : (isShiftKey ? "min-w-[80px]" : "min-w-11"),
                                        language === "khmer" ? "font-hanuman font-normal" : ""
                                    )}
                                    style={{
                                        backgroundColor: isPressed
                                            ? (isErrorPress ? activeTheme.error : activeTheme.primary)
                                            : (showNextHighlight ? `rgba(${activeTheme.primaryRgb}, 0.12)` : activeTheme.bgAlt),
                                        borderColor: isPressed
                                            ? (isErrorPress ? activeTheme.error : activeTheme.primary)
                                            : (showNextHighlight ? activeTheme.primary : 'rgba(255,255,255,0.06)'),
                                        color: isPressed
                                            ? activeTheme.bg
                                            : (showNextHighlight ? activeTheme.text : activeTheme.textDim),
                                        boxShadow: isPressed
                                            ? `0 0 18px ${isErrorPress ? activeTheme.error : activeTheme.primary}60`
                                            : (showNextHighlight ? `0 0 12px ${activeTheme.primary}40` : '0 3px 0 rgba(0,0,0,0.25)'),
                                    }}
                                >
                                    {qwertyKey !== "space" ? (
                                        language === "khmer" && mapping ? (
                                            <div className="relative w-full h-full flex items-center justify-center">
                                                <span className={cn("absolute top-1 right-1 text-[9px] font-bold leading-none transition-opacity", isPressed ? "opacity-30" : "opacity-40")}>
                                                    {keymapLegendStyle === "blank" ? "" : mapping.shift}
                                                </span>
                                                <span className="text-lg leading-none mt-1">
                                                    {keymapLegendStyle === "blank" ? "" : mapping.base}
                                                </span>
                                            </div>
                                        ) : displayKey
                                    ) : (keymapLegendStyle === "blank" ? "" : "space")}
                                    {showNextHighlight && !isPressed && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: 'var(--mt-primary)' }} />}
                                </motion.div>
                            );
                        })}
                    </div>
                );

                return (
                    <div key={rowIndex} className={cn("flex justify-center", isSplit ? "gap-20" : "gap-0")}>
                        {renderRowContent(leftHalf, isSplit ? 'left' : undefined)}
                        {isSplit && renderRowContent(rightHalf, 'right')}
                    </div>
                );
            })}
        </div>
    );
});
Keyboard.displayName = "Keyboard";

const NK_CREAMS_SOUNDS = [
    "https://raw.githubusercontent.com/monkeytypegame/monkeytype/master/frontend/static/sound/click4/click4_1.wav",
    "https://raw.githubusercontent.com/monkeytypegame/monkeytype/master/frontend/static/sound/click4/click4_11.wav",
    "https://raw.githubusercontent.com/monkeytypegame/monkeytype/master/frontend/static/sound/click4/click4_2.wav",
    "https://raw.githubusercontent.com/monkeytypegame/monkeytype/master/frontend/static/sound/click4/click4_22.wav",
    "https://raw.githubusercontent.com/monkeytypegame/monkeytype/master/frontend/static/sound/click4/click4_3.wav",
    "https://raw.githubusercontent.com/monkeytypegame/monkeytype/master/frontend/static/sound/click4/click4_33.wav",
    "https://raw.githubusercontent.com/monkeytypegame/monkeytype/master/frontend/static/sound/click4/click4_4.wav",
    "https://raw.githubusercontent.com/monkeytypegame/monkeytype/master/frontend/static/sound/click4/click4_44.wav",
    "https://raw.githubusercontent.com/monkeytypegame/monkeytype/master/frontend/static/sound/click4/click4_5.wav",
    "https://raw.githubusercontent.com/monkeytypegame/monkeytype/master/frontend/static/sound/click4/click4_55.wav",
    "https://raw.githubusercontent.com/monkeytypegame/monkeytype/master/frontend/static/sound/click4/click4_6.wav",
    "https://raw.githubusercontent.com/monkeytypegame/monkeytype/master/frontend/static/sound/click4/click4_66.wav"
];

export default function MonkeyTypePage() {
    const mode = useMonkeyTypeStore(state => state.mode);
    const config = useMonkeyTypeStore(state => state.config);
    const language = useMonkeyTypeStore(state => state.language);
    const theme = useMonkeyTypeStore(state => state.theme);
    const stats = useMonkeyTypeStore(state => state.stats);
    const chartData = useMonkeyTypeStore(state => state.chartData);
    const timeLeft = useMonkeyTypeStore(state => state.timeLeft);
    const isActive = useMonkeyTypeStore(state => state.isActive);
    const isFinished = useMonkeyTypeStore(state => state.isFinished);
    const isWrongKeyboardLayout = useMonkeyTypeStore(state => state.isWrongKeyboardLayout);
    const zenMode = useMonkeyTypeStore(state => state.zenMode);
    const soundEnabled = useMonkeyTypeStore(state => state.soundEnabled);
    const showLiveWpm = useMonkeyTypeStore(state => state.showLiveWpm);
    const showLiveAccuracy = useMonkeyTypeStore(state => state.showLiveAccuracy);
    const showKeyboard = useMonkeyTypeStore(state => state.showKeyboard);
    const fontSize = useMonkeyTypeStore(state => state.fontSize);
    const fontFamily = useMonkeyTypeStore(state => state.fontFamily);
    const soundType = useMonkeyTypeStore(state => state.soundType);
    const soundVolume = useMonkeyTypeStore(state => state.soundVolume);
    const soundOnError = useMonkeyTypeStore(state => state.soundOnError);
    const playTimeWarning = useMonkeyTypeStore(state => state.playTimeWarning);
    const favoriteThemes = useMonkeyTypeStore(state => state.favoriteThemes);
    const punctuation = useMonkeyTypeStore(state => state.punctuation);
    const numbers = useMonkeyTypeStore(state => state.numbers);
    const customText = useMonkeyTypeStore(state => state.customText);
    const customTextByLanguage = useMonkeyTypeStore(state => state.customTextByLanguage);
    const customTextMode = useMonkeyTypeStore(state => state.customTextMode);
    const customTextLimitMode = useMonkeyTypeStore(state => state.customTextLimitMode);
    const customTextLimitValue = useMonkeyTypeStore(state => state.customTextLimitValue);
    const customTextPipeDelimiter = useMonkeyTypeStore(state => state.customTextPipeDelimiter);
    const keymapMode = useMonkeyTypeStore(state => state.keymapMode);
    const keymapStyle = useMonkeyTypeStore(state => state.keymapStyle);
    const keymapLegendStyle = useMonkeyTypeStore(state => state.keymapLegendStyle);
    const keymapSize = useMonkeyTypeStore(state => state.keymapSize);
    const keymapLayout = useMonkeyTypeStore(state => state.keymapLayout);
    const keymapShowTopRow = useMonkeyTypeStore(state => state.keymapShowTopRow);
    const isSearchOpen = useMonkeyTypeStore(state => state.isSearchOpen);
    const searchQuery = useMonkeyTypeStore(state => state.searchQuery);
    const selectedIndex = useMonkeyTypeStore(state => state.selectedIndex);
    const activeCommandGroup = useMonkeyTypeStore(state => state.activeCommandGroup);

    // -- Persistent Audio Engine --
    const audioCtxRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const audioBuffersRef = useRef<{ [url: string]: AudioBuffer }>({});

    // Pre-load audio samples
    useEffect(() => {
        const loadSamples = async () => {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
            const ctx = new AudioContextClass();
            audioCtxRef.current = ctx;

            const mg = ctx.createGain();
            mg.connect(ctx.destination);
            masterGainRef.current = mg;

            // Load NK Creams
            for (const url of NK_CREAMS_SOUNDS) {
                try {
                    const response = await fetch(url);
                    const arrayBuffer = await response.arrayBuffer();
                    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
                    audioBuffersRef.current[url] = audioBuffer;
                } catch (e) {
                    console.error("Failed to load audio sample:", url, e);
                }
            }
        };

        loadSamples().catch(console.error);

        return () => {
            if (audioCtxRef.current) {
                audioCtxRef.current.close().catch(() => {});
            }
        };
    }, []);

    const {
        setIsActive, setIsFinished, setTimeLeft, setStats, setChartData, resetLiveState, addHistory,
        setMode, setConfig, setLanguage, setTheme, setIsWrongKeyboardLayout, setShowKeyboard, setSettings, toggleFavoriteTheme,
        setIsSearchOpen, setSearchQuery, setSelectedIndex, setActiveCommandGroup,
        setPunctuation, setNumbers, setZenMode,
        setKeymapMode, setKeymapStyle, setKeymapLegendStyle, setKeymapSize, setKeymapLayout, setKeymapShowTopRow
    } = useMonkeyTypeStore();

    const isZenHidden = zenMode && isActive && !isFinished;

    const [words, setWords] = useState<string[]>([]);
    const [typedWords, setTypedWords] = useState<string[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);

    const zenWordCount = useMemo(() => {
        const raw = typedWords[0] || "";
        const words = raw.trim().length > 0 ? raw.trim().split(/\s+/).length : 0;
        return /\s$/.test(raw) ? words : Math.max(0, words - 1);
    }, [typedWords]);

    useEffect(() => {
        if (mode === "zen" && currentWordIndex > words.length - 10 && words.length > 0) {
            // Add 100 more words
            const pool = language === "khmer" ? KHMER_WORD_POOL : WORD_POOL;
            const moreWords = Array.from({ length: 100 }, () => pool[Math.floor(Math.random() * pool.length)]);
            setWords([...words, ...moreWords]);
            setTypedWords([...typedWords, ...new Array(100).fill("")]);
        }
    }, [currentWordIndex, mode, words, language, typedWords, setWords, setTypedWords]);

    // -- Advance Sound System --
    const playClickSound = useCallback((forceType?: string, isPreview: boolean = false, overrideVolume?: number) => {
        if (!soundEnabled && !isPreview) return;
        const type = forceType || soundType;

        try {
            if (!audioCtxRef.current) return;
            const audioCtx = audioCtxRef.current;
            const masterGain = masterGainRef.current;
            if (!masterGain) return;

            // Resume context if suspended (autoplay policy)
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            const now = audioCtx.currentTime;
            const effectiveVolume = overrideVolume !== undefined ? overrideVolume : soundVolume;
            masterGain.gain.setValueAtTime(effectiveVolume * 25.0, now);

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
                case 'nk_creams': {
                    const randomUrl = NK_CREAMS_SOUNDS[Math.floor(Math.random() * NK_CREAMS_SOUNDS.length)];
                    const buffer = audioBuffersRef.current[randomUrl];
                    if (buffer) {
                        const source = audioCtx.createBufferSource();
                        source.buffer = buffer;
                        source.connect(masterGain);
                        source.start(now);
                    }
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
            g.gain.setValueAtTime(soundVolume * 15.0, audioCtx.currentTime);
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
            g.gain.setValueAtTime(soundVolume * 5.0, audioCtx.currentTime);
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

    const typedWordsRef = useRef(typedWords);
    const wordsRefData = useRef(words);
    const currentWordIndexRef = useRef(currentWordIndex);
    const modeRef = useRef(mode);
    const configRef = useRef(config);
    const languageRef = useRef(language);
    const themeRef = useRef(theme);

    useEffect(() => { typedWordsRef.current = typedWords; }, [typedWords]);
    useEffect(() => { wordsRefData.current = words; }, [words]);
    useEffect(() => { currentWordIndexRef.current = currentWordIndex; }, [currentWordIndex]);
    useEffect(() => { modeRef.current = mode; }, [mode]);
    useEffect(() => { configRef.current = config; }, [config]);
    useEffect(() => { languageRef.current = language; }, [language]);
    useEffect(() => { themeRef.current = theme; }, [theme]);



    const statsRef = useRef(stats);
    const startTimeRef = useRef<number | null>(null);
    const chartDataRef = useRef<ChartPoint[]>([]);
    const lastErrorCountRef = useRef(0);
    useEffect(() => { statsRef.current = stats; }, [stats]);
    useEffect(() => { startTimeRef.current = startTime; }, [startTime]);

    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const keystrokeTimes = useRef<number[]>([]);
    const lastKeystrokeTime = useRef<number>(Date.now());
    const wordsRef = useRef<HTMLDivElement>(null);
    const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const extraCharRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const restartRef = useRef<HTMLButtonElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const zenCharRefs = useRef<(HTMLSpanElement | null)[]>([]);

    const [hasMounted, setHasMounted] = useState(false);
    const wasTabPressedRef = useRef(false);
    const isCheatDetected = useRef(false);
    const lastKeystrokeIntervals = useRef<number[]>([]);
    useEffect(() => { setHasMounted(true); }, []);

    // Clear Refs when word changes to avoid stale positioning
    useEffect(() => {
        extraCharRefs.current = [];
    }, [currentWordIndex, words]);

    const activeTheme = THEMES[theme] || THEMES.codex;


    const targetText = useMemo(() => {
        return words.join(" ");
    }, [words]);

    const isCustomTimed = mode === "custom" && customTextLimitMode === "time" && customTextLimitValue > 0;
    const languageCustomText = customTextByLanguage?.[language] ?? (language === "english" ? customText : "");

    const tokenizeCustomText = useCallback((raw: string, lang: Language, pipeDelimiter: boolean) => {
        if (pipeDelimiter) {
            return raw.split("|").map(w => w.trim()).filter(Boolean);
        }

        const hasWhitespace = /\s/.test(raw);
        if (hasWhitespace) {
            return raw.trim().split(/\s+/).filter(Boolean);
        }

        if (lang === "khmer" && typeof Intl !== "undefined" && "Segmenter" in Intl) {
            try {
                const seg = new Intl.Segmenter("km", { granularity: "word" });
                const pieces = Array.from(seg.segment(raw))
                    .map((s: { segment: string }) => s.segment.trim())
                    .filter(Boolean);
                if (pieces.length > 0) return pieces;
            } catch {
                // Fallback below.
            }
        }

        return raw.trim().length > 0 ? [raw.trim()] : [];
    }, []);

    const buildCustomWords = useCallback((raw: string, targetLang: Language) => {
        const splitWords = tokenizeCustomText(raw, targetLang, customTextPipeDelimiter);

        const baseWords = splitWords;
        if (baseWords.length === 0) return [];
        const modeSetting = customTextMode === "simple" ? "repeat" : customTextMode;
        const limitSetting = customTextMode === "simple"
            ? (customTextPipeDelimiter ? "section" : "word")
            : customTextLimitMode;
        const limitValue = (customTextMode === "simple" && customTextLimitValue === 0) ? baseWords.length : customTextLimitValue;

        const defaultCount = 300;
        const boundedCount = (limitSetting === "word" || limitSetting === "section")
            ? (limitValue > 0 ? limitValue : defaultCount)
            : defaultCount;

        const shuffle = (arr: string[]) => {
            const copy = [...arr];
            for (let i = copy.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [copy[i], copy[j]] = [copy[j], copy[i]];
            }
            return copy;
        };

        if (modeSetting === "random") {
            return Array.from({ length: boundedCount }, () => baseWords[Math.floor(Math.random() * baseWords.length)]);
        }

        if (modeSetting === "shuffle") {
            const output: string[] = [];
            while (output.length < boundedCount) {
                output.push(...shuffle(baseWords));
            }
            return output.slice(0, boundedCount);
        }

        const output: string[] = [];
        for (let i = 0; i < boundedCount; i++) {
            output.push(baseWords[i % baseWords.length]);
        }
        return output;
    }, [tokenizeCustomText, customTextPipeDelimiter, customTextMode, customTextLimitMode, customTextLimitValue]);

    const generateWords = useCallback((newMode?: GameMode, newConfig?: GameConfig, newLang?: Language) => {
        const targetMode = newMode || mode;
        const targetConfig = newConfig || config;
        const targetLang = newLang || language;

        if (targetMode === "zen") {
            setWords([]);
            setTypedWords([""]);
            setCurrentWordIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
            return;
        }

        if (targetMode === "custom") {
            const generated = buildCustomWords(languageCustomText, targetLang);
            if (generated.length === 0) {
                setWords([""]);
                setTypedWords([""]);
                setCurrentWordIndex(0);
                return;
            }
            setWords(generated);
            setTypedWords(new Array(generated.length).fill(""));
            setCurrentWordIndex(0);
            return;
        }

        const count = targetMode === "words" ? (targetConfig as number) : 300;
        const generated: string[] = [];
        let pool = targetLang === "khmer" ? KHMER_WORD_POOL : WORD_POOL;

        // Apply punctuation and numbers if enabled
        if (targetLang === "english") {
            if (numbers) {
                const numPool = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
                pool = [...pool, ...numPool];
            }
            if (punctuation) {
                const punctPool = [".", ",", "!", "?", ";", ":", "-", "(", ")", "\"", "'"];
                pool = [...pool, ...punctPool];
            }
        }

        for (let i = 0; i < count; i++) {
            generated.push(pool[Math.floor(Math.random() * pool.length)]);
        }
        setWords(generated);
        setTypedWords(new Array(generated.length).fill(""));
        setCurrentWordIndex(0);
    }, [mode, config, language, punctuation, numbers, languageCustomText, buildCustomWords, setWords]);


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

        const s = statsRef.current;
        const elapsedMs = Date.now() - (startTimeRef.current || Date.now());
        const durationSeconds = Math.floor(elapsedMs / 1000);

        // Final accuracy and stats check
        let correct = 0;
        let incorrect = 0;
        let extra = 0;
        let missed = 0;
        let totalTyped = 0;

        if (modeRef.current === "zen") {
            const typed = typedWordsRef.current[0] || "";
            totalTyped = typed.length;
            correct = typed.length;
            incorrect = 0;
            extra = 0;
            missed = 0;
        } else {
            typedWordsRef.current.forEach((typed, idx) => {
                const target = wordsRefData.current[idx];
                if (!target) return;
                
                totalTyped += typed.length;
                const maxLen = Math.max(typed.length, target.length);
                
                for (let i = 0; i < maxLen; i++) {
                    if (i < target.length) {
                        if (i < typed.length) {
                            if (typed[i] === target[i]) correct++;
                            else incorrect++;
                        } else {
                            // All remaining characters in words (even current one) are missed on finish
                            missed++;
                        }
                    } else if (i < typed.length) {
                        extra++;
                    }
                }
            });
        }

        const finalWpm = calculateWPM(correct, elapsedMs);
        const finalAccuracy = totalTyped > 0 ? Math.round((correct / (correct + incorrect + extra)) * 100) : 100;

        addHistory({
            wpm: finalWpm,
            rawWpm: s.rawWpm,
            accuracy: finalAccuracy,
            mode: modeRef.current,
            config: configRef.current,
            language: languageRef.current,
            theme: themeRef.current,
            consistency: s.consistency,
            duration: durationSeconds,
            afk: s.afk,
            missedChars: missed
        });

        saveTypingResult({
            wpm: finalWpm,
            rawWpm: s.rawWpm,
            accuracy: finalAccuracy,
            consistency: s.consistency,
            mode: modeRef.current,
            config: configRef.current,
            language: languageRef.current,
            theme: themeRef.current,
            duration: durationSeconds,
            missedChars: missed,
            afk: s.afk,
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
    }, [addHistory, setIsActive, setIsFinished, setGhost, setXpResult]);


    const finishTestRef = useRef(finishTest);
    useEffect(() => {
        finishTestRef.current = finishTest;
    }, [finishTest]);

    useEffect(() => {
        generateWords();
    }, [generateWords]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | undefined;
        if (isActive && (mode === "time" || isCustomTimed) && timeLeft > 0) {
            interval = setInterval(() => {
                const nextTime = useMonkeyTypeStore.getState().timeLeft - 1;
                setTimeLeft(nextTime);
                const warningTime = typeof playTimeWarning === 'string' && playTimeWarning !== 'off' ? parseInt(playTimeWarning) : (typeof playTimeWarning === 'number' ? playTimeWarning : (playTimeWarning === true ? 10 : null));
                // if (warningTime !== null && nextTime === warningTime) playWarningSound();
            }, 1000);
        } else if ((mode === "time" || isCustomTimed) && timeLeft === 0) {
            finishTestRef.current();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft === 0, mode, isCustomTimed, setTimeLeft]);

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


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        // Anti-cheat
        if (!e.nativeEvent.isTrusted) {
            isCheatDetected.current = true;
        }

        const rawValue = e.target.value;
        if (!isActive && !isFinished && rawValue.length > 0) startTest();
        if (isFinished) return;

        // Monkeytype Logic:
        // The input is always compared to the current word.
        // If Space is pressed, we move to the next word.
        // If Backspace is pressed and current word is empty, we go back to prev word if it was wrong.

        const lastChar = rawValue[rawValue.length - 1];
        const isSpace = lastChar === " ";
        
        let newTypedWords = [...typedWords];
        let newIndex = currentWordIndex;

        if (mode === "zen") {
            // Zen mode: Free typing, no space advancement
            newTypedWords[0] = rawValue;
            playClickSound();
            setTypedWords(newTypedWords);
            
            // Track keystroke time
            const now = Date.now();
            const interval = now - lastKeystrokeTime.current;
            lastKeystrokeIntervals.current.push(interval);
            keystrokeTimes.current.push(now);
            lastKeystrokeTime.current = now;

            // Stats for Zen: just total chars
            const elapsedMs = now - (startTime || now);
            const wpm = calculateWPM(rawValue.length, elapsedMs);
            const rawWpm = calculateWPM(rawValue.length, elapsedMs);

            setStats({
                ...stats,
                totalChars: rawValue.length,
                correctChars: rawValue.length, // In Zen, every char is 'correct'
                wpm,
                rawWpm,
                accuracy: 100, // Zen is always 100% since no target
            });
            return;
        }

        if (isSpace) {
            // Space pressed: move to next word
            // BLOCKER: Only advance if the current word is complete (matches length or longer)
            const targetWord = words[newIndex];
            const currentTyped = newTypedWords[newIndex];
            
            if (currentTyped.length === 0) {
                // Empty word - block spacebar
                if (inputRef.current) {
                    inputRef.current.value = ""; 
                }
                return;
            }

            // Only advance if something was typed in the current word OR if it's not the first word
            if (newIndex < words.length - 1) {
                newIndex++;
                playClickSound();
                
                // Direct input clearing for the next word
                if (inputRef.current) inputRef.current.value = "";
                
                // Reset extra refs for the new active word to prevent caret jumps
                extraCharRefs.current = [];
            } else {
                finishTest();
                return;
            }
        } else {
            // Regular character or backspace
            newTypedWords[newIndex] = rawValue;
            playClickSound();
        }

        setTypedWords(newTypedWords);
        setCurrentWordIndex(newIndex);

        // Track keystroke time
        const now = Date.now();
        const interval = now - lastKeystrokeTime.current;
        lastKeystrokeIntervals.current.push(interval);
        keystrokeTimes.current.push(now);
        lastKeystrokeTime.current = now;

        // Calculate live stats across all words
        let correct = 0;
        let incorrect = 0;
        let extra = 0;
        let totalTyped = 0;

        newTypedWords.forEach((typed, idx) => {
            const target = words[idx];
            if (!target) return;
            
            totalTyped += typed.length;
            for (let i = 0; i < Math.max(typed.length, target.length); i++) {
                if (i < target.length) {
                    if (i < typed.length) {
                        if (typed[i] === target[i]) correct++;
                        else incorrect++;
                    }
                } else if (i < typed.length) {
                    extra++;
                }
            }
        });

        const elapsedMs = now - (startTime || now);
        const wpm = calculateWPM(correct, elapsedMs);
        const rawWpm = calculateWPM(totalTyped, elapsedMs);

        setStats({
            ...stats,
            correctChars: correct,
            incorrectChars: incorrect,
            extraChars: extra,
            totalChars: totalTyped,
            wpm,
            rawWpm,
            accuracy: totalTyped > 0 ? Math.round((correct / (correct + incorrect + extra)) * 100) : 100,
        });

        // Trigger error sound if error introduced
        if (!isSpace && rawValue.length > (typedWords[currentWordIndex]?.length || 0)) {
            const lastIdx = rawValue.length - 1;
            const target = words[currentWordIndex];
            const isError = lastIdx >= target.length || rawValue[lastIdx] !== target[lastIdx];
            // if (isError) playErrorSound();
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
        setCurrentWordIndex(0);
        if (inputRef.current) inputRef.current.value = "";
        setStartTime(null);
        keystrokeTimes.current = [];
        setActiveKeys(new Set());
        setErrorKey(null);
        const defaultTime = targetMode === "time"
            ? (targetConfig as number)
            : (targetMode === "custom" && customTextLimitMode === "time" && customTextLimitValue > 0 ? customTextLimitValue : 30);
        resetLiveState(defaultTime);
        setLineOffset(0);
        setCaretPos({ top: 0, left: 0 });
        setGhost(null); // Clear ghost on reset
        setGhostPos({ top: 0, left: 0, charIndex: 0 });
        isCheatDetected.current = false;
        lastKeystrokeIntervals.current = [];
        setXpResult(null);
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [generateWords, resetLiveState, customTextLimitMode, customTextLimitValue]);

    
    const wasFinished = useRef(isFinished);
    const wasActive = useRef(isActive);
    useEffect(() => {
        // Reset test if we transitioned FROM finished/active TO home state
        // (This happens when clicking the logo/home icon in the header or using shortcuts)
        const transitionFromFinished = wasFinished.current && !isFinished;
        const transitionFromActiveReset = wasActive.current && !isActive && !isFinished;

        if (hasMounted && (transitionFromFinished || transitionFromActiveReset)) {
            resetTest();
        }
        wasFinished.current = isFinished;
        wasActive.current = isActive;
    }, [hasMounted, isFinished, isActive, resetTest]);

    // Sync timeLeft to config on initial load (hydration fix)
    useEffect(() => {
        if (!hasMounted || isActive || isFinished) return;
        if (mode === "time" && timeLeft !== config) {
            setTimeLeft(config as number);
            return;
        }
        if (isCustomTimed && timeLeft !== customTextLimitValue) {
            setTimeLeft(customTextLimitValue);
        }
    }, [hasMounted, isActive, isFinished, mode, timeLeft, config, isCustomTimed, customTextLimitValue, setTimeLeft]);

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
            list.push({ id: "action-restart", label: "Restart Test", category: "Action", icon: <RotateCcw className="w-4 h-4 opacity-70" />, action: () => resetTest() });

            // Configuration Groups
            list.push({ id: "group-sound-click", label: "Sound on Click...", category: "Sound", icon: <Music className="w-4 h-4 opacity-70" />, action: () => { setActiveCommandGroup('sound-click'); setSelectedIndex(0); setSearchQuery(""); } });
            list.push({ id: "group-sound-volume", label: "Sound on Volume...", category: "Sound", icon: <Volume2 className="w-4 h-4 opacity-70" />, action: () => { setActiveCommandGroup('sound-volume'); setSelectedIndex(0); setSearchQuery(""); } });
            list.push({ id: "group-sound-error", label: "Sound on Error...", category: "Sound", icon: <VolumeX className="w-4 h-4 opacity-70" />, action: () => { setActiveCommandGroup('sound-error'); setSelectedIndex(0); setSearchQuery(""); } });
            list.push({ id: "group-time-warning", label: "Play Time Warning...", category: "Sound", icon: <Bell className="w-4 h-4 opacity-70" />, action: () => { setActiveCommandGroup('time-warning'); setSelectedIndex(0); setSearchQuery(""); } });

            // Core Settings
            list.push({ id: "mode-time", label: "Time Mode", category: "Mode", icon: <Timer className="w-4 h-4 opacity-70" />, action: () => { setMode("time"); setConfig(30); resetTest(); setIsSearchOpen(false); } });
            list.push({ id: "mode-words", label: "Words Mode", category: "Mode", icon: <Type className="w-4 h-4 opacity-70" />, action: () => { setMode("words"); setConfig(25); resetTest(); setIsSearchOpen(false); } });

            // Languages
            list.push({ id: "lang-en", label: "English", category: "Language", icon: <Globe className="w-4 h-4 opacity-70" />, action: () => { setLanguage("english"); resetTest(); setIsSearchOpen(false); } });
            list.push({ id: "lang-km", label: "Khmer", category: "Language", icon: <Globe className="w-4 h-4 opacity-70" />, action: () => { setLanguage("khmer"); resetTest(); setIsSearchOpen(false); } });

            const isFav = favoriteThemes.includes(theme);
            list.push({ 
                id: "action-theme-favorite", 
                label: isFav ? "Remove Current theme from favorite" : "Add Current theme to favorite", 
                category: "Theme", 
                icon: <Star className={cn("w-4 h-4", isFav ? "fill-current text-[#e2b714]" : "opacity-70")} />,
                action: () => { toggleFavoriteTheme(theme); setIsSearchOpen(false); } 
            });

            list.push({ 
                id: "action-toggle-zen", 
                label: zenMode ? "Disable Zen Mode" : "Enable Zen Mode", 
                category: "Action", 
                icon: <FaMountain className="w-4 h-4 opacity-70" />,
                isActive: zenMode === true,
                action: () => { setZenMode(!zenMode); setIsSearchOpen(false); } 
            });

            // Themes
            list.push({ id: "group-theme-select", label: "Theme...", category: "Theme", icon: <Palette className="w-4 h-4 opacity-70" />, action: () => { setActiveCommandGroup('theme-select'); setSelectedIndex(0); setSearchQuery(""); } });
            list.push({ id: "action-theme-custom", label: "Custom theme...", category: "Theme", icon: <Palette className="w-4 h-4 opacity-70" />, action: () => { setIsSearchOpen(false); } });
            
            list.push({ 
                id: "action-theme-random", 
                label: "Random theme...", 
                category: "Theme", 
                icon: <Zap className="w-4 h-4 opacity-70" />,
                action: () => { 
                    const themeKeys = Object.keys(THEMES) as Theme[];
                    const randomTheme = themeKeys[Math.floor(Math.random() * themeKeys.length)];
                    setTheme(randomTheme); 
                    setIsSearchOpen(false); 
                } 
            });

            list.push({ 
                id: "keyboard-mode-on", 
                label: "keymap mode > on", 
                category: "Action", 
                icon: <LucideKeyboard className="w-4 h-4 opacity-70" />,
                isActive: showKeyboard === true,
                action: () => { setShowKeyboard(true); setIsSearchOpen(false); } 
            });
            list.push({ 
                id: "keyboard-mode-off", 
                label: "keymap mode > off", 
                category: "Action", 
                icon: <LucideKeyboard className="w-4 h-4 opacity-70" />,
                isActive: showKeyboard === false,
                action: () => { setShowKeyboard(false); setIsSearchOpen(false); } 
            });

            // Keymap Groups
            list.push({ id: "group-keymap-mode", label: "Keymap Mode...", category: "Keyboard", icon: <LucideKeyboard className="w-4 h-4 opacity-70" />, action: () => { setActiveCommandGroup('keymap-mode'); setSelectedIndex(0); setSearchQuery(""); } });
            list.push({ id: "group-keymap-style", label: "Keymap Style...", category: "Keyboard", icon: <LucideKeyboard className="w-4 h-4 opacity-70" />, action: () => { setActiveCommandGroup('keymap-style'); setSelectedIndex(0); setSearchQuery(""); } });
            list.push({ id: "group-keymap-legend", label: "Keymap Legend Style...", category: "Keyboard", icon: <LucideKeyboard className="w-4 h-4 opacity-70" />, action: () => { setActiveCommandGroup('keymap-legend'); setSelectedIndex(0); setSearchQuery(""); } });
            list.push({ id: "group-keymap-size", label: "Keymap Size...", category: "Keyboard", icon: <LucideKeyboard className="w-4 h-4 opacity-70" />, action: () => { setActiveCommandGroup('keymap-size'); setSelectedIndex(0); setSearchQuery(""); } });
            list.push({ id: "group-keymap-layout", label: "Keymap Layout...", category: "Keyboard", icon: <LucideKeyboard className="w-4 h-4 opacity-70" />, action: () => { setActiveCommandGroup('keymap-layout'); setSelectedIndex(0); setSearchQuery(""); } });
            list.push({ id: "group-keymap-toprow", label: "Keymap Show Top Row...", category: "Keyboard", icon: <LucideKeyboard className="w-4 h-4 opacity-70" />, action: () => { setActiveCommandGroup('keymap-toprow'); setSelectedIndex(0); setSearchQuery(""); } });

            // Direct Sound Access
            list.push({ 
                id: "sound-nk_creams-direct", 
                label: "sound > nk creams", 
                category: "Sound", 
                icon: <Music className="w-4 h-4 opacity-70" />, 
                isActive: soundType === 'nk_creams',
                action: () => { setSettings({ soundType: 'nk_creams', soundEnabled: true }); setIsSearchOpen(false); } 
            });
        } else if (activeCommandGroup === 'sound-click') {
            // Click Sounds Sub-menu
            const soundTypes = [
                { id: 'mechanical', label: 'Mechanical' },
                { id: 'cherry_blue', label: 'Cherry MX Blue' },
                { id: 'cherry_brown', label: 'Cherry MX Brown' },
                { id: 'cherry_red', label: 'Cherry MX Red' },
                { id: 'nk_creams', label: 'NK Creams' },
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
        } else if (activeCommandGroup === 'keymap-mode') {
            const modes: { id: KeymapMode, label: string }[] = [
                { id: 'off', label: 'Off' },
                { id: 'static', label: 'Static' },
                { id: 'react', label: 'React' },
                { id: 'next', label: 'Next' }
            ];
            modes.forEach(m => list.push({
                id: `keymap-mode-${m.id}`,
                label: m.label,
                category: "Keymap Mode",
                icon: <LucideKeyboard className="w-4 h-4 opacity-70" />,
                isActive: keymapMode === m.id,
                action: () => { setKeymapMode(m.id); setIsSearchOpen(false); setActiveCommandGroup(null); }
            }));
        } else if (activeCommandGroup === 'keymap-style') {
            const styles: { id: KeymapStyle, label: string }[] = [
                { id: 'staggered', label: 'Staggered' },
                { id: 'alice', label: 'Alice' },
                { id: 'matrix', label: 'Matrix' },
                { id: 'split', label: 'Split' },
                { id: 'split_matrix', label: 'Split Matrix' },
                { id: 'steno', label: 'Steno' },
                { id: 'steno_matrix', label: 'Steno Matrix' }
            ];
            styles.forEach(s => list.push({
                id: `keymap-style-${s.id}`,
                label: s.label,
                category: "Keymap Style",
                icon: <LucideKeyboard className="w-4 h-4 opacity-70" />,
                isActive: keymapStyle === s.id,
                action: () => { setKeymapStyle(s.id); setIsSearchOpen(false); setActiveCommandGroup(null); }
            }));
        } else if (activeCommandGroup === 'keymap-legend') {
            const legends: { id: KeymapLegendStyle, label: string }[] = [
                { id: 'lowercase', label: 'Lowercase' },
                { id: 'uppercase', label: 'Uppercase' },
                { id: 'blank', label: 'Blank' },
                { id: 'dynamic', label: 'Dynamic' }
            ];
            legends.forEach(l => list.push({
                id: `keymap-legend-${l.id}`,
                label: l.label,
                category: "Keymap Legend",
                icon: <LucideKeyboard className="w-4 h-4 opacity-70" />,
                isActive: keymapLegendStyle === l.id,
                action: () => { setKeymapLegendStyle(l.id); setIsSearchOpen(false); setActiveCommandGroup(null); }
            }));
        } else if (activeCommandGroup === 'keymap-size') {
            const sizes = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
            sizes.forEach(s => list.push({
                id: `keymap-size-${s}`,
                label: `${s}x`,
                category: "Keymap Size",
                icon: <LucideKeyboard className="w-4 h-4 opacity-70" />,
                isActive: keymapSize === s,
                action: () => { setKeymapSize(s); setIsSearchOpen(false); setActiveCommandGroup(null); }
            }));
        } else if (activeCommandGroup === 'keymap-layout') {
            const layouts = ['qwerty', 'dvorak', 'colemak', 'workman', 'qwertz', 'azerty'];
            layouts.forEach(l => list.push({
                id: `keymap-layout-${l}`,
                label: l,
                category: "Keymap Layout",
                icon: <LucideKeyboard className="w-4 h-4 opacity-70" />,
                isActive: keymapLayout === l,
                action: () => { setKeymapLayout(l); setIsSearchOpen(false); setActiveCommandGroup(null); }
            }));
        } else if (activeCommandGroup === 'keymap-toprow') {
            const topRows: { id: KeymapShowTopRow, label: string }[] = [
                { id: 'always', label: 'Always' },
                { id: 'layout_dependent', label: 'Layout Dependent' },
                { id: 'never', label: 'Never' }
            ];
            topRows.forEach(tr => list.push({
                id: `keymap-toprow-${tr.id}`,
                label: tr.label,
                category: "Keymap Top Row",
                icon: <LucideKeyboard className="w-4 h-4 opacity-70" />,
                isActive: keymapShowTopRow === tr.id,
                action: () => { setKeymapShowTopRow(tr.id); setIsSearchOpen(false); setActiveCommandGroup(null); }
            }));

        }
        return list;
    }, [activeCommandGroup, soundOnError, playTimeWarning, resetTest, setSettings, setTheme, setMode, setConfig, setLanguage, language, favoriteThemes, theme, toggleFavoriteTheme, showKeyboard, setShowKeyboard,
        keymapMode, keymapStyle, keymapLegendStyle, keymapSize, keymapLayout, keymapShowTopRow,
        setKeymapMode, setKeymapStyle, setKeymapLegendStyle, setKeymapSize, setKeymapLayout, setKeymapShowTopRow
    ]);

    const filteredCommands = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return commands;
        return commands.filter(c => c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
    }, [commands, searchQuery]);

    useEffect(() => {
        setSelectedIndex(Math.min(selectedIndex, Math.max(0, filteredCommands.length - 1)));
    }, [selectedIndex, filteredCommands.length]);

    useEffect(() => {
        if (isSearchOpen) {
            const item = document.getElementById(`cmd-item-${selectedIndex}`);
            if (item) {
                item.scrollIntoView({ block: 'nearest', behavior: 'auto' });
            }
        }
    }, [selectedIndex, isSearchOpen]);

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
                    if (filteredCommands.length === 0) return;
                    const nextIndex = (selectedIndex + 1) % filteredCommands.length;
                    setSelectedIndex(nextIndex);
                    
                    const cmd = filteredCommands[nextIndex];
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
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    if (filteredCommands.length === 0) return;
                    const prevIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
                    setSelectedIndex(prevIndex);
                    
                    const cmd = filteredCommands[prevIndex];
                    if (cmd.category === "Click Sound") {
                        const soundId = cmd.id.replace('sound-', '');
                        playClickSound(soundId, true);
                    } else if (cmd.category === "Volume") {
                        playClickSound(undefined, true);
                    } else if (cmd.category === "Error Sound") {
                        const errorId = cmd.id.replace('sound-error-', '');
                        playErrorSound(errorId, true);
                    } else if (cmd.category === "Time Warning") {
                        playWarningSound(true);
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
            } else if (e.key === "Backspace") {
                // Logic to handle backspacing into previous word if incorrect
                const currentTyped = typedWordsRef.current[currentWordIndexRef.current] || "";
                if (currentTyped === "" && currentWordIndexRef.current > 0) {
                    const prevIdx = currentWordIndexRef.current - 1;
                    const prevTyped = typedWordsRef.current[prevIdx];
                    const prevTarget = wordsRefData.current[prevIdx];
                    if (prevTyped !== prevTarget) {
                        e.preventDefault();
                        setCurrentWordIndex(prevIdx);
                        if (inputRef.current) {
                            inputRef.current.value = prevTyped;
                        }
                    }
                }
            } else if (!e.ctrlKey && !e.altKey && !e.metaKey && !["Tab", "Enter", "Escape", "Backspace", "Control", "Alt", "Meta"].includes(e.key)) {
                if (document.activeElement !== inputRef.current) {
                    inputRef.current?.focus();
                }

                const currentTyped = typedWordsRef.current[currentWordIndexRef.current] || "";
                const expectedWord = wordsRefData.current[currentWordIndexRef.current];
                const expectedChar = expectedWord?.[currentTyped.length];
                let isIncorrect = false;

                if (expectedChar === undefined) {
                    isIncorrect = true; // Overtyping
                } else if (language === "english") {
                    if (originalKey.toLowerCase() !== expectedChar.toLowerCase()) isIncorrect = true;
                } else { // Khmer
                    if (originalKey !== expectedChar) isIncorrect = true;
                    if (expectedChar === " " && !e.shiftKey) isIncorrect = true;
                }

                if (key === " ") {
                    setActiveKeys(prev => {
                        const next = new Set(prev);
                        next.add("space");
                        return next;
                    });
                    // In Monkeytype, space marks the word as done.
                    setErrorKey(null);
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
    }, [isSearchOpen, filteredCommands, selectedIndex, language, isFinished, resetTest, setIsWrongKeyboardLayout, words, typedWords, currentWordIndex]);


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
        if (mode !== "zen") return;
        
        const text = typedWords[0] || "";
        const globalIdx = text.length;

        const targetEl = zenCharRefs.current[globalIdx];
        if (targetEl && wordsRef.current) {
            const rect = targetEl.getBoundingClientRect();
            const containerRect = wordsRef.current.getBoundingClientRect();
            setCaretPos({
                top: rect.top - containerRect.top,
                left: rect.left - containerRect.left
            });

            // Handle scrolling for Zen mode
            const lineHeightVal = language === "khmer" ? 58 : (fontSize * 1.6);
            const relativeTop = rect.top - containerRect.top + lineOffset;
            if (relativeTop > lineHeightVal * 1.5) {
                setLineOffset(prev => prev - lineHeightVal);
            } else if (relativeTop < 0) {
                setLineOffset(0); 
            }
        }
    }, [mode, typedWords, lineOffset, fontSize, language]);

    useEffect(() => {
        if (mode === "zen") return;
        const currentTyped = typedWords[currentWordIndex] || "";
        const currentWordGroup = wordGroups[currentWordIndex];
        
        if (!currentWordGroup) return;

        // Find the active cluster relative to this word
        let activeClusterIndexInWord = 0;
        let runningLength = 0;
        for (let i = 0; i < currentWordGroup.length; i++) {
            const clusterIdx = currentWordGroup[i];
            const cluster = clusters[clusterIdx];
            if (currentTyped.length >= runningLength) {
                activeClusterIndexInWord = i;
            }
            runningLength += cluster.length;
        }

        const globalClusterIdx = currentWordGroup[activeClusterIndexInWord];
        
        const targetLen = words[currentWordIndex]?.length || 0;
        const currentLen = currentTyped.length;

        // Handle caret position for overtyping
        if (currentLen > targetLen) {
            const extraIdx = currentLen - targetLen - 1;
            const extraEl = extraCharRefs.current[extraIdx];
            if (extraEl && wordsRef.current) {
                const rect = extraEl.getBoundingClientRect();
                const containerRect = wordsRef.current.getBoundingClientRect();
                setCaretPos({
                    top: rect.top - containerRect.top,
                    left: rect.right - containerRect.left
                });
                return;
            }
        } else if (currentLen === targetLen && targetLen > 0) {
            // End of word - position caret after the last character
            const lastClusterIdx = currentWordGroup[currentWordGroup.length - 1];
            const lastCharEl = charRefs.current[lastClusterIdx];
            if (lastCharEl && wordsRef.current) {
                const rect = lastCharEl.getBoundingClientRect();
                const containerRect = wordsRef.current.getBoundingClientRect();
                setCaretPos({
                    top: rect.top - containerRect.top,
                    left: rect.right - containerRect.left
                });
                return;
            }
        }

        // Start of word or middle of word
        const activeCharElement = charRefs.current[globalClusterIdx];
        if (activeCharElement && wordsRef.current) {
            const charRect = activeCharElement.getBoundingClientRect();
            const containerRect = wordsRef.current.getBoundingClientRect();

            const lineHeightVal = language === "khmer" ? 58 : (fontSize * 1.6);
            
            // Direct immediate position update
            setCaretPos({
                top: charRect.top - containerRect.top,
                left: charRect.left - containerRect.left
            });

            // Proactive Scrolling
            const relativeTop = charRect.top - containerRect.top + lineOffset;
            if (relativeTop > lineHeightVal * 1.1) {
                setLineOffset(prev => prev - lineHeightVal);
            } else if (relativeTop < 0 && currentWordIndex > 0) {
                setLineOffset(prev => prev + lineHeightVal);
            }
        }
    }, [typedWords, currentWordIndex, wordGroups, clusters, lineOffset, fontSize, language, words, charRefs, extraCharRefs]);


    if (!hasMounted) {
        return (
            <div className="min-h-screen theme-transition flex flex-col items-center justify-center transition-colors duration-500" style={{ backgroundColor: THEMES.codex.bg }} suppressHydrationWarning>
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
                "flex-1 w-full flex flex-col items-center justify-between overflow-hidden select-none theme-transition",
                "pt-1 sm:pt-1.5 md:pt-3 px-[var(--content-px)] pb-1 sm:pb-2 md:pb-4",
                language === "khmer" ? "font-sans font-medium" : "font-roboto"
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

            {/* Local Command Palette */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[100] flex items-start justify-center backdrop-blur-[4px] px-4 pt-[110px]"
                        style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
                        onClick={() => setIsSearchOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ 
                                type: "spring", 
                                stiffness: 400, 
                                damping: 30, 
                                mass: 0.8 
                            }}
                            className="w-full max-w-[600px] rounded-[12px] overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5"
                            style={{ backgroundColor: activeTheme.bg }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center px-6 py-4">
                                <Search className="w-5 h-5 mr-3 shrink-0" style={{ color: activeTheme.textDim, opacity: 0.5 }} />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="type to search"
                                    className="w-full bg-transparent border-none outline-none py-1 text-base placeholder-current font-mono"
                                    style={{ color: activeTheme.text, opacity: searchQuery ? 1 : 0.5 }}
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
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto pb-8 custom-scrollbar">
                                {searchQuery.trim() === '' && !activeCommandGroup ? (
                                    <div className="px-8 py-4 opacity-50" style={{ color: activeTheme.textDim }}>
                                        <div className="text-sm">
                                            Type to search commands
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
                                            id={`cmd-item-${i}`}
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
                                                "px-8 py-2.5 flex items-center justify-between cursor-pointer transition-colors duration-150",
                                                i === selectedIndex ? "bg-opacity-100" : "bg-transparent"
                                            )}
                                            style={{ 
                                                backgroundColor: i === selectedIndex ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                color: i === selectedIndex ? activeTheme.text : activeTheme.textDim,
                                            }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center justify-center w-6 shrink-0">
                                                    {cmd.icon ? (
                                                        React.cloneElement(cmd.icon as any, { size: 16, className: cn((cmd.icon as any).props.className, "shrink-0") })
                                                    ) : (
                                                        cmd.category === 'Theme' && (
                                                            <div className="flex gap-1">
                                                                {(() => {
                                                                    const t = THEMES[cmd.id.replace('theme-', '') as Theme];
                                                                    return t ? (
                                                                        <>
                                                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.primary }} />
                                                                        </>
                                                                    ) : null;
                                                                })()}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                                <span className="text-sm font-bold">{cmd.label}</span>
                                                {cmd.isActive && (
                                                    <Check className="w-4 h-4 ml-1" />
                                                )}
                                            </div>
                                            <span className="text-[10px] opacity-30 uppercase tracking-[0.1em] font-black">
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
                                <AuthenticKeyboard className="w-5 h-5" />
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

            <div className="w-full flex-none pt-4 flex justify-center z-[5]">
                <ConfigurationBar />
            </div>

            <AnimatePresence mode="wait">
                {!isFinished ? (
                    <motion.div
                        key="game"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-full max-w-[var(--content-max-w)] flex-1 flex flex-col justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 min-h-0"
                    >

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
                                            <FaLock size={16} />
                                            <span>Caps Lock</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {!isZenHidden && (isActive || isFinished) && (
                                        <motion.div
                                            key="hud-animation"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.13 }}
                                            className="h-10 flex justify-start items-center gap-6 px-1 sm:px-4"
                                        >
                                            <div className="text-3xl font-bold transition-colors duration-500" style={{ color: activeTheme.primary }}>
                                                {(mode === "time" || isCustomTimed) ? timeLeft : mode === "zen" ? zenWordCount : `${currentWordIndex}/${mode === "custom" ? words.length : config}`}
                                            </div>
                                            {showLiveWpm && stats.wpm > 0 && (
                                                <div className="text-xl font-bold transition-colors duration-500" style={{ color: activeTheme.text }}>
                                                    {stats.wpm} <span className="text-xs opacity-50 uppercase tracking-widest">wpm</span>
                                                </div>
                                            )}
                                            {showLiveAccuracy && stats.accuracy > 0 && (
                                                <div className="text-xl font-bold transition-colors duration-500" style={{ color: activeTheme.textDim }}>
                                                    {stats.accuracy}<span className="text-xs opacity-50">%</span>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

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
                                            transition={(typedWords[0]?.length || 0) === 0 ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
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
                                                initial={{ opacity: 1 }}
                                                animate={{ 
                                                    top: caretPos.top, 
                                                    left: caretPos.left,
                                                    opacity: isActive ? 1 : [1, 0, 1] 
                                                }}
                                                transition={{
                                                    top: (typedWords[0]?.length || 0) === 0 ? { duration: 0 } : { type: "tween", duration: 0.1, ease: "linear" },
                                                    left: (typedWords[0]?.length || 0) === 0 ? { duration: 0 } : { type: "tween", duration: 0.1, ease: "linear" },
                                                    opacity: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                                                }}
                                                className={cn(
                                                    "absolute w-[2.5px] rounded-full z-10 pointer-events-none will-change-transform",
                                                    !isActive && "caret-idle"
                                                )}
                                                style={{
                                                    backgroundColor: 'var(--mt-primary)',
                                                    height: language === "khmer" ? '44px' : `${fontSize * 1.4}px`,
                                                    marginTop: language === "khmer" ? '10px' : `${fontSize * 0.15}px`,
                                                    boxShadow: `0 0 10px var(--mt-primary)40`,
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

                                            {/* Words Grid or Zen Free-Type Area */}
                                            {mode === "zen" ? (
                                                <div 
                                                    className={cn("w-full text-left break-words whitespace-pre-wrap flex flex-wrap", language === "khmer" ? "font-hanuman text-[1.25em]" : "")}
                                                    style={{ 
                                                        lineHeight: language === "khmer" ? 'var(--khmer-line-height)' : `${fontSize * 1.6}px`,
                                                    }}
                                                >
                                                    {(typedWords[0] || "").split('').map((char, i) => {
                                                        if (char === '\n') {
                                                            return (
                                                                <div 
                                                                    key={i} 
                                                                    ref={el => { zenCharRefs.current[i] = el; }} 
                                                                    className="flex-none basis-full h-0 opacity-0 pointer-events-none" 
                                                                />
                                                            );
                                                        }
                                                        return (
                                                            <span 
                                                                key={i} 
                                                                ref={el => { zenCharRefs.current[i] = el; }} 
                                                                className="transition-colors duration-100 inline whitespace-pre" 
                                                                style={{ color: activeTheme.text }}
                                                            >
                                                                {char === ' ' ? '\u00A0' : char}
                                                            </span>
                                                        );
                                                    })}
                                                    {/* Final Caret Target at the very end of everything */}
                                                    <span ref={el => { zenCharRefs.current[typedWords[0]?.length || 0] = el; }} className="inline-block w-px opacity-0"> </span>
                                                </div>
                                            ) : (
                                                <div className={cn("flex flex-wrap w-full", language === "khmer" ? "font-hanuman" : "")}>
                                                    {wordGroups.map((group, groupIdx) => {
                                                    const wordTyped = typedWords[groupIdx] || "";
                                                    const wordTarget = words[groupIdx] || "";

                                                    return (
                                                        <Word
                                                            key={groupIdx}
                                                            group={group}
                                                            clusters={clusters}
                                                            clusterIndexes={clusterIndexes}
                                                            typedWord={wordTyped}
                                                            targetWord={wordTarget}
                                                            isActive={groupIdx === currentWordIndex}
                                                            isFinished={groupIdx < currentWordIndex}
                                                            charRefs={charRefs}
                                                            extraCharRefs={extraCharRefs}
                                                            themeColors={activeTheme}
                                                            language={language}
                                                        />
                                                    );
                                                })}
                                            </div>
                                            )}

                                        </motion.div>

                                            {mode === "zen" ? (
                                                <textarea
                                                    id="typing-input"
                                                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                                                    defaultValue=""
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
                                                        // 1:1 Monkeytype shortcut: Shift + Enter to finish Zen mode
                                                        if (e.key === "Enter" && e.shiftKey && mode === "zen" && isActive) {
                                                            e.preventDefault();
                                                            finishTest();
                                                        }
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 outline-none cursor-default resize-none overflow-hidden"
                                                    autoFocus
                                                    spellCheck={false}
                                                    autoComplete="off"
                                                />
                                            ) : (
                                                <input
                                                    id="typing-input"
                                                    ref={inputRef as React.RefObject<HTMLInputElement>}
                                                    type="text"
                                                    defaultValue=""
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
                                            )}

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
                                <AnimatePresence>
                                    {!isZenHidden && showKeyboard && (
                                        <motion.div
                                            key="keyboard-animation"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.13 }}
                                            className="hidden md:block"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                inputRef.current?.focus();
                                            }}
                                        >
                                            {(() => {
                                                // Always show next key to press, updating as the user types
                                                const currentWord = words[currentWordIndex] || "";
                                                const currentTyped = typedWords[currentWordIndex] || "";
                                                const remainingTarget = currentWord.slice(currentTyped.length);
                                                
                                                let nextKey: string | null = null;
                                                let needsShift = false;

                                                if (remainingTarget) {
                                                    if (language === "khmer") {
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
                                                    } else {
                                                        const char = remainingTarget[0];
                                                        const baseKey = ENGLISH_BASE_MAP[char] || char.toLowerCase();
                                                        for (const row of KEYBOARD_ROWS) {
                                                            if (row.includes(baseKey)) {
                                                                nextKey = baseKey;
                                                                break;
                                                            }
                                                        }
                                                        needsShift = /[A-Z!@#$%^&*()_+{}|:"<>?]/.test(char);
                                                    }
                                                } else {
                                                    // Word is complete, next is space
                                                    nextKey = "space";
                                                    needsShift = language === "khmer";
                                                }

                                                const nextKeyData = { key: nextKey, needsShift };

                                                return (
                                                    <Keyboard
                                                        activeKeys={activeKeys}
                                                        errorKey={errorKey}
                                                        language={language}
                                                        nextKeyData={nextKeyData}
                                                        activeTheme={activeTheme}
                                                        keymapMode={keymapMode}
                                                        keymapStyle={keymapStyle}
                                                        keymapLegendStyle={keymapLegendStyle}
                                                        keymapSize={keymapSize}
                                                        keymapLayout={keymapLayout}
                                                        keymapShowTopRow={keymapShowTopRow}
                                                    />
                                                );
                                            })()}
                                        </motion.div>
                                    )}
                                </AnimatePresence>


                                <AnimatePresence>
                                    {!isZenHidden && (
                                        <motion.div
                                            key="shortcuts-animation"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.13 }}
                                            className="flex flex-col items-center gap-3 sm:gap-6 mt-2 sm:mt-4"
                                        >
                                            <div className="hidden sm:flex items-center gap-10">
                                                <ShortcutHint
                                                    keys={["tab", "enter"]}
                                                    label="restart"
                                                    activeTheme={activeTheme}
                                                />
                                                {mode === "zen" && (
                                                    <ShortcutHint
                                                        keys={["shift", "enter"]}
                                                        label="finish zen"
                                                        activeTheme={activeTheme}
                                                    />
                                                )}
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
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
                                                    return <span className="text-[8px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded font-black uppercase">Personal Best!</span>
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
                                                    <div className="bg-white/10 text-white/70 px-2 py-1 rounded text-[10px] font-black uppercase">Lvl Up!</div>
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
                                        <span className="text-xl font-bold" style={{ color: activeTheme.text }}>{mode} {mode === "custom" ? words.length : config}</span>
                                        <span className="text-[10px] font-medium opacity-40 mt-1" style={{ color: activeTheme.textDim }}>{language}</span>
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
                                        <AuthenticCrown className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
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


            {!isZenHidden && (
                <div key="version-watermark" className="fixed bottom-3 sm:bottom-6 right-3 sm:right-6 text-[8px] sm:text-[10px] font-bold tracking-[0.3em] uppercase opacity-20 pointer-events-none" style={{ color: activeTheme.textDim }}>
                    TypeFlow 1.0
                </div>
            )}

            {!isZenHidden && (
                <button
                    key="terminal-button-mobile"
                    onClick={() => setIsSearchOpen(true)}
                    className="fixed lg:hidden bottom-3 sm:bottom-6 left-3 sm:left-6 z-50 p-2.5 sm:p-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center opacity-80 hover:opacity-100 cursor-pointer"
                    style={{ backgroundColor: activeTheme.primary, color: activeTheme.bg }}
                    title="Open Command Palette"
                >
                    <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
            )}

        </div >
    );
}
