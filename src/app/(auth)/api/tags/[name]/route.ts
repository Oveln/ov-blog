import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

export type TagOperationResponse = {
    status: "ok" | "unauthorized" | "error" | "not_found";
};

// Delete tag
export async function DELETE(
    req: Request,
    context: { params: Promise<{ name: string }> }
): Promise<Response> {
    const user = (await auth())?.user;
    if (!user?.id || user.role !== Role.ADMIN) {
        const response: TagOperationResponse = { status: "unauthorized" };
        return Response.json(response);
    }
    const params = await context.params;
    try {
        const tag = await prisma.tag.findUnique({
            where: { name: params.name }
        });

        if (!tag) {
            const response: TagOperationResponse = { status: "not_found" };
            return Response.json(response);
        }

        await prisma.tag.delete({
            where: { name: params.name }
        });

        const response: TagOperationResponse = { status: "ok" };
        return Response.json(response);
    } catch (error) {
        console.error("Error deleting tag:", error);
        const response: TagOperationResponse = { status: "error" };
        return Response.json(response);
    }
}

// Update tag
export async function PUT(
    req: Request,
    context: { params: Promise<{ name: string }> }
): Promise<Response> {
    const user = (await auth())?.user;
    if (!user?.id || user.role !== Role.ADMIN) {
        const response: TagOperationResponse = { status: "unauthorized" };
        return Response.json(response);
    }
    const params = await context.params;
    try {
        const { newName } = await req.json();
        if (typeof newName !== "string" || !newName.trim()) {
            const response: TagOperationResponse = { status: "error" };
            return Response.json(response);
        }

        const tag = await prisma.tag.findUnique({
            where: { name: params.name }
        });

        if (!tag) {
            const response: TagOperationResponse = { status: "not_found" };
            return Response.json(response);
        }

        await prisma.tag.update({
            where: { name: params.name },
            data: { name: newName.trim() }
        });

        const response: TagOperationResponse = { status: "ok" };
        return Response.json(response);
    } catch (error) {
        console.error("Error updating tag:", error);
        const response: TagOperationResponse = { status: "error" };
        return Response.json(response);
    }
} 