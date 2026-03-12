"use server";

import { db } from "@/db";
import { users, passwordResetTokens, referrals, userAchievements } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { after } from "next/server";

// Brevo API Configuration
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_API_KEY = process.env.BREVO_API_KEY;

const baseUrl = (process.env.AUTH_URL || "http://localhost:3000").replace(/\/$/, "");

// Professional Sender Configuration (Can be changed in Vercel settings)
const sender = {
    name: process.env.EMAIL_FROM_NAME || "TypeFlow",
    email: process.env.EMAIL_FROM_EMAIL || "noreply@typeflow.app"
};

/**
 * Optimized background email sender using Brevo API
 */
async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
    if (!BREVO_API_KEY) {
        console.warn("[AUTH] BREVO_API_KEY missing. Skipping email.");
        return;
    }

    try {
        const response = await fetch(BREVO_API_URL, {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender,
                to: [{ email: to }],
                subject,
                htmlContent: html
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }
    } catch (error) {
        console.error("[AUTH] Brevo Email Error:", error);
    }
}

// --- Email Template Components ---
const EMAIL_STYLES = {
    bg: "#323437",
    bgAlt: "#2c2e31",
    primary: "#e2b714",
    text: "#d1d0c5",
    textDim: "#646669",
    font: "'JetBrains Mono', 'Roboto Mono', monospace",
};

const getEmailWrapper = (content: string) => `
    <div style="background-color: ${EMAIL_STYLES.bg}; color: ${EMAIL_STYLES.text}; font-family: ${EMAIL_STYLES.font}; padding: 40px 20px; line-height: 1.5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: ${EMAIL_STYLES.bgAlt}; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <!-- Header -->
            <div style="padding: 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <div style="font-size: 28px; font-weight: 800; letter-spacing: -1px;">
                    typeflow<span style="color: ${EMAIL_STYLES.primary};">.</span>
                </div>
            </div>
            
            <!-- Body -->
            <div style="padding: 40px 30px;">
                ${content}
            </div>
            
            <!-- Footer -->
            <div style="padding: 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); background-color: rgba(0,0,0,0.1);">
                <div style="color: ${EMAIL_STYLES.textDim}; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
                    typed with <span style="color: ${EMAIL_STYLES.primary};">♥</span> by typeflow &copy; 2026
                </div>
                <div style="margin-top: 10px;">
                    <a href="${baseUrl}" style="color: ${EMAIL_STYLES.primary}; text-decoration: none; font-size: 12px; opacity: 0.8;">visit website</a>
                </div>
            </div>
        </div>
    </div>
`;

const RegisterSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function registerUser(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const verifyPassword = formData.get("verifyPassword") as string;

    if (password !== verifyPassword) {
        return { error: "Passwords do not match" };
    }

    const validatedFields = RegisterSchema.safeParse({ name, email, password });

    if (!validatedFields.success) {
        return { error: validatedFields.error.issues[0].message };
    }

    try {
        const [existingUser] = await db.select().from(users).where(eq(users.email, email));

        if (existingUser) {
            if (existingUser.password) {
                return { error: "User already exists with this email" };
            }

            // User exists via OAuth but has no password. Let's add it.
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.update(users)
                .set({ password: hashedPassword, name: name || existingUser.name })
                .where(eq(users.id, existingUser.id));

            return { success: "Account linked with password! You can now sign in." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [newUser] = await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
            xp: 0, // Gets updated below if referred
        }).returning({ id: users.id });

        // Handle Referral Invite Rewards
        const refId = formData.get("ref") as string | null;
        const cookieRefId = (await import("next/headers")).cookies().then(c => c.get("typeflow_ref")?.value);
        const finalRefId = refId || await cookieRefId;

        if (finalRefId && newUser?.id) {
            const { processReferral } = await import("@/app/actions/referrals");
            await processReferral(newUser.id, finalRefId);
        }

        // Send Welcome Email in background
        after(async () => {
            const welcomeContent = `
                <h2 style="color: ${EMAIL_STYLES.text}; font-size: 20px; margin-bottom: 20px;">welcome to the club, ${name}</h2>
                <p style="color: ${EMAIL_STYLES.textDim}; margin-bottom: 30px;">your account is ready. see how fast you can flow.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${baseUrl}/login" style="background-color: ${EMAIL_STYLES.primary}; color: ${EMAIL_STYLES.bg}; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                        launch typeflow
                    </a>
                </div>
            `;

            await sendEmail({
                to: email,
                subject: "welcome to typeflow.",
                html: getEmailWrapper(welcomeContent),
            });
        });

        return { success: "Account created! You can now sign in." };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "Something went wrong during registration" };
    }
}

export async function forgotPassword(formData: FormData) {
    const email = formData.get("email") as string;

    if (!email) return { error: "Email is required" };

    try {
        const [user] = await db.select().from(users).where(eq(users.email, email));

        if (!user) {
            // Don't reveal if user exists or not for security, but we'll return success anyway
            return { success: "If an account exists with this email, a reset link will be sent." };
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 3600000); // 1 hour expiration

        // In a real app, delete old tokens first
        await db.insert(passwordResetTokens).values({
            email,
            token,
            expires,
        });

        // Send Password Reset Email in background
        const resetUrl = `${baseUrl}/reset-password?token=${token}`;

        after(async () => {
            const resetContent = `
                <h2 style="color: ${EMAIL_STYLES.text}; font-size: 20px; margin-bottom: 20px;">forgot your password?</h2>
                <p style="color: ${EMAIL_STYLES.textDim}; margin-bottom: 30px;">we received a request to reset your password. click below to choose a new one.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: ${EMAIL_STYLES.primary}; color: ${EMAIL_STYLES.bg}; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                        reset password
                    </a>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.1); border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
                    <p style="color: ${EMAIL_STYLES.primary}; font-size: 11px; word-break: break-all; margin: 0;">${resetUrl}</p>
                </div>
            `;

            await sendEmail({
                to: email,
                subject: "reset your password - typeflow.",
                html: getEmailWrapper(resetContent),
            });
        });

        return { success: "If an account exists with this email, a reset link will be sent." };
    } catch (error) {
        console.error("Forgot password error:", error);
        return { error: "Failed to process request" };
    }
}

export async function resetPassword(token: string, formData: FormData) {
    const password = formData.get("password") as string;
    const verifyPassword = formData.get("verifyPassword") as string;

    if (password !== verifyPassword) return { error: "Passwords do not match" };
    if (password.length < 6) return { error: "Password must be at least 6 characters" };

    try {
        const [resetToken] = await db.select()
            .from(passwordResetTokens)
            .where(eq(passwordResetTokens.token, token));

        if (!resetToken || resetToken.expires < new Date()) {
            return { error: "Invalid or expired token" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.email, resetToken.email));

        // Delete the token after use
        await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, resetToken.id));

        return { success: "Password reset successful! You can now sign in." };
    } catch (error) {
        console.error("Reset password error:", error);
        return { error: "Failed to reset password" };
    }
}
