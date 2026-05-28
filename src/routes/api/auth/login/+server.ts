import { json } from "@sveltejs/kit"
import { createSession, sessionCookie, verifyTOTP } from "$lib/auth/session"
import type { RequestHandler } from "./$types"

const rateMap = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
	const now = Date.now()
	const entry = rateMap.get(ip)
	if (!entry || now > entry.resetAt) {
		rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
		return true
	}
	if (entry.count >= MAX_ATTEMPTS) return false
	entry.count++
	return true
}

export const POST: RequestHandler = async (event) => {
	const ip = event.getClientAddress()

	if (!checkRateLimit(ip)) {
		return json({ ok: false, error: "尝试次数过多，请稍后再试" }, { status: 429 })
	}

	const { code } = await event.request.json()

	if (!verifyTOTP(code)) {
		return json({ ok: false, error: "验证码错误" }, { status: 401 })
	}

	rateMap.delete(ip)

	const token = await createSession()

	return json(
		{ ok: true },
		{
			headers: { "Set-Cookie": sessionCookie(token) },
		},
	)
}
