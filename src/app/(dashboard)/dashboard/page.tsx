"use client";
import React from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
    const { update, data, status } = useSession();
    if (status == "unauthenticated") {
        useRouter().push("/login");
        return <></>;
    }
    return (
        <>
            <header>
                <h1>{data?.user?.name}!</h1>
                <h1>WelCome to Dashboard</h1>
                <h2></h2>
            </header>
            <main>
                <Button onClick={() => signOut()}>Logout</Button>
            </main>
        </>
    );
}
