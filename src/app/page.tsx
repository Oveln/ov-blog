'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useLoaded from "@/hooks/useLoaded";
import { EnvelopeClosedIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import Link from "next/link";
import React from "react";
import { useSession } from "next-auth/react";

const ovLinks = [
    {
        name: "Github",
        url: "https://Github.com/Oveln",
        icon: <GitHubLogoIcon className="size-5" />
    },
    {
        name: "Email",
        url: "mailto:oveln@outlook.com",
        icon: <EnvelopeClosedIcon className="size-5" />
    }
];

export default function  Home() {
    // const [isLoaded, setIsLoaded] = useState(false);
    // setTimeout(() => {
    //     setIsLoaded(true)
    // }, 200);
    const isLoaded = useLoaded();
    return (
        <main className={clsx("relative h-[calc(100vh-56px)]", isLoaded && "fade-in-start")}>
            <div className="absolute mt-[15%] flex w-full items-center md:flex-row flex-col">
                <div className="flex-1 p-10 md:pl-0">
                    <h1 className="text-2xl md:text-4xl 2xl:text-5xl" data-fade="1">
                        {"Hi!👋"}
                    </h1>
                    <h1 className="mt-1 text-3xl md:text-5xl 2xl:text-6xl" data-fade="2">
                        {"I'm "}
                        <span className="text-fuchsia-500 text-opacity-85">Oveln🎉</span>
                    </h1>
                    <h1 className="mt-5 text-lg" data-fade="3">
                        A Student && Developer
                    </h1>
                    <h1 className="text-lg" data-fade="3">
                        Love Coding⌨️ and Gameing🎮
                    </h1>
                    <div className="mt-2" data-fade="4">
                        {ovLinks.map((link) => {
                            return (
                                <Link
                                    key={link.name}
                                    href={link.url}
                                    className="p-0 mr-1 inline-flex w-fit animated-underline hover:animated-underline-hover"
                                >
                                    {link.icon}
                                    <span className="ml-1">{link.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
                <div className="flex-1" data-fade="1">
                    <Avatar className="size-72 mx-auto">
                        <AvatarImage src="./avatar.jpg" />
                        <AvatarFallback>Oveln</AvatarFallback>
                    </Avatar>
                </div>
                <div>
                    <div className="absolute right-0 bottom-0 text-gray-400 text-xs">
                        {"© 2021 Oveln" + useSession().data?.user}
                    </div>
                </div>
            </div>
        </main>
    );
}
