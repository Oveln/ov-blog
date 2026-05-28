import { getAllPosts } from "$lib/server/posts"
import { renderRss } from "$lib/content"
import { env } from "$env/dynamic/private"

export async function GET() {
	const siteUrl = env.SITE_URL ?? "http://localhost:5173"
	const posts = await getAllPosts({ publishedOnly: true })
	const xml = renderRss(posts, siteUrl)

	return new Response(xml, {
		headers: {
			"Content-Type": "application/rss+xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	})
}
