"use client";

import { signIn } from "next-auth/react";
import { registerUser } from "@/app/actions/auth";
import { useMonkeyTypeStore } from "@/hooks/use-monkeytype-store";
import { THEMES } from "@/constants/themes";
import { UserPlus, LogIn, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { AuthenticMail } from "@/components/icons/AuthenticMail";
import { AuthenticGithub } from "@/components/icons/AuthenticGithub";
import { AuthenticDiscord } from "@/components/icons/AuthenticDiscord";
import { AuthenticTwitter } from "@/components/icons/AuthenticTwitter";
import { AuthenticSupport } from "@/components/icons/AuthenticSupport";
import { AuthenticTerms } from "@/components/icons/AuthenticTerms";
import { AuthenticSecurity } from "@/components/icons/AuthenticSecurity";
import { AuthenticPrivacy } from "@/components/icons/AuthenticPrivacy";
import { useState, useEffect } from "react";
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

    // Listen for auth success from popup
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            if (event.data === "auth-success") {
                router.push("/");
                router.refresh();
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [router]);

    const handleGooglePopup = () => {
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
            "/auth/popup-signin",
            "google-signin",
            `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
        );

        if (!popup) {
            // Fallback for popup blockers
            signIn("google", { callbackUrl: "/" });
        }
    };

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

        const refId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get("ref") : null;
        if (refId) {
            formData.append("ref", refId);
        }

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
        } catch {
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
        border: "none",
        outline: "none",
        fontSize: "0.85rem",
    };

    const buttonStyle = {
        backgroundColor: activeTheme.bgAlt,
        color: activeTheme.text,
        fontSize: "0.85rem",
    };

    return (
        <div className="flex-1 flex flex-col items-center">

            <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 z-10 w-full">
                <div className="w-full max-w-[950px] grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-24 gap-y-16 py-8 md:py-20 items-start">
                    {/* Register Section */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col gap-6"
                    >
                        <div className="flex items-center gap-2 text-xl font-bold" style={{ color: activeTheme.text }}>
                            <UserPlus size={20} style={{ color: activeTheme.primary }} />
                            <span>register</span>
                        </div>

                        <form onSubmit={handleRegister} className="flex flex-col gap-2">
                                <motion.input
                                    variants={itemVariants}
                                    whileFocus={{ scale: 1.01 }}
                                    type="text"
                                    placeholder="username"
                                    required
                                    value={registerData.name}
                                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-lg transition-all focus:bg-white/[0.03] cursor-text"
                                    style={inputStyle}
                                />
                                <motion.input
                                    variants={itemVariants}
                                    whileFocus={{ scale: 1.01 }}
                                    type="email"
                                    placeholder="email"
                                    required
                                    value={registerData.email}
                                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-lg transition-all focus:bg-white/[0.03] cursor-text"
                                    style={inputStyle}
                                />
                                <motion.input
                                    variants={itemVariants}
                                    whileFocus={{ scale: 1.01 }}
                                    type="email"
                                    placeholder="verify email"
                                    required
                                    value={registerData.verifyEmail}
                                    onChange={(e) => setRegisterData({ ...registerData, verifyEmail: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-lg transition-all focus:bg-white/[0.03] cursor-text"
                                    style={inputStyle}
                                />
                                <motion.div variants={itemVariants} className="relative">
                                    <motion.input
                                        whileFocus={{ scale: 1.01 }}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="password"
                                        required
                                        value={registerData.password}
                                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-lg transition-all focus:bg-white/[0.03] cursor-text"
                                        style={inputStyle}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </motion.div>
                                <motion.div variants={itemVariants} className="relative">
                                    <motion.input
                                        whileFocus={{ scale: 1.01 }}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="verify password"
                                        required
                                        value={registerData.verifyPassword}
                                        onChange={(e) => setRegisterData({ ...registerData, verifyPassword: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-lg transition-all focus:bg-white/[0.03] cursor-text"
                                        style={inputStyle}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </motion.div>

                                <motion.button
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold transition-all hover:bg-white/[0.05] mt-2 group cursor-pointer"
                                    style={buttonStyle}
                                >
                                    <UserPlus size={16} className="group-hover:text-primary transition-colors" style={{ color: activeTheme.primary }} />
                                    {isLoading ? "registering..." : "sign up"}
                                </motion.button>
                        </form>
                    </motion.div>

                    {/* Login Section */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col gap-6"
                    >
                        <div className="flex items-center gap-2 text-xl font-bold" style={{ color: activeTheme.text }}>
                            <LogIn size={20} style={{ color: activeTheme.primary }} />
                            <span>login</span>
                        </div>

                        {/* Social Logins */}
                        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleGooglePopup}
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all hover:bg-white/[0.05] group cursor-pointer"
                                    style={buttonStyle}
                                >
                                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-3.5 h-3.5 grayscale group-hover:grayscale-0 transition-all opacity-60 group-hover:opacity-100" />
                                    <span className="font-bold">Google</span>
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => signIn("github", { callbackUrl: "/" })}
                                    className="flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all hover:bg-white/[0.05] group cursor-pointer"
                                    style={buttonStyle}
                                >
                                    <AuthenticGithub size={16} className="opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all" />
                                    <span className="font-bold">GitHub</span>
                                </motion.button>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex items-center gap-4 py-2 opacity-30">
                            <div className="flex-1 h-px bg-current"></div>
                            <span className="text-[10px] uppercase font-bold tracking-widest">or</span>
                            <div className="flex-1 h-px bg-current"></div>
                        </motion.div>

                        {/* Feedback Messages */}
                        {(error || success) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`text-[10px] text-center font-bold px-4 py-2 rounded-lg ${error ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}
                            >
                                {error || success}
                            </motion.div>
                        )}

                        <form onSubmit={handleLogin} className="flex flex-col gap-2">
                                <motion.input
                                    variants={itemVariants}
                                    whileFocus={{ scale: 1.01 }}
                                    type="email"
                                    placeholder="email"
                                    required
                                    value={loginData.email}
                                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                    className="w-full px-3 py-2.5 rounded-lg transition-all focus:bg-white/[0.03] cursor-text"
                                    style={inputStyle}
                                />
                                <motion.div variants={itemVariants} className="relative">
                                    <motion.input
                                        whileFocus={{ scale: 1.01 }}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="password"
                                        required
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-lg transition-all focus:bg-white/[0.03] cursor-text"
                                        style={inputStyle}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </motion.div>

                            <motion.div variants={itemVariants} className="flex items-center justify-between text-[10px] px-1 font-bold">
                                <label className="flex items-center gap-2 cursor-pointer group select-none opacity-60 hover:opacity-100 transition-opacity">
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={loginData.rememberMe}
                                        onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                                    />
                                    <div
                                        className="w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center transition-all bg-transparent"
                                        style={{ borderColor: activeTheme.textDim + "40" }}
                                    >
                                        <motion.div
                                            initial={false}
                                            animate={{ opacity: loginData.rememberMe ? 1 : 0 }}
                                            className="w-2 h-2 rounded-[1px]"
                                            style={{ backgroundColor: activeTheme.primary }}
                                        />
                                    </div>
                                    <span>remember me</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    className="opacity-40 hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-1 group"
                                >
                                    <span className="group-hover:text-primary transition-colors">forgot password?</span>
                                </button>
                            </motion.div>

                                <motion.button
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold transition-all hover:bg-white/[0.05] mt-2 group cursor-pointer"
                                    style={buttonStyle}
                                >
                                    <LogIn size={16} className="group-hover:text-primary transition-colors" style={{ color: activeTheme.primary }} />
                                    {isLoading ? "signing in..." : "sign in"}
                                </motion.button>
                        </form>
                    </motion.div>
                </div>
            </main>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-sm p-8 rounded-lg relative overflow-hidden flex flex-col gap-6"
                        style={{ backgroundColor: activeTheme.bg }}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold" style={{ color: activeTheme.text }}>forgot password</h3>
                            <button
                                onClick={() => setShowForgotModal(false)}
                                className="opacity-30 hover:opacity-100 transition-opacity cursor-pointer rounded-full p-1"
                            >
                                <ArrowLeft size={16} />
                            </button>
                        </div>
                        
                        <p className="text-xs leading-relaxed opacity-60">
                            Enter your email and we'll send you a link to reset your password.
                        </p>

                        <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder="your email"
                                required
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg outline-none"
                                style={inputStyle}
                            />
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-2.5 rounded-lg font-bold transition-all hover:bg-white/[0.05] cursor-pointer"
                                    style={buttonStyle}
                                >
                                    {isLoading ? "sending..." : "send reset link"}
                                </motion.button>
                        </form>
                    </motion.div>
                </div>
            )}

        </div>
    );
}




