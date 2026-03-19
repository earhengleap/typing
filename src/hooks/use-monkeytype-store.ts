import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GameMode = "time" | "words" | "quote" | "zen" | "custom";
export type GameConfig = 15 | 30 | 60 | 120 | 10 | 25 | 50 | 100 | number;
export type Language = "english" | "khmer";
export type Theme = "codex" | "cyberpunk" | "dracula" | "retro" | "nord" | "monokai" | "solarized" | "tokyonight";
export type CustomTextMode = "simple" | "repeat" | "shuffle" | "random";
export type CustomTextLimitMode = "none" | "word" | "time" | "section";

export type KeymapMode = "off" | "static" | "react" | "next";
export type KeymapStyle = "staggered" | "alice" | "matrix" | "split" | "split_matrix" | "steno" | "steno_matrix";
export type KeymapLegendStyle = "lowercase" | "uppercase" | "blank" | "dynamic";
export type KeymapShowTopRow = "always" | "layout_dependent" | "never";

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
    afk: number;
}

export interface ChartPoint {
    wpm: number;
    raw: number;
    errors: number;
    second: number;
}

export interface ThemeColors {
    name?: string;
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
    duration: number;
    date: number;
    missedChars?: number;
    afk?: number;
    isUnverified?: boolean;
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
    punctuation: boolean;
    numbers: boolean;
    customText: string;
    customTextByLanguage: Record<Language, string>;
    customTextMode: CustomTextMode;
    customTextLimitMode: CustomTextLimitMode;
    customTextLimitValue: number;
    customTextPipeDelimiter: boolean;
    setPunctuation: (v: boolean) => void;
    setNumbers: (v: boolean) => void;
    setCustomText: (v: string) => void;
    setCustomTextForLanguage: (language: Language, v: string) => void;
    setCustomTextSettings: (settings: Partial<{
        customTextMode: CustomTextMode;
        customTextLimitMode: CustomTextLimitMode;
        customTextLimitValue: number;
        customTextPipeDelimiter: boolean;
    }>) => void;
    favoriteThemes: Theme[];
    toggleFavoriteTheme: (theme: Theme) => void;

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
    soundType: string;
    soundVolume: number;
    soundOnError: boolean | string;
    playTimeWarning: boolean | string | number;
    showLiveTimer: boolean;
    showKeyboard: boolean;
    keymapMode: KeymapMode;
    keymapStyle: KeymapStyle;
    keymapLegendStyle: KeymapLegendStyle;
    keymapSize: number;
    keymapLayout: string;
    keymapShowTopRow: KeymapShowTopRow;
    zenMode: boolean;

    setShowLiveWpm: (v: boolean) => void;
    setShowLiveAccuracy: (v: boolean) => void;
    setShowLiveTimer: (v: boolean) => void;
    setShowKeyboard: (v: boolean) => void;
    setZenMode: (v: boolean) => void;
    setKeymapMode: (v: KeymapMode) => void;
    setKeymapStyle: (v: KeymapStyle) => void;
    setKeymapLegendStyle: (v: KeymapLegendStyle) => void;
    setKeymapSize: (v: number) => void;
    setKeymapLayout: (v: string) => void;
    setKeymapShowTopRow: (v: KeymapShowTopRow) => void;

    setSoundEnabled: (v: boolean) => void;
    setFontSize: (v: number) => void;
    setFontFamily: (v: string) => void;
    setSoundType: (v: string) => void;
    setSoundVolume: (v: number) => void;

    setSettings: (settings: Partial<{
        soundEnabled: boolean,
        showLiveWpm: boolean,
        showLiveAccuracy: boolean,
        showLiveTimer: boolean,
        fontSize: number,
        fontFamily: string,
        soundType: string,
        soundVolume: number,
        soundOnError: boolean | string,
        playTimeWarning: boolean | string | number
    }>) => void;

    // History
    history: RunHistory[];
    addHistory: (run: Omit<RunHistory, "id" | "date">) => void;
    clearHistory: () => void;

    // User Data
    userLevel: number;
    setUserLevel: (level: number) => void;

