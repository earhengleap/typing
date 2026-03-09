import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GameMode = "time" | "words";
export type GameConfig = 15 | 30 | 60 | 120 | 10 | 25 | 50 | 100;
export type Language = "english" | "khmer";
export type Theme = "codex" | "cyberpunk" | "dracula" | "retro" | "nord" | "monokai" | "solarized" | "tokyonight";

export interface TypingStats {
    wpm: number;
    rawWpm: number;
    accuracy: number;
    correctChars: number;
    incorrectChars: number;
    extraChars: number;
    missedChars: number;
    consistency: number;
    totalChars: number;
}

export interface ChartPoint {
    wpm: number;
    raw: number;
    errors: number;
    second: number;
}

export interface ThemeColors {
    bg: string;
    bgAlt: string;
    text: string;
    textDim: string;
    primary: string;
    error: string;
    primaryRgb: string;
}

export interface RunHistory {
    id: string;
    wpm: number;
    rawWpm: number;
    accuracy: number;
    mode: GameMode;
    config: number;
    language: Language;
    theme: Theme;
    consistency: number;
    date: number;
}

interface MonkeyTypeState {
    // Config
    mode: GameMode;
    config: GameConfig;
    language: Language;
    theme: Theme;
    setMode: (mode: GameMode) => void;
    setConfig: (config: GameConfig) => void;
    setLanguage: (language: Language) => void;
    setTheme: (theme: Theme) => void;

    // Live State
    isActive: boolean;
    isFinished: boolean;
    timeLeft: number;
    stats: TypingStats;
    chartData: ChartPoint[];
    isWrongKeyboardLayout: boolean;

    setIsActive: (active: boolean) => void;
    setIsFinished: (finished: boolean) => void;
    setTimeLeft: (time: number) => void;
    setStats: (stats: TypingStats) => void;
    setChartData: (data: ChartPoint[]) => void;
    setIsWrongKeyboardLayout: (isWrong: boolean) => void;
    resetLiveState: (defaultTime?: number) => void;

    // Settings
    soundEnabled: boolean;
    showLiveWpm: boolean;
    showLiveAccuracy: boolean;
    fontSize: number;
    fontFamily: string;
    setSettings: (settings: Partial<{ soundEnabled: boolean, showLiveWpm: boolean, showLiveAccuracy: boolean, fontSize: number, fontFamily: string }>) => void;

    // History
    history: RunHistory[];
    addHistory: (run: Omit<RunHistory, "id" | "date">) => void;
    clearHistory: () => void;
}

export const useMonkeyTypeStore = create<MonkeyTypeState>()(
    persist(
        (set) => ({
            mode: "time",
            config: 30,
            language: "english",
            theme: "codex",
            setMode: (mode) => set({ mode }),
            setConfig: (config) => set({ config }),
            setLanguage: (language) => set({ language }),
            setTheme: (theme) => set({ theme }),

            isActive: false,
            isFinished: false,
            timeLeft: 30,
            stats: {
                wpm: 0,
                rawWpm: 0,
                accuracy: 0,
                correctChars: 0,
                incorrectChars: 0,
                extraChars: 0,
                missedChars: 0,
                consistency: 0,
                totalChars: 0
            },
            chartData: [],
            isWrongKeyboardLayout: false,

            setIsActive: (isActive) => set({ isActive }),
            setIsFinished: (isFinished) => set({ isFinished }),
            setTimeLeft: (timeLeft) => set({ timeLeft }),
            setStats: (stats) => set({ stats }),
            setChartData: (chartData) => set({ chartData }),
            setIsWrongKeyboardLayout: (isWrongKeyboardLayout) => set({ isWrongKeyboardLayout }),

            resetLiveState: (defaultTime = 30) => set({
                isActive: false,
                isFinished: false,
                timeLeft: defaultTime,
                stats: {
                    wpm: 0,
                    rawWpm: 0,
                    accuracy: 0,
                    correctChars: 0,
                    incorrectChars: 0,
                    extraChars: 0,
                    missedChars: 0,
                    consistency: 0,
                    totalChars: 0
                },
                chartData: [],
                isWrongKeyboardLayout: false
            }),

            soundEnabled: true,
            showLiveWpm: true,
            showLiveAccuracy: true,
            fontSize: 24,
            fontFamily: 'monospace',
            setSettings: (settings) => set((state) => ({ ...state, ...settings })),

            history: [],
            addHistory: (run) => set((state) => {
                const newRun: RunHistory = {
                    ...run,
                    id: Math.random().toString(36).substring(2, 9),
                    date: Date.now(),
                };
                // Keep last 50 runs
                return { history: [newRun, ...state.history].slice(0, 50) };
            }),
            clearHistory: () => set({ history: [] }),
        }),
        {
            name: 'monkeytype-storage',
            partialize: (state) => ({
                mode: state.mode,
                config: state.config,
                language: state.language,
                theme: state.theme,
                history: state.history,
                soundEnabled: state.soundEnabled,
                showLiveWpm: state.showLiveWpm,
                showLiveAccuracy: state.showLiveAccuracy,
                fontSize: state.fontSize,
                fontFamily: state.fontFamily,
            }), // Persist settings and history
        }
    )
);
