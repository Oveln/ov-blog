import { readFile, writeFile, unlink, readdir, stat, mkdir } from "node:fs/promises"
import { join, dirname } from "node:path"
import type { Storage } from "./interface"

export interface LocalStorageOptions {
	baseDir: string
}

export class LocalStorage implements Storage {
	private baseDir: string

	constructor(options: LocalStorageOptions) {
		this.baseDir = options.baseDir
	}

	private resolve(key: string): string {
		return join(this.baseDir, key)
	}

	async read(key: string): Promise<string | null> {
		try {
			return await readFile(this.resolve(key), "utf-8")
		} catch {
			return null
		}
	}

	async write(key: string, data: string): Promise<void> {
		const filePath = this.resolve(key)
		await mkdir(dirname(filePath), { recursive: true })
		await writeFile(filePath, data, "utf-8")
	}

	async delete(key: string): Promise<void> {
		try {
			await unlink(this.resolve(key))
		} catch {
			// ignore if file doesn't exist
		}
	}

	async list(prefix: string): Promise<string[]> {
		const dir = this.resolve(prefix)
		try {
			await stat(dir)
		} catch {
			return []
		}

		const keys: string[] = []
		await this.walk(dir, prefix, keys)
		return keys
	}

	async exists(key: string): Promise<boolean> {
		try {
			const s = await stat(this.resolve(key))
			return s.isFile()
		} catch {
			return false
		}
	}

	private async walk(dir: string, prefix: string, keys: string[]): Promise<void> {
		const entries = await readdir(dir, { withFileTypes: true })
		for (const entry of entries) {
			const relativePath = join(prefix, entry.name)
			if (entry.isDirectory()) {
				await this.walk(join(dir, entry.name), relativePath, keys)
			} else {
				keys.push(relativePath)
			}
		}
	}
}
