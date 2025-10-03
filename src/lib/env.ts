/**
 * 构建时环境变量配置
 * 用于在构建过程中提供虚拟值，避免构建失败
 */

// 检查是否在构建环境中
const isBuildTime = process.env.BUILDING === "true";

// 构建时的默认值
const buildTimeDefaults = {
    DATABASE_URL: "postgresql://build:build@build:5432/build",
    R2_ACCOUNT_ID: "build-account",
    R2_ACCESS_KEY_ID: "build-key",
    R2_SECRET_ACCESS_KEY: "build-secret",
    NEXTAUTH_SECRET: "build-nextauth-secret",
    NEXTAUTH_URL: "http://localhost:3000",
} as const;

/**
 * 获取环境变量，如果在构建时且变量不存在，则返回默认值
 */
export function getEnvVar(key: keyof typeof buildTimeDefaults): string | undefined {
    const value = process.env[key];

    if (!value && isBuildTime && key in buildTimeDefaults) {
        return buildTimeDefaults[key];
    }

    return value;
}

/**
 * 获取必需的环境变量，如果不存在则抛出错误（构建时除外）
 */
export function getRequiredEnvVar(key: keyof typeof buildTimeDefaults): string {
    const value = getEnvVar(key);

    if (!value && !isBuildTime) {
        throw new Error(`Missing required environment variable: ${key}`);
    }

    return value || buildTimeDefaults[key];
}

/**
 * 检查是否为构建时环境
 */
export function isBuild(): boolean {
    return isBuildTime;
}
