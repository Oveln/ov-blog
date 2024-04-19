"use client";
import { signOut } from "next-auth/react";
import React from "react";
import { Button } from "../button";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

export default function SignOutButton() {
    return (
        <Button onClick={() => signOut({ redirect: true, callbackUrl: "/" })}>
            <GitHubLogoIcon></GitHubLogoIcon>
            Github
        </Button>
    );
}
