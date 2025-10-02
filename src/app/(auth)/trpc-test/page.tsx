import React from "react";
import { TestTRPC } from "@/components/testing/TestTRPC";
import { TestPostsTRPC } from "@/components/testing/TestPostsTRPC";
import { TestCurrentUser } from "@/components/testing/TestCurrentUser";

export default function TRPCTestPage() {
    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold">tRPC Integration Test</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <TestTRPC />
                </div>
                <div>
                    <TestPostsTRPC />
                </div>
            </div>

            <div>
                <TestCurrentUser />
            </div>
        </div>
    );
}
