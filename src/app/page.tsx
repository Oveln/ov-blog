import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EnvelopeClosedIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React from "react";

export default function Home() {
    return (
        <main className="relative h-[calc(100vh-56px)]">
            <div className="absolute mt-[15%] flex w-full items-center">
                <div className="flex-1 p-10">
                    <h1 className="text-2xl md:text-4xl 2xl:text-5xl">{"Hi!👋"}</h1>
                    <h1 className="mt-1 text-3xl md:text-5xl 2xl:text-6xl">
                        {"I'm "}
                        <span className="text-fuchsia-500 text-opacity-85">Oveln🎉</span>
                    </h1>
                    <h1 className="mt-5 text-lg">A Student && Developer</h1>
                    <h1 className="text-lg">Love Coding⌨️ and Gameing🎮</h1>
                    <div className="mt-2 grid grid-cols-5">
                        <Button variant="link" className="p-0" asChild>
                            <Link href="https://Github.com/Oveln">
                                <GitHubLogoIcon className="size-5" />
                                <span className="ml-1">Github</span>
                            </Link>
                        </Button>
                        <Button variant="link" className="p-0" asChild>
                            <Link href="mailto:oveln@outlook.com">
                                <EnvelopeClosedIcon className="size-5" />
                                <span className="ml-1">Eamil</span>
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="flex-1 ">
                    <Avatar className="size-72 mx-auto">
                        <AvatarImage src="./avatar.jpg" />
                        <AvatarFallback>Oveln</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </main>
    );
}
