import { AppData } from "@/data/app-data";
import Link from "next/link";
import React from "react";

type Props = {
    appData: AppData;
};
const AppCard: React.FC<Props> = (props) => {
    const { appData } = props;
    return (
        <Link href={appData.APP_URL}>
            <div className="w-full h-28 border shadow-md p-2 group relative">
                <h1 className="text-xl font-bold">{appData.APP_NAME}</h1>
                <h1 className="text-sm">{appData.APP_DESCRIPTION}</h1>
                <span className="absolute left-2 bottom-2 animated-underline group-hover:animated-underline-hover">Go to →</span>
            </div>
        </Link>
    );
};

export default AppCard;
