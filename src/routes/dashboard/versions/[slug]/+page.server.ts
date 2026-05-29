import { error } from "@sveltejs/kit"
import type { PageServerLoad } from "./$types"
import { getRawPost, listVersions, getCurrentVersion } from "$lib/server/posts"

export const load: PageServerLoad = async ({ params, url }) => {
	const slug = params.slug
	const raw = await getRawPost(slug)
	if (!raw) {
		error(404, "文章不存在")
	}

	const versions = await listVersions(slug)
	const currentVersion = (await getCurrentVersion(slug)) ?? 0
	const from = url.searchParams.get("from") ?? ""
	return { slug, versions, currentVersion, from }
}
