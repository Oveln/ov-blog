import { describe, it, expect } from "vitest"
import { createStorage, storageConfigFromEnv } from "$lib/storage"
import { LocalStorage } from "$lib/storage/local"
import { S3Storage } from "$lib/storage/s3"

describe("createStorage", () => {
	it("创建 LocalStorage", () => {
		const storage = createStorage({ kind: "local", baseDir: "/tmp/test" })
		expect(storage).toBeInstanceOf(LocalStorage)
	})

	it("创建 S3Storage", () => {
		const storage = createStorage({
			kind: "s3",
			bucket: "test-bucket",
			region: "us-east-1",
		})
		expect(storage).toBeInstanceOf(S3Storage)
	})

	it("S3 缺少 bucket 报错", () => {
		expect(() => createStorage({ kind: "s3" })).toThrow("S3 storage requires a bucket name")
	})

	it("LocalStorage 默认 baseDir 为 content", () => {
		const storage = createStorage({ kind: "local" })
		expect(storage).toBeInstanceOf(LocalStorage)
	})
})

describe("storageConfigFromEnv", () => {
	it("默认返回 local 配置", () => {
		const config = storageConfigFromEnv()
		expect(config.kind).toBe("local")
	})

	it("STORAGE_KIND=s3 返回 s3 配置", () => {
		const original = process.env.STORAGE_KIND
		process.env.STORAGE_KIND = "s3"
		process.env.S3_BUCKET = "my-bucket"
		process.env.S3_REGION = "auto"
		process.env.S3_ENDPOINT = "https://r2.example.com"

		const config = storageConfigFromEnv()
		expect(config.kind).toBe("s3")
		expect(config.bucket).toBe("my-bucket")

		process.env.STORAGE_KIND = original
		delete process.env.S3_BUCKET
		delete process.env.S3_REGION
		delete process.env.S3_ENDPOINT
	})
})
