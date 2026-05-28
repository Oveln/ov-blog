import {
	S3Client,
	GetObjectCommand,
	PutObjectCommand,
	DeleteObjectCommand,
	ListObjectsV2Command,
	HeadObjectCommand,
} from "@aws-sdk/client-s3"
import type { Storage } from "./interface"

export interface S3StorageOptions {
	bucket: string
	prefix?: string
	region?: string
	endpoint?: string
	accessKeyId?: string
	secretAccessKey?: string
}

export class S3Storage implements Storage {
	private client: S3Client
	private bucket: string
	private prefix: string

	constructor(options: S3StorageOptions) {
		this.bucket = options.bucket
		this.prefix = options.prefix ?? ""

		this.client = new S3Client({
			region: options.region ?? "auto",
			endpoint: options.endpoint,
			credentials:
				options.accessKeyId && options.secretAccessKey
					? {
							accessKeyId: options.accessKeyId,
							secretAccessKey: options.secretAccessKey,
						}
					: undefined,
		})
	}

	private resolveKey(key: string): string {
		return this.prefix ? `${this.prefix}/${key}` : key
	}

	async read(key: string): Promise<string | null> {
		try {
			const resp = await this.client.send(
				new GetObjectCommand({
					Bucket: this.bucket,
					Key: this.resolveKey(key),
				}),
			)
			return await resp.Body!.transformToString("utf-8")
		} catch {
			return null
		}
	}

	async write(key: string, data: string): Promise<void> {
		await this.client.send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: this.resolveKey(key),
				Body: data,
				ContentType: "text/markdown; charset=utf-8",
			}),
		)
	}

	async delete(key: string): Promise<void> {
		try {
			await this.client.send(
				new DeleteObjectCommand({
					Bucket: this.bucket,
					Key: this.resolveKey(key),
				}),
			)
		} catch {
			// ignore if key doesn't exist
		}
	}

	async list(prefix: string): Promise<string[]> {
		const fullPrefix = this.resolveKey(prefix)
		const keys: string[] = []
		let continuationToken: string | undefined

		do {
			const resp = await this.client.send(
				new ListObjectsV2Command({
					Bucket: this.bucket,
					Prefix: fullPrefix,
					ContinuationToken: continuationToken,
				}),
			)

			for (const obj of resp.Contents ?? []) {
				if (obj.Key) {
					const relativeKey = this.prefix
						? obj.Key.slice(this.prefix.length + 1)
						: obj.Key
					keys.push(relativeKey)
				}
			}

			continuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined
		} while (continuationToken)

		return keys
	}

	async exists(key: string): Promise<boolean> {
		try {
			await this.client.send(
				new HeadObjectCommand({
					Bucket: this.bucket,
					Key: this.resolveKey(key),
				}),
			)
			return true
		} catch {
			return false
		}
	}
}
