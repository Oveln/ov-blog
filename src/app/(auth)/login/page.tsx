"use client";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { signIn } from "next-auth/react";
import React from "react";
export default function Login() {
    return (
        <main className="min-h-screen flex items-center justify-center from-slate-100 to-slate-200/70 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-10 transform hover:scale-[1.01] transition-all duration-300">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 space-y-8">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Welcome back
                        </h1>
                        <p className="text-sm text-gray-600">Sign in to your account</p>
                    </div>

                    <button
                        onClick={() =>
                            signIn("github", {
                                redirect: true,
                                callbackUrl: "/dashboard",
                            })
                        }
                        className="w-full h-12 relative overflow-hidden group bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-md"
                    >
                        <div className="absolute inset-0 w-full h-full transition-all duration-300 group-hover:bg-gray-50/80"></div>
                        <div className="relative flex items-center justify-center gap-3">
                            <GitHubLogoIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                            <span className="font-medium">Continue with Github</span>
                        </div>
                    </button>
                </div>
            </div>
        </main>
    );
}
