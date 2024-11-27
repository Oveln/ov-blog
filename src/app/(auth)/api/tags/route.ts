import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

export type TagsResponse = {
    status: "ok" | "error";
    tags?: { name: string }[];
};

export type CreateTagResponse = {
    status: "ok" | "unauthorized" | "error";
};

// Get all tags
export async function GET(): Promise<Response> {
    try {
        const tags = await prisma.tag.findMany({
            select: {
                name: true
            }
        });
        const response: TagsResponse = {
            status: "ok",
            tags: tags
        };
        return Response.json(response);
    } catch (error) {
        console.error("Error fetching tags:", error);
        const response: TagsResponse = { status: "error" };
        return Response.json(response);
    }
}

// Create new tag
export async function POST(req: Request): Promise<Response> {
    const user = (await auth())?.user;
    if (!user?.id || user.role !== Role.ADMIN) {
        const response: CreateTagResponse = { status: "unauthorized" };
        return Response.json(response);
    }

    try {
        const { name } = await req.json();
        if (typeof name !== "string" || !name.trim()) {
            const response: CreateTagResponse = { status: "error" };
            return Response.json(response);
        }

        await prisma.tag.create({
            data: {
                name: name.trim()
            }
        });

        const response: CreateTagResponse = { status: "ok" };
        return Response.json(response);
    } catch (error) {
        console.error("Error creating tag:", error);
        const response: CreateTagResponse = { status: "error" };
        return Response.json(response);
    }
} 