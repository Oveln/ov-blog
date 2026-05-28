import { verifySession, getSessionToken } from "$lib/auth/session"
import type { Handle } from "@sveltejs/kit"

export const handle: Handle = async ({ event, resolve }) => {
	const token = getSessionToken(event.request.headers.get("cookie"))
	const session = token ? await verifySession(token) : null

	event.locals.user = session

	const path = event.url.pathname

	if (path.startsWith("/dashboard") && !path.startsWith("/dashboard/login")) {
		if (!session) {
			return new Response(null, {
				status: 302,
				headers: { Location: "/dashboard/login" },
			})
		}
	}

	if (path.startsWith("/api/") && !path.startsWith("/api/auth/")) {
		if (!session) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			})
		}
	}

	return resolve(event)
}
