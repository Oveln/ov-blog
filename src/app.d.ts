declare global {
	namespace App {
		interface Locals {
			user: { sub: string } | null
		}
	}
}

export {}
