import SignIn from "@/components/ui/auth/sign-in";
import React from "react";
export default async function Login() {
    return (
        // 全局居中
        <main className="flex justify-center items-center h-screen">
            <SignIn />
        </main>
    );
}
