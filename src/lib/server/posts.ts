import { processPost, processPostSummary } from "$lib/content/pipeline"
import { isPublished, sortPostsByDate } from "$lib/content/schema"
import type { PipelineResult, PostSummary } from "$lib/content"
import type { Storage } from "$lib/storage"
import { createStorage } from "$lib/storage"

const POSTS_PREFIX = "posts"

function slugFromKey(key: string): string {
	const filename = key.split("/").pop() ?? key
	return filename.replace(/\.md$/, "")
}

function createPostStorage(): Storage {
	return createStorage({
		kind: "local",
		baseDir: "content",
	})
}

const storage = createPostStorage()

export async function getAllPosts(): Promise<PipelineResult[]> {
	const keys = await storage.list(POSTS_PREFIX)
	const mdKeys = keys.filter((k) => k.endsWith(".md"))

	const results = await Promise.all(
		mdKeys.map(async (key) => {
			const slug = slugFromKey(key)
			const raw = await storage.read(key)
			if (!raw) return null
			return processPost(slug, raw)
		}),
	)

	return results
		.filter((r): r is PipelineResult => r !== null)
		.filter((r) => isPublished(r.meta))
}

export async function getAllPostSummaries(): Promise<PostSummary[]> {
	const keys = await storage.list(POSTS_PREFIX)
	const mdKeys = keys.filter((k) => k.endsWith(".md"))

	const results = await Promise.all(
		mdKeys.map(async (key) => {
			const slug = slugFromKey(key)
			const raw = await storage.read(key)
			if (!raw) return null
			return processPostSummary(slug, raw)
		}),
	)

	const published = results
		.filter((r): r is PipelineResult => r !== null)
		.filter((r) => isPublished(r.meta))
	const bySlug = new Map(published.map((r) => [r.meta.slug, r]))
	const sorted = sortPostsByDate(published.map((r) => r.meta))

	return sorted.map((meta) => {
		const result = bySlug.get(meta.slug)!
		return {
			...meta,
			excerpt: result.excerpt,
			readingTime: result.readingTime,
		}
	})
}

export async function getAllTags(): Promise<string[]> {
	const summaries = await getAllPostSummaries()
	const tagSet = new Set<string>()
	for (const s of summaries) {
		for (const tag of s.tags) {
			tagSet.add(tag)
		}
	}
	return Array.from(tagSet).sort()
}

export async function getPost(slug: string): Promise<PipelineResult | null> {
	const key = `${POSTS_PREFIX}/${slug}.md`
	const raw = await storage.read(key)
	if (!raw) return null
	const result = await processPost(slug, raw)
	if (!isPublished(result.meta)) return null
	return result
}

export async function getAllSlugs(): Promise<string[]> {
	const keys = await storage.list(POSTS_PREFIX)
	return keys.filter((k) => k.endsWith(".md")).map(slugFromKey)
}
