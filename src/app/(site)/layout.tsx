import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/context/theme-provider";
import React from "react";
import { NavMenu } from "@/components/layout/nav-menu";
import Footer from "@/components/layout/footer";
import { TRPCProvider } from "@/components/TRPCProvider";

const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Oveln Blog",
    description: "Oveln的小站，记录一些有趣的事"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className="m-0 p-0" suppressHydrationWarning>
            <body>
                <TRPCProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <div className={`mx-auto max-w-[calc(100vw-10px)] lg:px-0 w-screen min-h-screen flex flex-col ${jetBrainsMono.className}`}>
                            <nav className="mx-auto w-full max-w-[68rem]">
                                <NavMenu />
                            </nav>
                            <div className="mx-auto w-full max-w-[68rem] flex-1">
                                {children}
                            </div>
                            <Footer />
                        </div>
                    </ThemeProvider>
                </TRPCProvider>
            </body>
        </html>
    );
}
