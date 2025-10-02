import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";
import { Params } from "next/dist/server/request/params";
import { NextResponse } from "next/server";

export async function DELETE(request: Request, context: { params: Promise<Params> }) {
    const session = await auth();
    if (!session || session.user?.role !== Role.ADMIN) {
        return NextResponse.json({ status: "unauthorized" });
    }
    const id = (await context.params).id;
    if (typeof id !== "string") {
        return NextResponse.json(null);
    }

    try {
        await prisma.app.delete({
            where: {
                id,
            },
        });
    } catch {
        return NextResponse.json({ error: "Failed to delete app" }, { status: 500 });
    }
    return NextResponse.json({ status: "ok" });
}
