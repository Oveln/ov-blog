/**
 * 文件上传工具函数
 */

// 上传响应类型定义
export interface UploadResponse {
    status: "success" | "error";
    data?: {
        url: string;
        filename: string;
        originalName: string;
        type: string;
        size: number;
        mimeType: string;
        uploadedAt: string;
    };
    message?: string;
    code?: string;
    details?: unknown;
}

// 上传选项
export interface UploadOptions {
    onProgress?: (progress: number) => void;
    onSuccess?: (data: UploadResponse["data"]) => void;
    onError?: (error: string) => void;
}

/**
 * 上传文件到服务器
 * @param file 要上传的文件
 * @param options 上传选项
 * @returns Promise<UploadResponse>
 */
export async function uploadFile(
    file: File,
    options?: UploadOptions
): Promise<UploadResponse> {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        const data: UploadResponse = await response.json();

        if (data.status === "success" && data.data) {
            options?.onSuccess?.(data.data);
            return data;
        } else {
            const errorMessage = data.message || "上传失败";
            options?.onError?.(errorMessage);
            return data;
        }
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "网络错误，请检查连接";
        options?.onError?.(errorMessage);
        return {
            status: "error",
            message: errorMessage,
            code: "NETWORK_ERROR",
        };
    }
}

/**
 * 上传图片文件（Cherry Markdown 使用）
 * @param file 图片文件
 * @param callback 成功回调，返回图片URL
 */
export function uploadImage(file: File, callback: (url: string) => void): void {
    uploadFile(file, {
        onSuccess: (data) => {
            if (data) {
                callback(data.url);
            }
        },
        onError: (error) => {
            console.error("图片上传失败:", error);
        },
    });
}

/**
 * 批量上传文件
 * @param files 文件数组
 * @param options 上传选项
 * @returns Promise<UploadResponse[]>
 */
export async function uploadFiles(
    files: File[],
    options?: UploadOptions
): Promise<UploadResponse[]> {
    const uploadPromises = files.map((file) => uploadFile(file, options));
    return Promise.all(uploadPromises);
}

/**
 * 验证文件类型
 * @param file 文件
 * @param allowedTypes 允许的MIME类型数组
 * @returns boolean
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some((type) => {
        if (type.endsWith("/*")) {
            // 支持通配符，如 "image/*"
            const prefix = type.slice(0, -2);
            return file.type.startsWith(prefix);
        }
        return file.type === type;
    });
}

/**
 * 验证文件大小
 * @param file 文件
 * @param maxSize 最大大小（字节）
 * @returns boolean
 */
export function validateFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize;
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
