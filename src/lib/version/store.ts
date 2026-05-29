import type { Storage } from "$lib/storage/interface"
import type {
	VersionMeta,
	VersionedDocMeta,
	CommitOptions,
	SwitchToOptions,
	VersionedStoreOptions,
} from "./types"
import { DEFAULT_SNAPSHOT_INTERVAL } from "./types"
import { makePatch, applyPatchContent } from "./patch"

export class VersionedStore {
	private storage: Storage
	private prefix: string
	private snapshotInterval: number

	constructor(storage: Storage, options?: VersionedStoreOptions) {
		this.storage = storage
		this.prefix = options?.prefix ?? "versions"
		this.snapshotInterval = options?.snapshotInterval ?? DEFAULT_SNAPSHOT_INTERVAL
	}

	private docDir(docId: string): string {
		return `${this.prefix}/${docId}`
	}

	private metaKey(docId: string): string {
		return `${this.docDir(docId)}/meta.json`
	}

	private currentKey(docId: string): string {
		return `${this.docDir(docId)}/current.md`
	}

	private fullKey(docId: string, version: number): string {
		return `${this.docDir(docId)}/v${version}.full.md`
	}

	private patchKey(docId: string, parent: number, version: number): string {
		return `${this.docDir(docId)}/v${parent}-v${version}.patch`
	}

	private async readMeta(docId: string): Promise<VersionedDocMeta | null> {
		const raw = await this.storage.read(this.metaKey(docId))
		if (!raw) return null
		return JSON.parse(raw) as VersionedDocMeta
	}

	private async writeMeta(docId: string, meta: VersionedDocMeta): Promise<void> {
		await this.storage.write(this.metaKey(docId), JSON.stringify(meta, null, 2))
	}

	async commit(
		docId: string,
		content: string,
		options?: CommitOptions,
	): Promise<VersionMeta> {
		const meta = await this.readMeta(docId)

		if (!meta) {
			const firstVersion: VersionMeta = {
				version: 1,
				parent: null,
				type: "full",
				createdAt: new Date().toISOString(),
				summary: options?.summary,
			}
			await Promise.all([
				this.storage.write(this.fullKey(docId, 1), content),
				this.storage.write(this.currentKey(docId), content),
				this.writeMeta(docId, {
					currentVersion: 1,
					lastVersion: 1,
					versions: [firstVersion],
				}),
			])
			return firstVersion
		}

		const currentContent = await this.storage.read(this.currentKey(docId))
		if (currentContent === content) {
			return meta.versions[meta.versions.length - 1]
		}

		if (typeof meta.lastVersion !== "number" || isNaN(meta.lastVersion)) {
			throw new Error(`Corrupted meta for doc ${docId}: lastVersion is ${meta.lastVersion}`)
		}

		const parent = options?.parent ?? meta.lastVersion
		const newVersion = meta.lastVersion + 1
		const type: "full" | "patch" =
			newVersion === 1 || newVersion % this.snapshotInterval === 0
				? "full"
				: "patch"

		if (type === "full") {
			await this.storage.write(this.fullKey(docId, newVersion), content)
		} else {
			const parentContent = await this.get(docId, parent)
			if (parentContent === null) {
				throw new Error(`Parent version ${parent} not found for doc ${docId}`)
			}
			const patch = makePatch(docId, parentContent, content)
			await this.storage.write(this.patchKey(docId, parent, newVersion), patch)
		}

		await this.storage.write(this.currentKey(docId), content)

		const versionMeta: VersionMeta = {
			version: newVersion,
			parent,
			type,
			createdAt: new Date().toISOString(),
			summary: options?.summary,
		}

		const updatedMeta: VersionedDocMeta = {
			currentVersion: newVersion,
			lastVersion: newVersion,
			versions: [...meta.versions, versionMeta],
		}
		await this.writeMeta(docId, updatedMeta)

		return versionMeta
	}

	async get(docId: string, version: number): Promise<string | null> {
		const meta = await this.readMeta(docId)
		if (!meta) return null

		if (version === meta.currentVersion) {
			return this.storage.read(this.currentKey(docId))
		}

		const versionMeta = meta.versions.find((v) => v.version === version)
		if (!versionMeta) return null

		if (versionMeta.type === "full") {
			return this.storage.read(this.fullKey(docId, version))
		}

		const chain: VersionMeta[] = []
		let current: VersionMeta | undefined = versionMeta
		while (current && current.type === "patch") {
			chain.push(current)
			current = meta.versions.find((v) => v.version === current!.parent)
		}
		if (!current) return null

		let content = await this.storage.read(this.fullKey(docId, current.version))
		if (content === null) return null

		for (const v of chain.reverse()) {
			const patch = await this.storage.read(
				this.patchKey(docId, v.parent!, v.version),
			)
			if (patch === null) return null
			content = applyPatchContent(content, patch)
		}

		return content
	}

	async log(docId: string): Promise<VersionMeta[]> {
		const meta = await this.readMeta(docId)
		if (!meta) return []
		return [...meta.versions]
	}

	async head(docId: string): Promise<number | null> {
		const meta = await this.readMeta(docId)
		if (!meta) return null
		return meta.currentVersion
	}

	async switchTo(
		docId: string,
		version: number,
		options?: SwitchToOptions,
	): Promise<VersionMeta> {
		const meta = await this.readMeta(docId)
		if (!meta) {
			throw new Error(`Document ${docId} has no version history`)
		}

		const targetMeta = meta.versions.find((v) => v.version === version)
		if (!targetMeta) {
			throw new Error(`Version ${version} not found for doc ${docId}`)
		}

		const content = await this.get(docId, version)
		if (content === null) {
			throw new Error(`Version ${version} content not found for doc ${docId}`)
		}

		await this.storage.write(this.currentKey(docId), content)

		const updatedMeta: VersionedDocMeta = {
			...meta,
			currentVersion: version,
		}
		await this.writeMeta(docId, updatedMeta)

		return targetMeta
	}

	async destroy(docId: string): Promise<void> {
		const keys = await this.storage.list(this.docDir(docId))
		await Promise.all(keys.map((k) => this.storage.delete(k)))
	}
}