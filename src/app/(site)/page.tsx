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
        <main className={"relative h-[calc(100vh-56px)]  font-mono"}>
            <div className="absolute mt-[15%] flex w-full items-center md:flex-row flex-col">
                <div className="flex-1 md:pl-0">
                    <p
                        className=" text-3xl md:text-5xl 2xl:text-6xl animate-fade-up animate-ease-in-out animate-duration-300"
                        style={{
                            animationDelay: `${getT() * 100}ms`
                        }}
                    >
                        {"Hi!👋"}
                    </p>
                    <p
                        className="mt-1 text-3xl md:text-5xl 2xl:text-6xl animate-fade-up animate-ease-in-out animate-duration-300"
                        style={{
                            animationDelay: `${getT() * 100}ms`
                        }}
                    >
                        {"I'm "}
                        <span className="text-fuchsia-500 text-opacity-85">Oveln🎉</span>
                    </p>
                    <p
                        className="mt-4 text-lg animate-fade-up animate-ease-in-out animate-duration-300"
                        style={{
                            animationDelay: `${getT() * 100}ms`
                        }}
                    >
                        Language:&nbsp;
                        <span className="text-amber-700 font-bold">Rust</span>/
                        <span className="text-blue-500 font-bold">Typescript</span>/
                        <span className="text-green-500 font-bold">Python</span>
                    </p>
                    <p
                        className="text-lg animate-fade-up animate-ease-in-out animate-duration-300"
                        style={{
                            animationDelay: `${getT() * 100}ms`
                        }}
                    >
                        Programing⌨️ and Gaming🎮
                    </p>
                    <div
                        className="animate-fade-up animate-ease-in-out animate-duration-300"
                        style={{
                            animationDelay: `${getT() * 100}ms`
                        }}
                    >
                        {ovLinks.map((link) => {
                            return (
                                <Link
                                    key={link.name}
                                    href={link.url}
                                    className="p-0 mr-3 inline-flex w-fit text-lg items-center animated-underline hover:animated-underline-hover"
                                >
                                    <span className="">{link.name}</span>
                                    {link.icon}
                                </Link>
                            );
                        })}
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center md:flex-row flex-col">
                    <div className="flex-1 flex justify-center">
                        <Typing
                            className="text-2xl text-left w-full"
                            text={`print!("Hello World!")`}
                            speed={100}
                        />
                    </div>
                    <Avatar className="size-72 mx-auto">
                        <AvatarImage src="./avatar.jpg" />
                        <AvatarFallback>Oveln</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </main>
    );
}
