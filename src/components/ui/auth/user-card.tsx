"use client";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader } from "../card";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";

export const UserCard = () => {
    const { data } = useSession();
    return (
        <Card>
            <CardHeader>{data?.user?.name}</CardHeader>
            <CardContent>
                <Avatar>
                    <AvatarImage src={data!.user!.image!} />
                    <AvatarFallback>Oveln</AvatarFallback>
                </Avatar>
            </CardContent>
        </Card>
    );
};
