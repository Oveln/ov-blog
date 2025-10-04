"use client";
import React from "react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function Dashboard() {
    const { data } = useSession();
    return (
        <>
            {/* <header>
                <h1>WelCome to Dashboard</h1>
                <h2></h2>
            </header> */}
            {/* 所有子元素间距2 */}
            <main className="flex space-y-2 space-x-2 p-2">
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>{data?.user?.name} !</CardTitle>
                        WelCome to Dashboard
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p>
                            <b className="text-lg">email: </b>
                            <span>{data?.user?.email}</span>
                        </p>
                        <p className="">
                            <b className="text-lg">userID: </b>
                            <span>{data?.user?.id}</span>
                        </p>
                    </CardContent>
                    <CardFooter className="space-x-2">
                        {/* 下载文件 */}
                        <Button onClick={client_backup}>BackUp Database</Button>
                        <Button onClick={() => signOut()}>Logout</Button>
                    </CardFooter>
                </Card>
            </main>
        </>
    );
}

const client_backup = async () => {
    const res = await fetch("/api/backup");
    if (res.status === 200) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.headers.get("Content-Disposition")?.split("=")[1] ?? "backup.db";
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }
};
