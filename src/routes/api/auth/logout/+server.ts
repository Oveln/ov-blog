import { json } from "@sveltejs/kit"
import { clearCookie } from "$lib/auth/session"
import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async () => {
	return json(
		{ ok: true },
		{
			headers: { "Set-Cookie": clearCookie() },
		},
	)
}
