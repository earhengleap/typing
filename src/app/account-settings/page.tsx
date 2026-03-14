"use client";

import React, { Suspense } from "react";
import { THEMES } from "@/constants/themes";
import { useMonkeyTypeStore, ThemeColors } from "@/hooks/use-monkeytype-store";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { User, Shield, Ban, Key, AlertTriangle, LogOut, Check } from "lucide-react";
import { clsx } from "clsx";

type AccountTab = 'account' | 'authentication' | 'blockedUsers' | 'apeKeys' | 'dangerZone';

function MtButton({ children, onClick, activeTheme, danger = false }: { children: React.ReactNode, onClick?: () => void, activeTheme: ThemeColors, danger?: boolean }) {
    return (
        <button 
            onClick={onClick}
            className="px-4 py-2 rounded-lg font-bold transition-all duration-200 text-sm flex items-center gap-2 hover:brightness-110 active:scale-95 whitespace-nowrap"
            style={{ 
                backgroundColor: danger ? activeTheme.error : activeTheme.bgAlt,
                color: danger ? activeTheme.bg : activeTheme.text,
            }}
        >
            {children}
        </button>
    );
}

function AccountSettingsContent() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const store = useMonkeyTypeStore();
    const activeTheme = THEMES[store.theme] || THEMES.codex;

    // Default to 'account' if no tab is provided
    const activeTab = (searchParams.get('tab') as AccountTab) || 'account';

    const handleTabChange = (tab: AccountTab) => {
        router.push(`/account-settings?tab=${tab}`);
    };

    const tabs = [
        { id: 'account', label: 'account', icon: User },
        { id: 'authentication', label: 'authentication', icon: Shield },
        { id: 'blockedUsers', label: 'blocked users', icon: Ban },
        { id: 'apeKeys', label: 'type flow keys', icon: Key },
        { id: 'dangerZone', label: 'danger zone', icon: AlertTriangle, danger: true },
    ];

    const isGuest = !session?.user;

    return (
        <main className="min-h-screen transition-colors duration-300 pb-20 scroll-smooth selection:bg-[var(--mt-primary-20)] pt-1 sm:pt-1.5 md:pt-3 px-[var(--content-px)]" style={{ backgroundColor: activeTheme.bg }}>
            <Header activeTheme={activeTheme} />
            
            <div className="flex-1 w-full py-8 md:py-12 flex flex-col md:flex-row gap-8 md:gap-16 items-start">
                
                {/* 15rem Sidebar (Clone of .tabs) */}
                <div 
                    className="w-full md:w-[15rem] flex flex-col p-4 rounded-2xl shrink-0" 
                    style={{ backgroundColor: activeTheme.bgAlt }}
                >
                    <div className="flex flex-col gap-2">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const isDanger = tab.danger;
                            const color = isActive 
                                ? (isDanger ? activeTheme.error : activeTheme.text) 
                                : activeTheme.textDim;
                            
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id as AccountTab)}
                                    className={clsx(
                                        "w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3",
                                        isActive ? "font-bold" : "font-medium hover:brightness-125"
                                    )}
                                    style={{ 
                                        color,
                                        backgroundColor: isActive ? 'rgba(0,0,0,0.1)' : 'transparent'
                                    }}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Area (.right) */}
                <div className="flex-1 w-full flex flex-col gap-12">
                    
                    {isGuest && activeTab !== 'account' ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                            <Shield size={48} style={{ color: activeTheme.textDim }} />
                            <h2 className="text-2xl font-bold" style={{ color: activeTheme.textDim }}>Authentication Required</h2>
                            <p style={{ color: activeTheme.textDim }}>Please sign in to view this page.</p>
                        </div>
                    ) : (
                        <>
                            {/* --- ACCOUNT TAB --- */}
                            {activeTab === 'account' && (
                                <section className="flex flex-col gap-8">
                                    <h1 className="text-[2rem] leading-none" style={{ color: activeTheme.textDim }}>account</h1>
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                                        <div className="flex flex-col">
                                            <span className="text-lg" style={{ color: activeTheme.textDim }}>update account name</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="text" 
                                                value={session?.user?.name || ''} 
                                                disabled
                                                className="px-4 py-2 rounded-lg outline-none w-48 font-mono text-sm"
                                                style={{ backgroundColor: activeTheme.bgAlt, color: activeTheme.textDim }}
                                            />
                                            <MtButton activeTheme={activeTheme}>save</MtButton>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                                        <div className="flex flex-col">
                                            <span className="text-lg" style={{ color: activeTheme.textDim }}>email address</span>
                                            <span className="text-sm" style={{ color: activeTheme.textDim }}>Your current email is {session?.user?.email || 'hidden'}.</span>
                                        </div>
                                        <MtButton activeTheme={activeTheme}>update email</MtButton>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                                        <div className="flex flex-col">
                                            <span className="text-lg" style={{ color: activeTheme.textDim }}>export data</span>
                                            <span className="text-sm" style={{ color: activeTheme.textDim }}>Download all your typing statistics as a CSV file.</span>
                                        </div>
                                        <MtButton activeTheme={activeTheme}>export csv</MtButton>
                                    </div>

                                    <div className="flex flex-col gap-4 py-2 mt-4">
                                        <div className="flex flex-col">
                                            <span className="text-lg" style={{ color: activeTheme.textDim }}>discord integration</span>
                                            <span className="text-sm" style={{ color: activeTheme.textDim }}>
                                                When you connect your monkeytype account to your Discord account, you will be automatically assigned a new role every time you achieve a new personal best in a 60 second test. If you link your accounts before joining the Discord server, the bot will not give you a role.
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Check size={16} style={{ color: activeTheme.primary }} />
                                            <span className="text-sm font-bold" style={{ color: activeTheme.primary }}>your accounts are linked !</span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                            <MtButton activeTheme={activeTheme}>update avatar</MtButton>
                                            <MtButton activeTheme={activeTheme} danger>unlink</MtButton>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* --- AUTHENTICATION TAB --- */}
                            {activeTab === 'authentication' && (
                                <section className="flex flex-col gap-8">
                                    <h1 className="text-[2rem] leading-none" style={{ color: activeTheme.textDim }}>authentication</h1>
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                                        <div className="flex flex-col">
                                            <span className="text-lg" style={{ color: activeTheme.textDim }}>change password</span>
                                            <span className="text-sm" style={{ color: activeTheme.textDim }}>Update your account password securely.</span>
                                        </div>
                                        <MtButton activeTheme={activeTheme}>change password</MtButton>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 mt-8">
                                        <div className="flex flex-col">
                                            <span className="text-lg" style={{ color: activeTheme.error }}>revoke all tokens</span>
                                            <span className="text-sm" style={{ color: activeTheme.textDim }}>Log out of all active sessions immediately.</span>
                                        </div>
                                        <button 
                                            onClick={() => signOut({ callbackUrl: '/' })}
                                            className="px-4 py-2 rounded-lg font-bold transition-all duration-200 text-sm text-white"
                                            style={{ backgroundColor: activeTheme.error }}
                                        >
                                            revoke tokens
                                        </button>
                                    </div>
                                </section>
                            )}

                            {/* --- BLOCKED USERS TAB --- */}
                            {activeTab === 'blockedUsers' && (
                                <section className="flex flex-col gap-8">
                                    <h1 className="text-[2rem] leading-none" style={{ color: activeTheme.textDim }}>blocked users</h1>
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                                        <span className="text-lg" style={{ color: activeTheme.textDim }}>Nobody blocked yet.</span>
                                    </div>
                                </section>
                            )}

                            {/* --- TYPE FLOW KEYS TAB --- */}
                            {activeTab === 'apeKeys' && (
                                <section className="flex flex-col gap-8">
                                    <h1 className="text-[2rem] leading-none" style={{ color: activeTheme.textDim }}>type flow keys</h1>
                                    <p className="text-sm" style={{ color: activeTheme.textDim }}>
                                        Use these keys to access the TypeFlow API. Do not share your keys with anyone.
                                    </p>
                                    
                                    <div className="flex flex-col gap-4 mt-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-6 rounded-xl" style={{ backgroundColor: activeTheme.bgAlt }}>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold flex items-center gap-2" style={{ color: activeTheme.text }}>
                                                    <Key size={14} /> Developer Access
                                                </span>
                                                <span className="font-mono text-xs" style={{ color: activeTheme.textDim }}>tf_live_•••••••••••••••••••••••••</span>
                                            </div>
                                            <MtButton activeTheme={activeTheme}>reveal key</MtButton>
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-4">
                                        <MtButton activeTheme={activeTheme}>generate new key</MtButton>
                                    </div>
                                </section>
                            )}

                            {/* --- DANGER ZONE TAB --- */}
                            {activeTab === 'dangerZone' && (
                                <section className="flex flex-col gap-8">
                                    <h1 className="text-[2rem] leading-none" style={{ color: activeTheme.error }}>danger zone</h1>
                                    
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
                                        <div className="flex flex-col">
                                            <span className="text-lg" style={{ color: activeTheme.error }}>reset personal bests</span>
                                            <span className="text-sm" style={{ color: activeTheme.textDim }}>Remove all recorded personal bests from your account.</span>
                                        </div>
                                        <MtButton activeTheme={activeTheme} danger>reset pbs</MtButton>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 mt-4">
                                        <div className="flex flex-col">
                                            <span className="text-lg" style={{ color: activeTheme.error }}>delete account</span>
                                            <span className="text-sm" style={{ color: activeTheme.textDim }}>Permanently remove your account and all associated data.</span>
                                        </div>
                                        <MtButton activeTheme={activeTheme} danger>delete account</MtButton>
                                    </div>
                                </section>
                            )}

                        </>
                    )}
                </div>
            </div>
            
            <Footer />
        </main>
    );
}

export default function AccountSettingsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <AccountSettingsContent />
        </Suspense>
    );
}
