import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { switchToVersion } from "$lib/server/posts"

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json()
	const { slug, version } = body

	if (!slug || !version) {
		return json({ error: "slug and version are required" }, { status: 400 })
	}

	const versionNum = parseInt(version, 10)
	if (isNaN(versionNum) || versionNum < 1) {
		return json({ error: "version must be a positive integer" }, { status: 400 })
	}

	try {
		const meta = await switchToVersion(slug, versionNum)
		return json({ ok: true, ...meta })
	} catch (e) {
		return json(
			{ error: e instanceof Error ? e.message : "switch failed" },
			{ status: 404 }
		)
	}
}