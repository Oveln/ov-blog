import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/theme-provider";
import React from "react";
import { MySessionProviders } from "@/context/MySessionProvider";
import { NavMenuDashboard } from "@/components/layout/nav-menu-dashboard";
import { NavMenu } from "@/components/layout/nav-menu";
import { auth } from "@/lib/auth/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Oveln Blog",
    description: "Oveln的小站，记录一些有趣的事"
};

export default async function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();
    return (
        <html lang="en" className="m-0 p-0">
            <body
                className={
                    "mx-auto max-w-[calc(100vw-10px)] px-2 lg:px-0 w-screen h-screen bg-muted/40 " +
                    inter.className
                }
            >
                <MySessionProviders>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <nav className="mx-auto max-w-[68rem]">
                            <NavMenu />
                        </nav>
                        <div className="h-[calc(100vh-62px)] w-[calc(100vw-10px)] mx-auto flex border rounded-2xl overflow-hidden my-0">
                            <aside className="inset-y-0 left-0 z-10 w-14 flex-col border-r sm:flex bg-background">
                                <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                                    <NavMenuDashboard />
                                </nav>
                            </aside>
                            <main className="flex-1">{children}</main>
                        </div>
                    </ThemeProvider>
                </MySessionProviders>
            </body>
        </html>
    );
}
