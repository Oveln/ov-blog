import { processPost, processPostSummary } from "$lib/content/pipeline"
import { parseFrontmatter } from "$lib/content/parser"
import { sortPostsByDate } from "$lib/content/schema"
import type { PostContent, PostSummary } from "$lib/content/schema"
import type { Storage } from "$lib/storage"
import { createStorage } from "$lib/storage"
import { VersionedStore } from "$lib/version"
import type { VersionMeta } from "$lib/version"
import { join } from "node:path"

const POSTS_PREFIX = "posts"

function slugFromKey(key: string): string {
	const filename = key.split("/").pop() ?? key
	return filename.replace(/\.md$/, "")
}

function createPostStorage(): Storage {
	return createStorage({
		kind: "local",
		baseDir: join(process.cwd(), "content"),
	})
}

const storage = createPostStorage()
const versionStore = new VersionedStore(storage, { prefix: "versions" })

async function listPostKeys(): Promise<string[]> {
	const keys = await storage.list(POSTS_PREFIX)
	return keys.filter((k) => k.endsWith(".md"))
}

interface PostMetaFile {
	published: boolean
}

function metaKey(slug: string): string {
	return `${POSTS_PREFIX}/${slug}.meta.json`
}

async function getPublished(slug: string): Promise<boolean> {
	const raw = await storage.read(metaKey(slug))
	if (!raw) return false
	try {
		const meta = JSON.parse(raw) as PostMetaFile
		return meta.published ?? false
	} catch {
		return false
	}
}

async function setPublished(slug: string, published: boolean): Promise<void> {
	await storage.write(metaKey(slug), JSON.stringify({ published }, null, 2))
}

export async function getAllPosts(
	options?: { publishedOnly?: boolean }
): Promise<PostContent[]> {
	const mdKeys = await listPostKeys()
	const publishedOnly = options?.publishedOnly ?? false

	const results = await Promise.all(
		mdKeys.map(async (key) => {
			const slug = slugFromKey(key)
			const raw = await storage.read(key)
			if (!raw) return null

			const pub = await getPublished(slug)
			if (publishedOnly && !pub) return null

			return processPost(slug, raw, pub)
		}),
	)

	return sortPostsByDate(results.filter((r): r is PostContent => r !== null))
}

export async function getAllPostSummaries(
	options?: { publishedOnly?: boolean }
): Promise<PostSummary[]> {
	const mdKeys = await listPostKeys()
	const publishedOnly = options?.publishedOnly ?? false

	const results = await Promise.all(
		mdKeys.map(async (key) => {
			const slug = slugFromKey(key)
			const raw = await storage.read(key)
			if (!raw) return null

			const pub = await getPublished(slug)
			if (publishedOnly && !pub) return null

			return processPostSummary(slug, raw, pub)
		}),
	)

	const valid = results.filter((r): r is PostSummary => r !== null)
	return sortPostsByDate(valid)
}

export async function getAllTags(
	options?: { publishedOnly?: boolean }
): Promise<string[]> {
	const summaries = await getAllPostSummaries(options)
	const tagSet = new Set<string>()
	for (const s of summaries) {
		for (const tag of s.tags) {
			tagSet.add(tag)
		}
	}
	return Array.from(tagSet).sort()
}

export async function getPost(slug: string): Promise<PostContent | null> {
	const key = `${POSTS_PREFIX}/${slug}.md`
	const raw = await storage.read(key)
	if (!raw) return null
	const published = await getPublished(slug)
	return processPost(slug, raw, published)
}

export async function getRawPost(slug: string): Promise<string | null> {
	const key = `${POSTS_PREFIX}/${slug}.md`
	return storage.read(key)
}

export async function savePost(
	slug: string,
	raw: string,
	options?: { summary?: string; parent?: number }
): Promise<VersionMeta | undefined> {
	const key = `${POSTS_PREFIX}/${slug}.md`
	const metaExists = await storage.read(metaKey(slug))
	await Promise.all([
		storage.write(key, raw),
		metaExists ? Promise.resolve() : setPublished(slug, false),
	])
	return versionStore.commit(slug, raw, { summary: options?.summary, parent: options?.parent })
}

export async function deletePost(slug: string): Promise<void> {
	const key = `${POSTS_PREFIX}/${slug}.md`
	await Promise.all([
		storage.delete(key),
		storage.delete(metaKey(slug)),
		versionStore.destroy(slug),
	])
}

export async function getAllSlugs(): Promise<string[]> {
	const mdKeys = await listPostKeys()
	return mdKeys.map(slugFromKey)
}

export async function getNextId(): Promise<number> {
	const slugs = await getAllSlugs()
	let maxId = 0
	for (const s of slugs) {
		const n = parseInt(s, 10)
		if (!isNaN(n) && n > maxId) maxId = n
	}
	return maxId + 1
}

export async function listVersions(slug: string): Promise<VersionMeta[]> {
	return versionStore.log(slug)
}

export async function getVersion(slug: string, version: number): Promise<string | null> {
	return versionStore.get(slug, version)
}

export async function getCurrentVersion(slug: string): Promise<number | null> {
	return versionStore.head(slug)
}

export async function switchToVersion(
	slug: string,
	version: number,
): Promise<VersionMeta> {
	const versionContent = await versionStore.get(slug, version)
	if (!versionContent) {
		throw new Error(`Version ${version} not found for post ${slug}`)
	}
	const key = `${POSTS_PREFIX}/${slug}.md`
	await storage.write(key, versionContent)
	return versionStore.switchTo(slug, version)
}

export async function togglePublished(slug: string): Promise<boolean> {
	const current = await getPublished(slug)
	await setPublished(slug, !current)
	return !current
}

export { getPublished }
