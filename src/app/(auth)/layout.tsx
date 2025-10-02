import type { Metadata } from "next";
import { Noto_Sans_SC, JetBrains_Mono } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/context/theme-provider";
import React from "react";
import { MySessionProviders } from "@/context/MySessionProvider";
import { TRPCProvider } from "@/components/TRPCProvider";

const jetBrainsMono = JetBrains_Mono({ 
    subsets: ["latin"],
    display: "swap",
    variable: "--font-mono"
});

const notoSansSC = Noto_Sans_SC({ 
    subsets: ["latin"],
    weight: ["300", "400", "500", "700"],
    display: "swap",
    variable: "--font-sans"
});

export const metadata: Metadata = {
    title: "Oveln Blog",
    description: "Oveln的小站，记录一些有趣的事"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className="m-0 p-0" suppressHydrationWarning>
            <body
                className={
                    "mx-auto max-w-272 px-2 lg:px-0 w-screen h-screen " +
                    `${jetBrainsMono.variable} ${notoSansSC.variable}`
                }
            >
                <TRPCProvider>
                    <MySessionProviders>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="system"
                            enableSystem
                            disableTransitionOnChange
                        >
                            {children}
                        </ThemeProvider>
                    </MySessionProviders>
                </TRPCProvider>
            </body>
        </html>
    );
}
