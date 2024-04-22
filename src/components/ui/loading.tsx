import { RotateCw } from "lucide-react";
import React from "react";
export const Loading = () => {
    return (
        <div className="m-auto h-full w-full flex flex-col justify-center items-center">
            <span className="text-3xl">Loading...</span>
            <RotateCw className="animate-spin h-1/5 w-1/5" />
        </div>
    );
};
