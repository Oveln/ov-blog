import { getUser, Role } from "@/data/user";
import { NextResponse } from "next/server";
import fs from "fs";

export const GET = async () => {
    const user = await getUser();
    if (!user || user.role !== Role.ADMIN) {
        return Response.json({
            status: "unauthorized",
        });
    }
    // 本地地址
    const env = process.env.DATABASE_URL;
    console.log(env);
    if (!env) {
        return Response.json({
            status: "not found",
        });
    }
    const fileName = env.split('/').pop();
    const filePath = "./prisma/" + env.substring(5);
    console.log(filePath)
    const fileStream = fs.createReadStream(filePath);

    // 设置响应头
    const headers = new Headers();
    headers.set('Content-Type', 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new NextResponse(fileStream as any, { headers });

}