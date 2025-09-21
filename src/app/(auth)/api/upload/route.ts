import { NextRequest } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth/auth";
import { Role } from "@prisma/client";

const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
    }
});

/**
 * @api {post} /api/upload 图片上传接口
 * @apiDescription
 * 该接口用于上传图片文件到 R2 存储，返回图片外链地址。
 * 仅支持图片类型文件，需登录且角色为 USER 或 ADMIN。
 *
 * @apiPermission USER, ADMIN
 * @apiHeader {Cookie} Authorization 用户登录 Cookie
 * @apiParam {File} file 图片文件，multipart/form-data 格式
 *
 * @apiSuccess {String} status "ok"
 * @apiSuccess {String} url 图片外链地址
 *
 * @apiError {String} status "error"
 * @apiError {String} message 错误描述
 *
 * @apiExample {curl} 请求示例:
 * curl -X POST -F "file=@test.png" https://domain/api/upload
 */
export async function POST(req: NextRequest) {
    // 鉴权
    const user = (await auth())?.user;
    if (!user?.id) {
        return Response.json({ status: "error", message: "未登录" }, { status: 401 });
    }
    if (user.role != Role.USER && user.role != Role.ADMIN) {
        return Response.json({ status: "error", message: "没有权限" }, { status: 403 });
    }
    // 处理文件上传
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file || !/image/i.test(file.type)) {
        return Response.json({ status: "error", message: "只能上传图片文件" }, { status: 400 });
    }
    // 指定路径和文件名
    const path = "blog-images" + (process.env.NODE_ENV === "production" ? "" : "-dev");
    const key = `${Date.now()}-${file.name}`;
    try {
        await r2.send(
            new PutObjectCommand({
                Bucket: "blog",
                Key: path + "/" + key,
                Body: Buffer.from(await file.arrayBuffer()),
                ContentType: file.type,
                ACL: "public-read"
            })
        );
        return Response.json({
            status: "ok",
            url: `https://pic.oveln.icu/${path}/${key}`
        });
    } catch (e) {
        console.error(e);
        return Response.json({ status: "error", message: "上传失败" }, { status: 500 });
    }
}
