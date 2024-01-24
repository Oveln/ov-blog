'use client'
import AppCard from "@/components/ui/app-card";
import React from "react";
import { appsData } from "@/data/app-data";
import clsx from "clsx";
import useLoaded from "@/hooks/useLoaded";

const Apps: React.FC = () => {
    const isLoaded =useLoaded();
    return (
        <div className="min-h-[calc(100vh-54px)] pt-8 ">
            <ul className={clsx("grid sm:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-4",isLoaded && 'fade-in-start')}>
            {
                appsData.map((app) => {
                    return (
                        <li data-fade={1} key={app.APP_NAME}><AppCard appData={app}></AppCard></li>
                    );
                })
            }
            </ul>
        </div>
    );
};

export default Apps;
