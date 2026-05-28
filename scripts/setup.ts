#!/usr/bin/env bun
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { randomBytes } from "node:crypto"
import { TOTP, Secret } from "otpauth"
import qrcode from "qrcode-terminal"

const ENV_PATH = ".env"

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

function base32(bytes: number): string {
	const buf = randomBytes(bytes)
	let result = ""
	let bits = 0
	let value = 0
	for (const byte of buf) {
		value = (value << 8) | byte
		bits += 8
		while (bits >= 5) {
			bits -= 5
			result += B32[(value >> bits) & 0x1f]
		}
	}
	if (bits > 0) {
		result += B32[(value << (5 - bits)) & 0x1f]
	}
	return result
}

function readEnv(): Record<string, string> {
	if (!existsSync(ENV_PATH)) return {}
	const content = readFileSync(ENV_PATH, "utf-8")
	const result: Record<string, string> = {}
	for (const line of content.split("\n")) {
		const idx = line.indexOf("=")
		if (idx > 0) result[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
	}
	return result
}

function writeEnv(vars: Record<string, string>) {
	const existing = readEnv()
	const merged = { ...existing, ...vars }
	const lines = Object.entries(merged).map(([k, v]) => `${k}=${v}`)
	writeFileSync(ENV_PATH, lines.join("\n") + "\n")
}

const env = readEnv()

let authSecret = env.AUTH_SECRET
let totpSecret = env.TOTP_SECRET

if (!authSecret) {
	authSecret = base32(32)
	writeEnv({ AUTH_SECRET: authSecret })
	console.log("✅ AUTH_SECRET 已生成并写入 .env")
} else {
	console.log("✅ AUTH_SECRET 已存在")
}

if (!totpSecret) {
	totpSecret = base32(10)
	writeEnv({ TOTP_SECRET: totpSecret })
	console.log("✅ TOTP_SECRET 已生成并写入 .env")
} else {
	console.log("✅ TOTP_SECRET 已存在")
}

const totp = new TOTP({
	issuer: "Oveln Blog",
	label: "admin",
	algorithm: "SHA1",
	digits: 6,
	period: 30,
	secret: Secret.fromBase32(totpSecret),
})

const uri = totp.toString()

console.log("\n📱 在 Authenticator App 中手动添加以下密钥:")
console.log(`   ${totpSecret}`)
console.log("\n   或用手机扫描二维码:\n")
qrcode.generate(uri, { small: true })
console.log(`\n🔑 当前验证码: ${totp.generate()}`)
