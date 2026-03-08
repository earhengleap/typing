"use server";

import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
        return { error: validatedFields.error.errors[0].message };
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

        await db.insert(users).values({
            name,
            email,
            password: hashedPassword,
        });

        // Send Welcome Email
        try {
            await resend.emails.send({
                from: "TypeFlow <onboarding@resend.dev>",
                to: email,
                subject: "Welcome to TypeFlow!",
                html: `
                    <div style="font-family: monospace; color: #d1d0c5; background-color: #323437; padding: 40px; border-radius: 20px;">
                        <h1 style="color: #e2b714; font-size: 24px; border-bottom: 2px solid #e2b714; padding-bottom: 10px;">Welcome to TypeFlow, ${name}!</h1>
                        <p style="font-size: 16px; line-height: 1.6;">Your account has been successfully created. You can now start tracking your typing speed, accuracy, and history across all your devices.</p>
                        <div style="margin: 30px 0;">
                            <a href="${process.env.AUTH_URL || 'http://localhost:3000'}/login" style="background-color: #e2b714; color: #323437; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Sign In Now</a>
                        </div>
                        <p style="font-size: 12px; opacity: 0.6; margin-top: 40px;">If you didn't create this account, please ignore this email.</p>
                        <p style="font-size: 10px; opacity: 0.4;">TypeFlow &copy; 2026</p>
                    </div>
                `,
            });
        } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
            // We don't return an error here because the account WAS created successfully
        }

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

        // Send Password Reset Email
        const resetUrl = `${process.env.AUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

        try {
            await resend.emails.send({
                from: "TypeFlow <onboarding@resend.dev>",
                to: email,
                subject: "Reset Your Password - TypeFlow",
                html: `
                    <div style="font-family: monospace; color: #d1d0c5; background-color: #323437; padding: 40px; border-radius: 20px;">
                        <h1 style="color: #e2b714; font-size: 24px; border-bottom: 2px solid #e2b714; padding-bottom: 10px;">Password Reset Request</h1>
                        <p style="font-size: 16px; line-height: 1.6;">We received a request to reset your password. Click the button below to choose a new one. This link will expire in 1 hour.</p>
                        <div style="margin: 30px 0;">
                            <a href="${resetUrl}" style="background-color: #e2b714; color: #323437; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
                        </div>
                        <p style="font-size: 14px; opacity: 0.8;">Or copy and paste this link into your browser:</p>
                        <p style="font-size: 12px; color: #e2b714; word-break: break-all;">${resetUrl}</p>
                        <p style="font-size: 12px; opacity: 0.6; margin-top: 40px;">If you didn't request a password reset, you can safely ignore this email.</p>
                        <p style="font-size: 10px; opacity: 0.4;">TypeFlow &copy; 2026</p>
                    </div>
                `,
            });
        } catch (emailError) {
            console.error("Failed to send reset email:", emailError);
            // Log it but still return generic success for security
        }

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
