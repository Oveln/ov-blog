import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/auth";
import { S3Client } from "bun";
import { Role } from "@prisma/client";

if (
    !process.env.R2_ACCOUNT_ID ||
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY
) {
    throw new Error("Missing required R2 environment variables.");
}

// 使用全局 Bun.S3Client
const r2 = new S3Client({
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: "blog",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
});

// 文件类型配置
const FILE_TYPES = {
    IMAGE: {
        mimes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
        extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
        maxSize: 10 * 1024 * 1024, // 10MB
        path: "blog-images",
    },
    DOCUMENT: {
        mimes: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "text/markdown",
        ],
        extensions: [".pdf", ".doc", ".docx", ".txt", ".md"],
        maxSize: 20 * 1024 * 1024, // 20MB
        path: "blog-documents",
    },
    ARCHIVE: {
        mimes: [
            "application/zip",
            "application/x-tar",
            "application/gzip",
            "application/x-7z-compressed",
        ],
        extensions: [".zip", ".tar", ".gz", ".7z"],
        maxSize: 50 * 1024 * 1024, // 50MB
        path: "blog-archives",
    },
    VIDEO: {
        mimes: ["video/mp4", "video/webm", "video/quicktime"],
        extensions: [".mp4", ".webm", ".mov"],
        maxSize: 100 * 1024 * 1024, // 100MB
        path: "blog-videos",
    },
};

type FileTypeKey = keyof typeof FILE_TYPES;

// 检测文件类型
function detectFileType(file: File): FileTypeKey | null {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();

    for (const [type, config] of Object.entries(FILE_TYPES)) {
        const typedConfig = config as (typeof FILE_TYPES)[FileTypeKey];
        if (
            typedConfig.mimes.includes(fileType as never) ||
            typedConfig.extensions.some((ext) => fileName.endsWith(ext))
        ) {
            return type as FileTypeKey;
        }
    }
    return null;
}

// 生成安全的文件名
function generateSafeFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = originalName.substring(originalName.lastIndexOf("."));
    const baseName = originalName
        .substring(0, originalName.lastIndexOf("."))
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .substring(0, 50);
    return `${timestamp}-${randomStr}-${baseName}${ext}`;
}

/**
 * @api {post} /api/upload 文件上传接口
 * @apiDescription
 * 该接口用于上传文件到 R2 存储，支持图片、文档、压缩包、视频等多种文件类型。
 * 仅支持指定类型的文件，需登录且角色为 USER 或 ADMIN。
 *
 * @apiPermission USER, ADMIN
 * @apiHeader {Cookie} Authorization 用户登录 Cookie
 * @apiParam {File} file 文件，multipart/form-data 格式
 *
 * @apiSuccess {String} status "success"
 * @apiSuccess {Object} data 上传结果数据
 * @apiSuccess {String} data.url 文件外链地址
 * @apiSuccess {String} data.filename 文件名
 * @apiSuccess {String} data.type 文件类型 (IMAGE|DOCUMENT|ARCHIVE|VIDEO)
 * @apiSuccess {Number} data.size 文件大小(字节)
 * @apiSuccess {String} data.mimeType 文件 MIME 类型
 *
 * @apiError {String} status "error"
 * @apiError {String} message 错误描述
 *
 * @apiExample {curl} 请求示例:
 * curl -X POST -F "file=@test.png" https://domain/api/upload
 *
 * @apiExample {json} 成功响应示例:
 * {
 *   "status": "success",
 *   "data": {
 *     "url": "https://pic.oveln.icu/blog-images/1234567890-abc123-test.png",
 *     "filename": "1234567890-abc123-test.png",
 *     "type": "IMAGE",
 *     "size": 102400,
 *     "mimeType": "image/png"
 *   }
 * }
 */
export async function POST(req: NextRequest) {
    try {
        // 鉴权
        const user = (await auth())?.user;
        if (!user?.id) {
            return Response.json(
                {
                    status: "error",
                    message: "未登录",
                    code: "UNAUTHORIZED",
                },
                { status: 401 }
            );
        }
        if (user.role !== Role.USER && user.role !== Role.ADMIN) {
            return Response.json(
                {
                    status: "error",
                    message: "没有权限",
                    code: "FORBIDDEN",
                },
                { status: 403 }
            );
        }

        // 处理文件上传
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return Response.json(
                {
                    status: "error",
                    message: "未提供文件",
                    code: "NO_FILE",
                },
                { status: 400 }
            );
        }

        // 检测文件类型
        const fileType = detectFileType(file);
        if (!fileType) {
            return Response.json(
                {
                    status: "error",
                    message: "不支持的文件类型",
                    code: "UNSUPPORTED_FILE_TYPE",
                    details: {
                        fileName: file.name,
                        mimeType: file.type,
                        supportedTypes: Object.keys(FILE_TYPES),
                    },
                },
                { status: 400 }
            );
        }

        const config = FILE_TYPES[fileType];

        // 检查文件大小
        if (file.size > config.maxSize) {
            return Response.json(
                {
                    status: "error",
                    message: "文件大小超过限制",
                    code: "FILE_TOO_LARGE",
                    details: {
                        fileSize: file.size,
                        maxSize: config.maxSize,
                        maxSizeMB: config.maxSize / (1024 * 1024),
                    },
                },
                { status: 400 }
            );
        }

        // 生成安全的文件名和路径
        const safeFilename = generateSafeFilename(file.name);
        const pathPrefix =
            config.path + (process.env.NODE_ENV === "production" ? "" : "-dev");
        const s3Key = `${pathPrefix}/${safeFilename}`;

        // 上传到 R2
        const s3file = r2.file(s3Key);
        await s3file.write(file, {
            type: file.type || "application/octet-stream",
        });

        // 构建公开访问 URL
        const publicUrl = `https://pic.oveln.icu/${pathPrefix}/${safeFilename}`;

        // 返回成功响应
        return Response.json(
            {
                status: "success",
                data: {
                    url: publicUrl,
                    filename: safeFilename,
                    originalName: file.name,
                    type: fileType,
                    size: file.size,
                    mimeType: file.type,
                    uploadedAt: new Date().toISOString(),
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("文件上传失败:", error);
        return Response.json(
            {
                status: "error",
                message: "上传失败",
                code: "UPLOAD_FAILED",
                details: error instanceof Error ? error.message : "未知错误",
            },
            { status: 500 }
        );
    }
}
