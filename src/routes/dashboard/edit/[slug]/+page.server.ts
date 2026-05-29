import { error } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"
import { getRawPost, getVersion } from "$lib/server/posts"
import { parseFrontmatter } from "$lib/content/parser"

export const load: PageServerLoad = async ({ params, url }) => {
	const slug = params.slug
	const raw = await getRawPost(slug)
	if (!raw) {
		error(404, "文章不存在")
	}

	const parsed = parseFrontmatter(raw)
	const from = url.searchParams.get("from") ?? ""
	const fromVersionParam = url.searchParams.get("fromVersion")
	const fromVersion = fromVersionParam ? parseInt(fromVersionParam, 10) : null

	if (fromVersion) {
		const versionContent = await getVersion(slug, fromVersion)
		if (versionContent) {
			const versionParsed = parseFrontmatter(versionContent)
			return {
				slug,
				title: versionParsed.frontmatter.title,
				description: versionParsed.frontmatter.description,
				tags: (versionParsed.frontmatter.tags ?? []).join(", "),
				content: versionParsed.content,
				createdAt: parsed.frontmatter.createdAt ?? "",
				from,
				fromVersion,
			}
		}
	}

	return {
		slug,
		title: parsed.frontmatter.title,
		description: parsed.frontmatter.description,
		tags: (parsed.frontmatter.tags ?? []).join(", "),
		content: parsed.content,
		createdAt: parsed.frontmatter.createdAt ?? "",
		from,
		fromVersion,
	}
}
