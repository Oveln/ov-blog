import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/context/theme-provider";
import React from "react";
import { MySessionProviders } from "@/context/MySessionProvider";
import { NavMenuDashboard } from "@/components/layout/nav-menu-dashboard";
import { NavMenu } from "@/components/layout/nav-menu";
import { Toaster } from "@/components/ui/sonner";

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
    return (
        <html lang="en" className="m-0 p-0" suppressHydrationWarning>
            <body>
                <MySessionProviders>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <div className={`mx-auto max-w-[calc(100vw-10px)] lg:px-0 w-screen min-h-screen flex flex-col ${inter.className}`}>
                            <nav className="mx-auto w-full max-w-[68rem]">
                                <NavMenu />
                            </nav>
                            <div className="mx-auto w-full flex-1">
                                <div className="h-[calc(100vh-62px-2rem)] flex border rounded-2xl overflow-hidden my-4">
                                    <aside className="inset-y-0 left-0 z-10 w-14 flex-col border-r sm:flex bg-background shadow-xl">
                                        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                                            <NavMenuDashboard />
                                        </nav>
                                    </aside>
                                    <main className="flex-1">{children}</main>
                                </div>
                            </div>
                        </div>
                    </ThemeProvider>
                </MySessionProviders>
                <Toaster />
            </body>
        </html>
    );
}
