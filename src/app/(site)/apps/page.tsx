"use client";
import AppCard from "@/components/ui/app-card";
import React, { useEffect, useState } from "react";
import { App } from "@/types/app";

const Apps: React.FC = () => {
    const [col, setCol] = useState(3);
    const [apps, setApps] = useState<App[]>([]);

    useEffect(() => {
        if (window.innerWidth < 1024) setCol(2);
        else setCol(3);

        const fetchApps = async () => {
            const response = await fetch("/api/apps");
            const data = await response.json();
            setApps(data);
        };

        fetchApps();
    }, []);

    return (
        <div className="min-h-[calc(100vh-54px)] pt-8 ">
            <ul className={"grid sm:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-4"}>
                {apps.map((app, idx) => {
                    return (
                        <li
                            className="animate-fade-up animate-ease-in-out animate-duration-300"
                            style={{
                                animationDelay: `${Math.floor(idx / col) * 100}ms`,
                            }}
                            key={app.id}
                        >
                            <AppCard
                                appData={{
                                    APP_NAME: app.name,
                                    APP_URL: app.url,
                                }}
                            ></AppCard>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default Apps;
