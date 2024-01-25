import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/theme-provider";
import React from "react";
import { NavMenu } from "@/components/layout/nav-menu";
import Footer from "@/components/layout/footer";
import { PreloadProvider } from "@/context/PreloadContext";

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
            <body className={"mx-auto max-w-[68rem] px-2 lg:px-0 w-screen h-screen" + inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <NavMenu></NavMenu>
                    <PreloadProvider>{children}</PreloadProvider>

                    <Footer></Footer>
                </ThemeProvider>
            </body>
        </html>
    );
}
