import { getPost } from "$lib/server/posts"
import { error } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ params }) => {
	const slug = params.slug
	const raw = await getPostRaw(slug)
	if (!raw) {
		error(404, "文章不存在")
	}
	return { slug, raw }
}

async function getPostRaw(slug: string): Promise<string | null> {
	const { createStorage } = await import("$lib/storage")
	const storage = createStorage({ kind: "local", baseDir: "content" })
	return await storage.read(`posts/${slug}.md`)
}
