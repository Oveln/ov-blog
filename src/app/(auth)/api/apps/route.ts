import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth/auth";
import { Role } from "@prisma/client";

export async function GET() {
    try {
        const apps = await prisma.app.findMany();
        return NextResponse.json(apps);
    } catch {
        return NextResponse.json({ error: "Failed to fetch apps" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session || session.user?.role !== Role.ADMIN) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, url, description } = await request.json();

        const app = await prisma.app.create({
            data: {
                name,
                url,
                description,
            },
        });

        return NextResponse.json(app, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create app" }, { status: 500 });
    }
}
