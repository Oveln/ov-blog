import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { getRawPost, savePost } from "$lib/server/posts"

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
	const { slug, raw } = body

	if (!slug || !raw) {
		return json({ error: "slug and raw are required" }, { status: 400 })
	}

	await savePost(slug, raw)
	return json({ ok: true, slug })
}
