import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { togglePublished } from "$lib/server/posts"
import { validateSlug } from "$lib/server/slug"

export const POST: RequestHandler = async ({ request }) => {
	let body: Record<string, unknown>
	try {
		body = await request.json()
	} catch {
		return json({ error: "invalid JSON" }, { status: 400 })
	}
	const { slug } = body as { slug?: string }

	if (!slug) {
		return json({ error: "slug is required" }, { status: 400 })
	}
	if (!validateSlug(slug)) {
		return json({ error: "invalid slug" }, { status: 400 })
	}

	const published = await togglePublished(slug)
	return json({ ok: true, slug, published })
}
