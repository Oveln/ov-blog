"use client";
import * as React from "react";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle
} from "../ui/navigation-menu";
import Link from "next/link";
export function NavMenu() {
    return (
        <NavigationMenu className="my-2 mx-auto lg:mx-0">
            <NavigationMenuList>
                <NavigationMenuItem>
                    <Link href="/" className={navigationMenuTriggerStyle()}>
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
                    <NavigationMenuTrigger>Apps</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        {/* <NavigationMenuLink>Link</NavigationMenuLink> */}
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <Link className={navigationMenuTriggerStyle()} href="/about" passHref>
                        About
                    </Link>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
}
