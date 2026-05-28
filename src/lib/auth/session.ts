import { SignJWT, jwtVerify } from "jose"
import { TOTP, Secret } from "otpauth"
import { env } from "$env/dynamic/private"

const COOKIE_NAME = "session"
const TOKEN_EXPIRY = "7d"

function getAuthSecret(): string {
	const val = env.AUTH_SECRET
	if (!val) throw new Error("Missing AUTH_SECRET — 运行 'bun run setup' 自动生成 .env 文件")
	return val
}

function getTotpSecret(): string {
	const val = env.TOTP_SECRET
	if (!val) throw new Error("Missing TOTP_SECRET — 运行 'bun run setup' 自动生成 .env 文件")
	return val
}

function getJwtSecret(): Uint8Array {
	return new TextEncoder().encode(getAuthSecret())
}

let _totp: TOTP | null = null
function getTotp(): TOTP {
	if (!_totp) {
		_totp = new TOTP({
			issuer: "Oveln Blog",
			label: "admin",
			algorithm: "SHA1",
			digits: 6,
			period: 30,
			secret: Secret.fromBase32(getTotpSecret()),
		})
	}
	return _totp
}

export interface SessionPayload {
	sub: string
}

export function verifyTOTP(code: string): boolean {
	const delta = getTotp().validate({ token: code, window: 1 })
	return delta !== null
}

export function getTOTPUri(): string {
	return getTotp().toString()
}

export async function createSession(): Promise<string> {
	return new SignJWT({ sub: "admin" })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(TOKEN_EXPIRY)
		.sign(getJwtSecret())
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
	try {
		const { payload } = await jwtVerify(token, getJwtSecret())
		return { sub: payload.sub as string }
	} catch {
		return null
	}
}

function isProduction(): boolean {
	return env.NODE_ENV === "production"
}

export function sessionCookie(token: string): string {
	const flags = ["HttpOnly", "Path=/", "SameSite=Lax", `Max-Age=${60 * 60 * 24 * 7}`]
	if (isProduction()) flags.push("Secure")
	return `${COOKIE_NAME}=${token}; ${flags.join("; ")}`
}

export function clearCookie(): string {
	const flags = ["HttpOnly", "Path=/", "SameSite=Lax", "Max-Age=0"]
	if (isProduction()) flags.push("Secure")
	return `${COOKIE_NAME}=; ${flags.join("; ")}`
}

export function getSessionToken(cookies: string | null): string | null {
	if (!cookies) return null
	const match = cookies.match(/(?:^|;\s*)session=([^;]*)/)
	return match ? match[1] : null
}
