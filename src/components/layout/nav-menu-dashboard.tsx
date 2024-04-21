"use client";
import * as React from "react";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger
} from "../ui/navigation-menu";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { HomeIcon, LucideIcon, NotebookPenIcon, SettingsIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider } from "../ui/tooltip";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
interface NavItem {
    name: string;
    to: string;
    icon: LucideIcon;
}
const navItems: NavItem[] = [
    {
        name: "Home",
        to: "/",
        icon: HomeIcon
    },
    {
        name: "Dashboard",
        to: "/dashboard/post-edit",
        icon: NotebookPenIcon
    }
];
export function NavMenuDashboard() {
    const { update, data, status } = useSession();
    return (
        // 以父组件为基准，继承其宽度
        <TooltipProvider>
            <ul>
                {navItems.map((item, index) => (
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
        // <div className="bg-red-400 h-5"></div>
    );
}
