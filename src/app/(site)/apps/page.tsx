"use client";
import AppCard from "@/components/ui/app-card";
import React, { useEffect, useState } from "react";
import { appsData } from "@/data/app-data";

const Apps: React.FC = () => {
    const [col,setCol] = useState(3);
    useEffect(() => {
        if (window.innerWidth < 1024) setCol(2);
        else setCol(3);
    });
    return (
        <div className="min-h-[calc(100vh-54px)] pt-8 ">
            <ul className={"grid sm:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-4"}>
                {appsData.map((app, idx) => {
                    return (
                        <li
                            className="animate-fade-up animate-ease-in-out animate-duration-300"
                            style={{
                                animationDelay: `${Math.floor(idx / col) * 100}ms`
                            }}
                            key={app.APP_NAME}
                        >
                            <AppCard appData={app}></AppCard>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default Apps;
