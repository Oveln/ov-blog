import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { createStorage } from "$lib/storage"

const storage = createStorage({ kind: "local", baseDir: "content" })

export const GET: RequestHandler = async ({ url }) => {
	const slug = url.searchParams.get("slug")
	if (!slug) {
		return json({ error: "slug is required" }, { status: 400 })
	}

	const key = `posts/${slug}.md`
	const raw = await storage.read(key)
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

	const key = `posts/${slug}.md`
	await storage.write(key, raw)

	return json({ ok: true, slug })
}
