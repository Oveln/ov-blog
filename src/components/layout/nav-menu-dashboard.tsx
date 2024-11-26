"use client";
import * as React from "react";
import Link from "next/link";
import { HomeIcon, LucideIcon, NotebookPenIcon, PencilLine, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import { Tooltip, TooltipContent, TooltipProvider } from "../ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";

interface NavItem {
    name: string;
    to: string;
    icon: LucideIcon;
}

const navItems: NavItem[] = [
    {
        name: "仪表盘",
        to: "/dashboard",
        icon: HomeIcon
    },
    {
        name: "新文章",
        to: "/dashboard/post-edit/new",
        icon: PencilLine
    },
    {
        name: "文章管理",
        to: "/dashboard/post-edit",
        icon: NotebookPenIcon
    }
];

const adminItems: NavItem[] = [
    {
        name: "应用管理",
        to: "/dashboard/apps",
        icon: Settings
    }
];

export function NavMenuDashboard() {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "ADMIN";
    
    const displayItems = isAdmin ? [...navItems, ...adminItems] : navItems;

    return (
        <TooltipProvider>
            <ul>
                {displayItems.map((item, index) => (
                    <li key={index} className="group w-full h-12 group-hover:scale-110 ">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.to}
                                    className="w-full h-full flex justify-center items-center"
                                >
                                    <item.icon className="group-hover:scale-110 h-7 w-7 transition-all"></item.icon>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">{item.name}</TooltipContent>
                        </Tooltip>
                    </li>
                ))}
            </ul>
        </TooltipProvider>
    );
}
