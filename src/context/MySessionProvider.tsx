// provider.tsx
"use client";
import { SessionProvider } from "next-auth/react";
import React from "react";

export function MySessionProviders({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
}
