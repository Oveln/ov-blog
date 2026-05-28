import { processPost, processPostSummary } from "$lib/content/pipeline"
import { parseFrontmatter } from "$lib/content/parser"
import { sortPostsByDate } from "$lib/content/schema"
import type { PostContent, PostSummary } from "$lib/content/schema"
import type { Storage } from "$lib/storage"
import { createStorage } from "$lib/storage"
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

async function listPostKeys(): Promise<string[]> {
	const keys = await storage.list(POSTS_PREFIX)
	return keys.filter((k) => k.endsWith(".md"))
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

			if (publishedOnly) {
				const parsed = parseFrontmatter(raw)
				if (!parsed.meta.published) return null
				return processPost(slug, raw, { meta: parsed.meta, content: parsed.content })
			}

			return processPost(slug, raw)
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

			if (publishedOnly) {
				const parsed = parseFrontmatter(raw)
				if (!parsed.meta.published) return null
				return processPostSummary(slug, raw, { meta: parsed.meta, content: parsed.content })
			}

			return processPostSummary(slug, raw)
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
	return processPost(slug, raw)
}

export async function getRawPost(slug: string): Promise<string | null> {
	const key = `${POSTS_PREFIX}/${slug}.md`
	return storage.read(key)
}

export async function savePost(slug: string, raw: string): Promise<void> {
	const key = `${POSTS_PREFIX}/${slug}.md`
	await storage.write(key, raw)
}

export async function deletePost(slug: string): Promise<void> {
	const key = `${POSTS_PREFIX}/${slug}.md`
	await storage.delete(key)
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
