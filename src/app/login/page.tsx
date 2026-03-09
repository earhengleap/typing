"use client";

import { signIn } from "next-auth/react";
import { registerUser } from "@/app/actions/auth";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import { UserPlus, LogIn, Github, Mail, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { forgotPassword } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    // Helper to login with credentials since we can't call it directly in 'use client' easily with standard signIn behavior if we want custom error handling
    const loginWithCredentials = async (email: string, password: string) => {
        return await signIn("credentials", {
            email,
            password,
            redirect: false,
            callbackUrl: "/",
        });
    };
    const { theme } = useMonkeyTypeStore();
    const activeTheme = THEMES[theme as keyof typeof THEMES] || THEMES.codex;

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showForgotModal, setShowForgotModal] = useState(false);

    // Form states
    const [registerData, setRegisterData] = useState({
        name: "",
        email: "",
        verifyEmail: "",
        password: "",
        verifyPassword: ""
    });

    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
        rememberMe: false
    });

    const [forgotEmail, setForgotEmail] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (registerData.email !== registerData.verifyEmail) {
            setError("Emails do not match");
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append("name", registerData.name);
        formData.append("email", registerData.email);
        formData.append("password", registerData.password);
        formData.append("verifyPassword", registerData.verifyPassword);

        const result = await registerUser(formData);
        setIsLoading(false);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(result.success || "Registration successful!");
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        try {
            const result = await loginWithCredentials(loginData.email, loginData.password);
            if (result?.error) {
                setError("Invalid email or password");
                setIsLoading(false);
            } else if (result?.ok) {
                router.push("/");
            }
        } catch (err) {
            setError("Something went wrong");
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        const formData = new FormData();
        formData.append("email", forgotEmail);

        const result = await forgotPassword(formData);
        setIsLoading(false);
        setShowForgotModal(false);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(result.success || "Reset link sent!");
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 5 },
        visible: { opacity: 1, y: 0 }
    };

    const inputStyle = {
        backgroundColor: activeTheme.bgAlt,
        color: activeTheme.text,
        borderColor: "transparent",
    };

    const buttonStyle = {
        backgroundColor: activeTheme.bgAlt,
        color: activeTheme.text,
    };

    return (
        <div
            className="min-h-screen flex flex-col font-mono transition-colors duration-500 overflow-x-hidden relative"
            style={{ backgroundColor: activeTheme.bg, color: activeTheme.textDim }}
        >
            {/* Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full blur-[120px]"
                    style={{ backgroundColor: activeTheme.primary }}
                ></div>
            </div>

            {/* Top Navigation */}
            <header className="p-8 z-20">
                <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80 cursor-pointer w-fit">
                    <ArrowLeft size={18} style={{ color: activeTheme.primary }} />
                    <span className="text-xl font-bold tracking-tighter" style={{ color: activeTheme.text }}>
                        typeflow<span style={{ color: activeTheme.primary }}>.</span>
                    </span>
                </Link>
            </header>

            <main className="flex-1 flex items-center justify-center p-6 md:p-12 z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-start"
                >
                    {/* Register Column */}
                    <motion.div variants={itemVariants} className="flex flex-col gap-8">
                        <div className="flex items-center gap-3 text-2xl font-bold tracking-tight" style={{ color: activeTheme.text }}>
                            <UserPlus size={28} style={{ color: activeTheme.primary }} />
                            register
                        </div>

                        <form onSubmit={handleRegister} className="flex flex-col gap-4">
                            <motion.input
                                variants={itemVariants}
                                type="text"
                                placeholder="userName"
                                required
                                value={registerData.name}
                                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                className="w-full px-5 py-3 rounded-xl outline-none transition-all focus:ring-2 border border-transparent shadow-sm"
                                style={{ ...inputStyle, "--tw-ring-color": activeTheme.primary } as any}
                            />
                            <motion.input
                                variants={itemVariants}
                                type="email"
                                placeholder="email"
                                required
                                value={registerData.email}
                                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                className="w-full px-5 py-3 rounded-xl outline-none transition-all focus:ring-2 border border-transparent shadow-sm"
                                style={{ ...inputStyle, "--tw-ring-color": activeTheme.primary } as any}
                            />
                            <motion.input
                                variants={itemVariants}
                                type="email"
                                placeholder="verify email"
                                required
                                value={registerData.verifyEmail}
                                onChange={(e) => setRegisterData({ ...registerData, verifyEmail: e.target.value })}
                                className="w-full px-5 py-3 rounded-xl outline-none transition-all focus:ring-2 border border-transparent shadow-sm"
                                style={{ ...inputStyle, "--tw-ring-color": activeTheme.primary } as any}
                            />
                            <motion.div variants={itemVariants} className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="password"
                                    required
                                    value={registerData.password}
                                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                    className="w-full px-5 py-3 rounded-xl outline-none transition-all focus:ring-2 border border-transparent shadow-sm"
                                    style={{ ...inputStyle, "--tw-ring-color": activeTheme.primary } as any}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </motion.div>
                            <motion.div variants={itemVariants} className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="verify password"
                                    required
                                    value={registerData.verifyPassword}
                                    onChange={(e) => setRegisterData({ ...registerData, verifyPassword: e.target.value })}
                                    className="w-full px-5 py-3 rounded-xl outline-none transition-all focus:ring-2 border border-transparent shadow-sm"
                                    style={{ ...inputStyle, "--tw-ring-color": activeTheme.primary } as any}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </motion.div>

                            <motion.button
                                variants={itemVariants}
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all hover:scale-[1.01] active:scale-[0.99] mt-4 shadow-lg cursor-pointer disabled:opacity-50"
                                style={{ backgroundColor: activeTheme.primary, color: activeTheme.bg }}
                            >
                                <UserPlus size={20} />
                                {isLoading ? "registering..." : "sign up"}
                            </motion.button>
                        </form>
                    </motion.div>

                    {/* Login Column */}
                    <motion.div variants={itemVariants} className="flex flex-col gap-8">
                        <div className="flex items-center gap-3 text-2xl font-bold tracking-tight" style={{ color: activeTheme.text }}>
                            <LogIn size={28} style={{ color: activeTheme.primary }} />
                            login
                        </div>

                        {/* Social Logins */}
                        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => signIn("google", { callbackUrl: "/" })}
                                className="flex items-center justify-center gap-3 py-4 rounded-xl transition-all hover:opacity-80 active:scale-[0.98] border border-transparent hover:border-current cursor-pointer shadow-sm"
                                style={buttonStyle}
                            >
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 grayscale group-hover:grayscale-0" />
                                <span className="text-sm font-bold">Google</span>
                            </button>
                            <button
                                onClick={() => signIn("github", { callbackUrl: "/" })}
                                className="flex items-center justify-center gap-3 py-4 rounded-xl transition-all hover:opacity-80 active:scale-[0.98] border border-transparent hover:border-current cursor-pointer shadow-sm relative group"
                                style={buttonStyle}
                            >
                                <Github size={20} className="opacity-60 group-hover:opacity-100" />
                                <span className="text-sm font-bold">GitHub</span>
                            </button>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex items-center gap-4 py-2">
                            <div className="flex-1 h-px opacity-10" style={{ backgroundColor: activeTheme.textDim }}></div>
                            <span className="text-[10px] uppercase tracking-widest opacity-30">or continue with mail</span>
                            <div className="flex-1 h-px opacity-10" style={{ backgroundColor: activeTheme.textDim }}></div>
                        </motion.div>

                        {/* Feedback Messages */}
                        {error && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs text-center font-bold px-4 py-2 rounded-lg bg-red-400/10">
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 text-xs text-center font-bold px-4 py-2 rounded-lg bg-green-400/10">
                                {success}
                            </motion.div>
                        )}

                        {/* Email Login Form */}
                        <form onSubmit={handleLogin} className="flex flex-col gap-4">
                            <motion.input
                                variants={itemVariants}
                                type="email"
                                placeholder="email"
                                required
                                value={loginData.email}
                                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                className="w-full px-5 py-3 rounded-xl outline-none transition-all focus:ring-2 border border-transparent shadow-sm"
                                style={{ ...inputStyle, "--tw-ring-color": activeTheme.primary } as any}
                            />
                            <motion.div variants={itemVariants} className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="password"
                                    required
                                    value={loginData.password}
                                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                    className="w-full px-5 py-3 rounded-xl outline-none transition-all focus:ring-2 border border-transparent shadow-sm"
                                    style={{ ...inputStyle, "--tw-ring-color": activeTheme.primary } as any}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </motion.div>

                            <motion.div variants={itemVariants} className="flex items-center justify-between text-xs px-1">
                                <label className="flex items-center gap-2 cursor-pointer group select-none">
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={loginData.rememberMe}
                                        onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                                    />
                                    <div
                                        className="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                                        style={{
                                            borderColor: loginData.rememberMe ? activeTheme.primary : activeTheme.textDim,
                                            backgroundColor: loginData.rememberMe ? activeTheme.primary + "20" : "transparent"
                                        }}
                                    >
                                        <div
                                            className="w-2 h-2 rounded-full transition-opacity"
                                            style={{
                                                backgroundColor: activeTheme.primary,
                                                opacity: loginData.rememberMe ? 1 : 0
                                            }}
                                        ></div>
                                    </div>
                                    remember me
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    className="hover:underline opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                                    style={{ color: activeTheme.primary }}
                                >
                                    forgot password?
                                </button>
                            </motion.div>

                            <motion.button
                                variants={itemVariants}
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all hover:scale-[1.01] active:scale-[0.99] mt-4 shadow-lg cursor-pointer disabled:opacity-50"
                                style={{ backgroundColor: activeTheme.primary, color: activeTheme.bg }}
                            >
                                <LogIn size={20} />
                                {isLoading ? "signing in..." : "sign in"}
                            </motion.button>
                        </form>
                    </motion.div>

                </motion.div>
            </main>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md p-8 rounded-3xl shadow-2xl relative"
                        style={{ backgroundColor: activeTheme.bg, border: `1px solid ${activeTheme.bgAlt}` }}
                    >
                        <button
                            onClick={() => setShowForgotModal(false)}
                            className="absolute top-6 right-6 opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            <ArrowLeft size={18} />
                        </button>

                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <h3 className="text-xl font-bold" style={{ color: activeTheme.text }}>forgot password</h3>
                                <p className="text-xs opacity-60">Enter your email and we'll send you a link to reset your password.</p>
                            </div>

                            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                                <input
                                    type="email"
                                    placeholder="your email"
                                    required
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    className="w-full px-5 py-3 rounded-xl outline-none transition-all focus:ring-2 border border-transparent shadow-sm"
                                    style={{ ...inputStyle, "--tw-ring-color": activeTheme.primary } as any}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 rounded-xl font-bold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg cursor-pointer disabled:opacity-50"
                                    style={{ backgroundColor: activeTheme.primary, color: activeTheme.bg }}
                                >
                                    {isLoading ? "sending..." : "send reset link"}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}

            <footer className="p-12 text-center text-[10px] tracking-widest uppercase opacity-20 flex flex-col gap-4 z-10">
                <div className="flex justify-center gap-8">
                    <button className="hover:opacity-100 transition-opacity cursor-pointer">about</button>
                    <button className="hover:opacity-100 transition-opacity cursor-pointer">contact</button>
                    <button className="hover:opacity-100 transition-opacity cursor-pointer">terms</button>
                    <button className="hover:opacity-100 transition-opacity cursor-pointer">privacy</button>
                </div>
                <Link href="/" className="hover:opacity-100 transition-opacity cursor-pointer">typeflow &copy; 2026</Link>
            </footer>
        </div>
    );
}
