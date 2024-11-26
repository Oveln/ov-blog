import React from "react";
import { useSession } from "next-auth/react";
import { ReactNode } from "react";

interface AdminGuardProps {
    children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
    const session = useSession();
    if (!session.data?.user?.role || session.data?.user?.role !== "ADMIN") {
        return <div>无权限访问</div>;
    }

    return <>{children}</>;
}
