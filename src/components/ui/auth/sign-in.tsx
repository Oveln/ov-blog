'use client'
import { signIn } from "next-auth/react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Button } from "../button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export default function SignInCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>选择你的登录方式</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center">
                <Button
                    className="w-full"
                    onClick={() => signIn("github", { redirect: true, callbackUrl: "/dashboard" })}
                >
                    <GitHubLogoIcon></GitHubLogoIcon>
                    Github
                </Button>
            </CardContent>
        </Card>
    );
}
