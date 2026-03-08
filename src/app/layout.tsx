import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Hanuman } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-jetbrains",
  display: "swap",
});

const hanuman = Hanuman({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["khmer", "latin"],
  variable: "--font-hanuman",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#323437",
};

export const metadata: Metadata = {
  title: "TypeFlow — Typing Speed Test",
  description:
    "A premium typing speed test with English and Khmer support. Track your WPM, accuracy, and consistency with beautiful themes and detailed analytics.",
  keywords: ["typing test", "wpm", "speed test", "khmer typing", "monkeytype"],
  openGraph: {
    title: "TypeFlow — Typing Speed Test",
    description: "Premium typing speed test with real-time analytics",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.variable} ${hanuman.variable} antialiased`}
        suppressHydrationWarning
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
