import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import { getNextId } from "$lib/server/posts"

export const GET: RequestHandler = async () => {
	const nextId = await getNextId()
	return json({ nextId })
}
