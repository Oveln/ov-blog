"use client";
import * as React from "react";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger
} from "../ui/navigation-menu";
import Link from "next/link";
export function NavMenu() {
    return (
        <NavigationMenu className="my-2 mx-auto lg:mx-0">
            <NavigationMenuList>
                <NavigationMenuItem>
                    <Link
                        href="/"
                        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium pl-0 hover:underline underline-offset-4"
                    >
                        Home
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Blogs</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        {/* <NavigationMenuLink className="p-96">Link</NavigationMenuLink> */}
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/apps">
                        <NavigationMenuTrigger>Apps</NavigationMenuTrigger>
                    </Link>
                    <NavigationMenuContent>
                        {/* <NavigationMenuLink>Link</NavigationMenuLink> */}
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link
                        className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium pr-0 hover:underline underline-offset-4"
                        href="/about"
                    >
                        About
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}
