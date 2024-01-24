import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
export default function Footer() {
    return (
        <footer className="justify-center h-32">
            <main className="flex flex-row items-center justify-center border-t pt-6 border-gray-400 dark:border-gray-600">
                <div>
                    <Button variant="link" className="p-0" asChild>
                        <Link href="https://beian.miit.gov.cn/">浙ICP备2024061275号</Link>
                    </Button>
                </div>
            </main>
        </footer>
    );
}
