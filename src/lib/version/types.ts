export interface VersionMeta {
	version: number
	parent: number | null
	type: "full" | "patch"
	createdAt: string
	summary?: string
}

export interface VersionedDocMeta {
	currentVersion: number
	lastVersion: number
	versions: VersionMeta[]
}

export interface CommitOptions {
	summary?: string
	parent?: number
}

export interface VersionedStoreOptions {
	prefix?: string
	snapshotInterval?: number
}

export const DEFAULT_SNAPSHOT_INTERVAL = 5