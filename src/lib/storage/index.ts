import { join } from "node:path"
import type { Storage } from "./interface"
import { LocalStorage } from "./local"
import { S3Storage } from "./s3"

export type { Storage } from "./interface"
export { LocalStorage } from "./local"
export { S3Storage } from "./s3"

export type StorageKind = "local" | "s3"

export interface StorageConfig {
	kind: StorageKind
	baseDir?: string
	bucket?: string
	prefix?: string
	region?: string
	endpoint?: string
	accessKeyId?: string
	secretAccessKey?: string
}

export function createStorage(config: StorageConfig): Storage {
	switch (config.kind) {
		case "local":
			return new LocalStorage({
				baseDir: config.baseDir ?? join(process.cwd(), "content"),
			})
		case "s3":
			if (!config.bucket) {
				throw new Error("S3 storage requires a bucket name")
			}
			return new S3Storage({
				bucket: config.bucket,
				prefix: config.prefix,
				region: config.region,
				endpoint: config.endpoint,
				accessKeyId: config.accessKeyId,
				secretAccessKey: config.secretAccessKey,
			})
	}
}

export function storageConfigFromEnv(): StorageConfig {
	const kind = (process.env.STORAGE_KIND ?? "local") as StorageKind

	if (kind === "s3") {
		return {
			kind: "s3",
			bucket: process.env.S3_BUCKET ?? "",
			prefix: process.env.S3_PREFIX,
			region: process.env.S3_REGION,
			endpoint: process.env.S3_ENDPOINT,
			accessKeyId: process.env.S3_ACCESS_KEY_ID,
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
		}
	}

	return {
		kind: "local",
		baseDir: process.env.STORAGE_BASE_DIR ?? join(process.cwd(), "content"),
	}
}
