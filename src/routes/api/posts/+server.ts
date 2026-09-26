import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { getRawPost, savePost, deletePost } from "$lib/server/posts"
import { validateSlug } from "$lib/server/slug"

export const GET: RequestHandler = async ({ url }) => {
	const slug = url.searchParams.get("slug")
	if (!slug) {
		return json({ error: "slug is required" }, { status: 400 })
	}
	if (!validateSlug(slug)) {
		return json({ error: "invalid slug" }, { status: 400 })
	}

	const raw = await getRawPost(slug)
	if (!raw) {
		return json({ error: "not found" }, { status: 404 })
	}

	return json({ slug, raw })
}

export const PUT: RequestHandler = async ({ request }) => {
	let body: Record<string, unknown>
	try {
		body = await request.json()
	} catch {
		return json({ error: "invalid JSON" }, { status: 400 })
	}
	const { slug, raw, summary, parent } = body as { slug?: string; raw?: string; summary?: string; parent?: number }

	if (!slug || !raw) {
		return json({ error: "slug and raw are required" }, { status: 400 })
	}
	if (!validateSlug(slug)) {
		return json({ error: "invalid slug" }, { status: 400 })
	}

	const versionMeta = await savePost(slug, raw, { summary, parent })
	return json({ ok: true, slug, version: versionMeta ?? null })
}

export const DELETE: RequestHandler = async ({ url }) => {
	const slug = url.searchParams.get("slug")
	if (!slug) {
		return json({ error: "slug is required" }, { status: 400 })
	}
	if (!validateSlug(slug)) {
		return json({ error: "invalid slug" }, { status: 400 })
	}

	await deletePost(slug)
	return json({ ok: true })
}
