import { NextResponse } from "next/server";

export async function GET() {
    try {
        // 基本健康检查
        const healthStatus = {
            status: "healthy",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || "development",
        };

        return NextResponse.json(healthStatus, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            {
                status: "unhealthy",
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 503 }
        );
    }
}
