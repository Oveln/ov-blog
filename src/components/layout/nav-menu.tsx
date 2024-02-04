"use client";
import * as React from "react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "../ui/navigation-menu";
import Link from "next/link";
const linkClass =
    "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium pl-0 hover:underline underline-offset-4";
export function NavMenu() {
    return (
        <NavigationMenu className="my-2 mx-auto lg:mx-0">
            <NavigationMenuList>
                <NavigationMenuItem>
                    <Link href="/" className={linkClass}>
                        Home
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/blogs" className={linkClass}>
                        Blogs
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/apps" className={linkClass}>
                        Apps
                    </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link href="/about" className={linkClass}>
                        About
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}
