import { json } from "@sveltejs/kit"
import { getTOTPUri } from "$lib/auth/session"
import QRCode from "qrcode-svg"
import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.user) {
		return json({ error: "Unauthorized" }, { status: 401 })
	}

	const format = url.searchParams.get("format")

	if (format === "uri") {
		return json({ uri: getTOTPUri() })
	}

	const svg = new QRCode(getTOTPUri()).svg()
	return new Response(svg, {
		headers: { "Content-Type": "image/svg+xml", "Cache-Control": "no-store" },
	})
}
