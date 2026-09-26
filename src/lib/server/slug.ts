const SLUG_RE = /^[a-zA-Z0-9_-]+$/

export function validateSlug(slug: string): boolean {
	return SLUG_RE.test(slug)
}
