import { getAllPostSummaries } from "$lib/server/posts"
import { env } from "$env/dynamic/private"

export async function GET() {
	const siteUrl = env.SITE_URL ?? "http://localhost:5173"
	const posts = await getAllPostSummaries({ publishedOnly: true })

	const urls = posts
		.map(
			(post) => `
  <url>
    <loc>${siteUrl}/blogs/${post.slug}</loc>
    <lastmod>${post.updatedAt ?? post.createdAt}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
		)
		.join("")

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/blogs</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${urls}
</urlset>`

	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
			"Cache-Control": "public, max-age=3600",
		},
	})
}
