import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EnvelopeClosedIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React from "react";

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

export default function Home() {
    let t = 0;
    const getT = () => {
        return t++;
    };
    return (
        <main className={"relative h-[calc(100vh-56px)]"}>
            <div className="absolute mt-[15%] flex w-full items-center md:flex-row flex-col">
                <div className="flex-1 p-10 md:pl-0">
                    <h1
                        className="text-2xl md:text-4xl 2xl:text-5xl animate-fade-up animate-ease-in-out animate-duration-300"
                        style={{
                            animationDelay: `${getT() * 100}ms`
                        }}
                    >
                        {"Hi!👋"}
                    </h1>
                    <h1
                        className="mt-1 text-3xl md:text-5xl 2xl:text-6xl animate-fade-up animate-ease-in-out animate-duration-300"
                        style={{
                            animationDelay: `${getT() * 100}ms`
                        }}
                    >
                        {"I'm "}
                        <span className="text-fuchsia-500 text-opacity-85">Oveln🎉</span>
                    </h1>
                    <h1
                        className="mt-5 text-lg animate-fade-up animate-ease-in-out animate-duration-300"
                        style={{
                            animationDelay: `${getT() * 100}ms`
                        }}
                    >
                        A Student && Developer
                    </h1>
                    <h1
                        className="text-lg animate-fade-up animate-ease-in-out animate-duration-300"
                        style={{
                            animationDelay: `${getT() * 100}ms`
                        }}
                    >
                        Love Coding⌨️ and Gameing🎮
                    </h1>
                    <div
                        className="mt-2 animate-fade-up animate-ease-in-out animate-duration-300"
                        style={{
                            animationDelay: `${getT() * 100}ms`
                        }}
                    >
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
                <div className="flex-1">
                    <Avatar className="size-72 mx-auto">
                        <AvatarImage src="./avatar.jpg" />
                        <AvatarFallback>Oveln</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </main>
    );
}
