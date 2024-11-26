import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/context/theme-provider";
import React from "react";
import { NavMenu } from "@/components/layout/nav-menu";
import Footer from "@/components/layout/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Oveln Blog",
    description: "Oveln的小站，记录一些有趣的事"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" className="m-0 p-0" suppressHydrationWarning>
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <div
                        className={
                            "mx-auto max-w-[75rem] px-2 lg:px-0 w-screen h-screen " +
                            inter.className
                        }
                        data-scroll-lock="1">
                        <NavMenu></NavMenu>
                        {children}

                        <Footer></Footer>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
