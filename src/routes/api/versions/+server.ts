import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { listVersions, getVersion, getCurrentVersion } from "$lib/server/posts"

export const GET: RequestHandler = async ({ url }) => {
	const slug = url.searchParams.get("slug")
	if (!slug) {
		return json({ error: "slug is required" }, { status: 400 })
	}

	const version = url.searchParams.get("version")

	if (version) {
		const versionNum = parseInt(version, 10)
		if (isNaN(versionNum) || versionNum < 1) {
			return json({ error: "version must be a positive integer" }, { status: 400 })
		}

		const content = await getVersion(slug, versionNum)
		if (!content) {
			return json({ error: "version not found" }, { status: 404 })
		}

		return json({ slug, version: versionNum, content })
	}

	const versions = await listVersions(slug)
	const currentVersion = (await getCurrentVersion(slug)) ?? 0
	return json({ slug, versions, currentVersion })
}