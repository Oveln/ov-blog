import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import { processPost, processPostSummary } from "$lib/content/pipeline"
import { isPublished, sortPostsByDate } from "$lib/content/schema"
import type { PipelineResult, PostSummary, PostMeta } from "$lib/content"

const POSTS_DIR = join(process.cwd(), "content", "posts")

function slugFromFilename(filename: string): string {
	return filename.replace(/\.md$/, "")
}

export async function getAllPosts(): Promise<PipelineResult[]> {
	const files = await readdir(POSTS_DIR)
	const mdFiles = files.filter((f) => f.endsWith(".md"))

	const results = await Promise.all(
		mdFiles.map(async (filename) => {
			const slug = slugFromFilename(filename)
			const raw = await readFile(join(POSTS_DIR, filename), "utf-8")
			return processPost(slug, raw)
		}),
	)

	return results.filter((r) => isPublished(r.meta))
}

export async function getAllPostSummaries(): Promise<PostSummary[]> {
	const files = await readdir(POSTS_DIR)
	const mdFiles = files.filter((f) => f.endsWith(".md"))

	const results = await Promise.all(
		mdFiles.map(async (filename) => {
			const slug = slugFromFilename(filename)
			const raw = await readFile(join(POSTS_DIR, filename), "utf-8")
			return processPostSummary(slug, raw)
		}),
	)

	const published = results.filter((r) => isPublished(r.meta))
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
	const filePath = join(POSTS_DIR, `${slug}.md`)
	try {
		const raw = await readFile(filePath, "utf-8")
		const result = await processPost(slug, raw)
		if (!isPublished(result.meta)) return null
		return result
	} catch {
		return null
	}
}

export async function getAllSlugs(): Promise<string[]> {
	const files = await readdir(POSTS_DIR)
	return files.filter((f) => f.endsWith(".md")).map(slugFromFilename)
}
