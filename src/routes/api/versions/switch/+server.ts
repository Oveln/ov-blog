import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { switchToVersion } from "$lib/server/posts"
import { validateSlug } from "$lib/server/slug"

export const POST: RequestHandler = async ({ request }) => {
	let body: Record<string, unknown>
	try {
		body = await request.json()
	} catch {
		return json({ error: "invalid JSON" }, { status: 400 })
	}
	const { slug, version } = body as { slug?: string; version?: string | number }

	if (!slug || !version) {
		return json({ error: "slug and version are required" }, { status: 400 })
	}
	if (!validateSlug(slug)) {
		return json({ error: "invalid slug" }, { status: 400 })
	}

	const versionNum = parseInt(String(version), 10)
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