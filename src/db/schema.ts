import { timestamp, pgTable, text, primaryKey, integer, varchar, jsonb, index } from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const users = pgTable("user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    password: text("password"),
    bio: text("bio"),
    keyboard: text("keyboard"),
    level: integer("level").default(1).notNull(),
    xp: integer("xp").default(0).notNull(),
    streak: integer("streak").default(0).notNull(),
    testsStarted: integer("tests_started").default(0).notNull(),
    testsCompleted: integer("tests_completed").default(0).notNull(),
    typingTime: integer("typing_time").default(0).notNull(), // in seconds
    lastTestAt: timestamp("last_test_at", { mode: "date" }),
    joinedAt: timestamp("joined_at", { mode: "date" }).defaultNow().notNull(),
    settings: jsonb("settings").default({
        appearance: { theme: "codex", font: "inter", fontSize: 16 },
        gameplay: { showWpm: true, showAccuracy: true, sound: true },
    }).notNull(),
    role: varchar("role", { length: 20 }).default("user").notNull(),
});

export const userAchievements = pgTable("user_achievement", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    achievementId: varchar("achievement_id", { length: 100 }).notNull(),
    unlockedAt: timestamp("unlocked_at", { mode: "date" }).defaultNow().notNull(),
});

export const passwordResetTokens = pgTable(
    "passwordResetToken",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        email: text("email").notNull(),
        token: text("token").unique().notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    }
);

export const accounts = pgTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccountType>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => [
        primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    ]
);

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (verificationToken) => [
        primaryKey({
            columns: [verificationToken.identifier, verificationToken.token],
        }),
    ]
);

// Our custom typing results table
export const typingResults = pgTable("typing_result", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    wpm: integer("wpm").notNull(),
    rawWpm: integer("raw_wpm").notNull(),
    accuracy: integer("accuracy").notNull(),
    consistency: integer("consistency"),
    mode: varchar("mode", { length: 50 }).notNull(),
    config: integer("config").notNull(),
    language: varchar("language", { length: 50 }).notNull(),
    theme: varchar("theme", { length: 50 }).notNull(),
    duration: integer("duration"),
    missedChars: integer("missed_chars"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
}, (table) => {
    return {
        leaderboardIdx: index("leaderboard_idx").on(table.mode, table.config, table.language, table.wpm, table.createdAt),
        userBestIdx: index("user_best_idx").on(table.userId, table.mode, table.config, table.language, table.wpm),
    };
});

export const notifications = pgTable("notification", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .references(() => users.id, { onDelete: "cascade" }), // Nullable for global announcements
    type: varchar("type", { length: 50 }).notNull(), // 'inbox', 'announcement', 'notification'
    title: text("title").notNull(),
    message: text("message").notNull(),
    read: integer("read").default(0).notNull(), // 0 = unread, 1 = read
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Invite Links / Referral Tracking
export const referrals = pgTable("referral", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    referrerId: text("referrer_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    referredId: text("referred_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
