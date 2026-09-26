import type { PostContent } from "../schema"

function xmlEscape(s: string): string {
	return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function cdata(s: string): string {
	return `<![CDATA[${s.replace(/]]>/g, "]]&gt;")}]]>`
}

export function renderRss(posts: PostContent[], siteUrl: string): string {
  const escapedUrl = xmlEscape(siteUrl)
  const items = posts
    .map(
      (post) => `
    <item>
      <title>${cdata(post.title)}</title>
      <link>${escapedUrl}/blogs/${xmlEscape(post.slug)}</link>
      <description>${cdata(post.excerpt)}</description>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      <guid>${escapedUrl}/blogs/${xmlEscape(post.slug)}</guid>
    </item>`
    )
    .join("")

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Oveln Blog</title>
    <link>${escapedUrl}</link>
    <description>Oveln's personal blog</description>
    <language>zh-CN</language>
    <atom:link href="${escapedUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`
}
