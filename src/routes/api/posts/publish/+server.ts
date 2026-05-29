import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { togglePublished } from "$lib/server/posts"

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json()
	const { slug } = body

	if (!slug) {
		return json({ error: "slug is required" }, { status: 400 })
	}

	const published = await togglePublished(slug)
	return json({ ok: true, slug, published })
}