    // UI State (Non-persistent)
    isSearchOpen: boolean;
    setIsSearchOpen: (open: boolean) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    activeCommandGroup: string | null;
    setActiveCommandGroup: (group: string | null) => void;
    selectedIndex: number;
    setSelectedIndex: (index: number) => void;
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
            punctuation: false,
            numbers: false,
            customText: "",
            customTextByLanguage: { english: "", khmer: "" },
            customTextMode: "simple",
            customTextLimitMode: "none",
            customTextLimitValue: 0,
            customTextPipeDelimiter: false,
            setPunctuation: (punctuation) => set({ punctuation }),
            setNumbers: (numbers) => set({ numbers }),
            setCustomText: (customText) => set({ customText }),
            setCustomTextForLanguage: (language, customTextValue) => set((state) => ({
                customTextByLanguage: {
                    ...state.customTextByLanguage,
                    [language]: customTextValue
                },
                ...(language === "english" ? { customText: customTextValue } : {})
            })),
            setCustomTextSettings: (settings) => set((state) => ({ ...state, ...settings })),
            favoriteThemes: [],
            toggleFavoriteTheme: (t) => set((state) => ({
                favoriteThemes: state.favoriteThemes.includes(t)
                    ? state.favoriteThemes.filter((x) => x !== t)
                    : [...state.favoriteThemes, t]
            })),

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
                totalChars: 0,
                afk: 0
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
                    totalChars: 0,
                    afk: 0
                },
                chartData: [],
                isWrongKeyboardLayout: false
            }),

            soundEnabled: true,
            showLiveWpm: true,
            showLiveAccuracy: true,
            showLiveTimer: true,
            showKeyboard: true,
            fontSize: 24,
            fontFamily: 'monospace',
            soundType: 'mechanical',
            soundVolume: 0.5,
            soundOnError: 'off',
            playTimeWarning: 10,
            keymapMode: "static",
            keymapStyle: "staggered",
            keymapLegendStyle: "lowercase",
            keymapSize: 1.0,
            keymapLayout: "qwerty",
            keymapShowTopRow: "always",
            zenMode: false,
            
            setShowLiveWpm: (v) => set({ showLiveWpm: v }),
            setShowLiveAccuracy: (v) => set({ showLiveAccuracy: v }),
            setShowLiveTimer: (v) => set({ showLiveTimer: v }),
            setShowKeyboard: (v) => set({ showKeyboard: v }),
            setZenMode: (v) => set({ zenMode: v }),
            setKeymapMode: (v) => set({ keymapMode: v }),
            setKeymapStyle: (v) => set({ keymapStyle: v }),
            setKeymapLegendStyle: (v) => set({ keymapLegendStyle: v }),
            setKeymapSize: (v) => set({ keymapSize: v }),
            setKeymapLayout: (v) => set({ keymapLayout: v }),
            setKeymapShowTopRow: (v) => set({ keymapShowTopRow: v }),
            
            setSoundEnabled: (v) => set({ soundEnabled: v }),
            setFontSize: (v) => set({ fontSize: v }),
            setFontFamily: (v) => set({ fontFamily: v }),
            setSoundType: (v) => set({ soundType: v }),
            setSoundVolume: (v) => set({ soundVolume: v }),

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

            userLevel: 1,
            setUserLevel: (userLevel) => set({ userLevel }),

            isSearchOpen: false,
            setIsSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
            searchQuery: "",
            setSearchQuery: (searchQuery) => set({ searchQuery }),
            activeCommandGroup: null,
            setActiveCommandGroup: (activeCommandGroup) => set({ activeCommandGroup }),
            selectedIndex: 0,
            setSelectedIndex: (selectedIndex) => set({ selectedIndex }),
        }),
        {
            name: 'monkeytype-storage',
            partialize: (state) => ({
                mode: state.mode,
                config: state.config,
                language: state.language,
                theme: state.theme,
                punctuation: state.punctuation,
                numbers: state.numbers,
                customText: state.customText,
                customTextByLanguage: state.customTextByLanguage,
                customTextMode: state.customTextMode,
                customTextLimitMode: state.customTextLimitMode,
                customTextLimitValue: state.customTextLimitValue,
                customTextPipeDelimiter: state.customTextPipeDelimiter,
                favoriteThemes: state.favoriteThemes,
                history: state.history,
                soundEnabled: state.soundEnabled,
                showLiveWpm: state.showLiveWpm,
                showLiveAccuracy: state.showLiveAccuracy,
                showLiveTimer: state.showLiveTimer,
                showKeyboard: state.showKeyboard,
                fontSize: state.fontSize,
                fontFamily: state.fontFamily,
                soundType: state.soundType,
                soundVolume: state.soundVolume,
                soundOnError: state.soundOnError,
                playTimeWarning: state.playTimeWarning,
                keymapMode: state.keymapMode,
                keymapStyle: state.keymapStyle,
                keymapLegendStyle: state.keymapLegendStyle,
                keymapSize: state.keymapSize,
                keymapLayout: state.keymapLayout,
                keymapShowTopRow: state.keymapShowTopRow,
                zenMode: state.zenMode,
                userLevel: state.userLevel,
            }), // Persist settings and history
        }
    )
);
