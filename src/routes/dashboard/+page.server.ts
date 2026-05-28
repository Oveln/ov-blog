import { getAllPostSummaries } from "$lib/server/posts"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async () => {
	const posts = await getAllPostSummaries()
	return { posts }
}
