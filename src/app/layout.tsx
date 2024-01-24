import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import React from "react";
import { NavMenu } from "@/components/layout/nav-menu";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Oveln Blog",
    description: "Oveln的小站，记录一些有趣的事"
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="m-0 p-0">
            <body className={"mx-80 " + inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <NavMenu></NavMenu>
                    {children}

                    <footer></footer>
                </ThemeProvider>
            </body>
        </html>
    );
}
