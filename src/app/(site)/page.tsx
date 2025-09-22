import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Typing from "@/components/ui/typing";
import { EnvelopeClosedIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React from "react";

const ovLinks = [
    {
        name: "github",
        url: "https://github.com/Oveln",
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
        <main className="relative min-h-[calc(100vh-56px)] font-mono bg-gradient-to-b from-transparent to-gray-50/30">
            <div className="absolute w-full top-14 md:top-1/3 -translate-y-0 md:-translate-y-1/2 px-4 md:px-12">
                <div className="max-w-7xl mx-auto flex items-center gap-8 md:flex-row flex-col">
                    {/* Left content section */}
                    <div className="flex-1 space-y-6">
                        <p
                            className="text-4xl md:text-6xl 2xl:text-7xl font-mono font-bold animate-fade-up"
                            style={{
                                animationDelay: `${getT() * 100}ms`
                            }}
                        >
                            {"Hi!👋"}
                        </p>
                        <p
                            className="text-4xl md:text-6xl 2xl:text-7xl font-mono font-bold animate-fade-up"
                            style={{
                                animationDelay: `${getT() * 100}ms`
                            }}
                        >
                            {"I'm "}
                            <span className="text-fuchsia-500 text-opacity-85">Oveln🎉</span>
                        </p>

                        {/* Language and interests section */}
                        <div className="space-y-2">
                            <p
                                className="text-lg md:text-xl font-mono animate-fade-up"
                                style={{
                                    animationDelay: `${getT() * 100}ms`
                                }}
                            >
                                Language:&nbsp;
                                <span className="text-amber-700 font-mono font-bold hover:opacity-80 transition-opacity cursor-default">Rust</span>
                                <span className="mx-2">/</span>
                                <span className="text-blue-500 font-mono font-bold hover:opacity-80 transition-opacity cursor-default">Typescript</span>
                                <span className="mx-2">/</span>
                                <span className="text-green-500 font-mono font-bold hover:opacity-80 transition-opacity cursor-default">Python</span>
                            </p>
                            <p
                                className="text-lg md:text-xl font-mono animate-fade-up"
                                style={{
                                    animationDelay: `${getT() * 100}ms`
                                }}
                            >
                                Programing⌨️ and Gaming🎮
                            </p>
                        </div>
                        {/* Social links */}
                        <div
                            className="flex gap-4 animate-fade-up"
                            style={{
                                animationDelay: `${getT() * 100}ms`
                            }}
                        >
                            {ovLinks.map((link) => {
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.url}
                                        className="p-0 mr-3 inline-flex w-fit text-lg items-center animated-underline hover:animated-underline-hover font-mono"
                                    >
                                        <span className="">{link.name}</span>
                                        {link.icon}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    {/* Right content section */}
                    <div className="flex-1 flex flex-col items-center gap-8">
                        <Avatar className="size-64 md:size-72 ring-4 ring-fuchsia-500/20 hover:ring-fuchsia-500/40 transition-all duration-300">
                            <AvatarImage src="./avatar.jpg" className="object-cover" />
                            <AvatarFallback>Oveln</AvatarFallback>
                        </Avatar>
                        <div className="w-full max-w-md">
                            <Typing
                                className="text-2xl md:text-3xl text-center w-full font-mono"
                                text={`print!("Hello World!")`}
                                speed={100}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
