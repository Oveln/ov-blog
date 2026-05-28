import { error } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"
import { getRawPost } from "$lib/server/posts"
import { parseFrontmatter } from "$lib/content/parser"

export const load: PageServerLoad = async ({ params }) => {
	const slug = params.slug
	const raw = await getRawPost(slug)
	if (!raw) {
		error(404, "文章不存在")
	}
	const parsed = parseFrontmatter(raw)
	return {
		slug,
		raw,
		title: parsed.frontmatter.title ?? "",
		description: parsed.frontmatter.description ?? "",
		tags: (parsed.frontmatter.tags ?? []).join(", "),
		published: parsed.frontmatter.published ?? false,
		createdAt: parsed.frontmatter.createdAt ?? "",
		content: parsed.content,
	}
}
