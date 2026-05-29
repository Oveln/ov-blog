import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { getRawPost, savePost, deletePost } from "$lib/server/posts"

export const GET: RequestHandler = async ({ url }) => {
	const slug = url.searchParams.get("slug")
	if (!slug) {
		return json({ error: "slug is required" }, { status: 400 })
	}

	const raw = await getRawPost(slug)
	if (!raw) {
		return json({ error: "not found" }, { status: 404 })
	}

	return json({ slug, raw })
}

export const PUT: RequestHandler = async ({ request }) => {
	const body = await request.json()
	const { slug, raw, summary, parent } = body

	if (!slug || !raw) {
		return json({ error: "slug and raw are required" }, { status: 400 })
	}

	const versionMeta = await savePost(slug, raw, { summary, parent })
	return json({ ok: true, slug, version: versionMeta ?? null })
}

export const DELETE: RequestHandler = async ({ url }) => {
	const slug = url.searchParams.get("slug")
	if (!slug) {
		return json({ error: "slug is required" }, { status: 400 })
	}

	await deletePost(slug)
	return json({ ok: true })
}
