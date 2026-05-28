import { describe, it, expect } from "vitest"
import { renderRss } from "$lib/content/renderers/rss"
import type { PostContent } from "$lib/content/schema"

function makePost(overrides: Partial<PostContent> = {}): PostContent {
  return {
    title: "Test Post",
    description: "A test post",
    tags: ["test"],
    published: true,
    createdAt: "2026-05-28",
    slug: "test-post",
    raw: "",
    html: "",
    toc: [],
    excerpt: "Test excerpt",
    readingTime: 1,
    ...overrides,
  }
}

describe("renderRss", () => {
  it("生成有效的 RSS XML", () => {
    const posts = [makePost()]
    const rss = renderRss(posts, "https://example.com")
    expect(rss).toContain("<?xml")
    expect(rss).toContain("<rss")
    expect(rss).toContain("<channel>")
    expect(rss).toContain("</channel>")
    expect(rss).toContain("</rss>")
  })

  it("包含站点信息", () => {
    const rss = renderRss([], "https://example.com")
    expect(rss).toContain("<title>Oveln Blog</title>")
    expect(rss).toContain("<link>https://example.com</link>")
    expect(rss).toContain("<language>zh-CN</language>")
  })

  it("包含文章条目", () => {
    const posts = [makePost({ title: "My Post", slug: "my-post", excerpt: "My excerpt" })]
    const rss = renderRss(posts, "https://example.com")
    expect(rss).toContain("<item>")
    expect(rss).toContain("<![CDATA[My Post]]>")
    expect(rss).toContain("https://example.com/blogs/my-post")
    expect(rss).toContain("<![CDATA[My excerpt]]>")
  })

  it("多篇文章生成多个 item", () => {
    const posts = [
      makePost({ slug: "a" }),
      makePost({ slug: "b" }),
      makePost({ slug: "c" }),
    ]
    const rss = renderRss(posts, "https://example.com")
    const items = rss.match(/<item>/g)
    expect(items).toHaveLength(3)
  })

  it("包含 atom:link 自引用", () => {
    const rss = renderRss([], "https://example.com")
    expect(rss).toContain("atom:link")
    expect(rss).toContain("https://example.com/rss.xml")
  })

  it("空文章列表仍生成有效 RSS", () => {
    const rss = renderRss([], "https://example.com")
    expect(rss).toContain("<channel>")
    expect(rss).not.toContain("<item>")
  })

  it("包含 pubDate", () => {
    const posts = [makePost({ createdAt: "2026-05-28" })]
    const rss = renderRss(posts, "https://example.com")
    expect(rss).toContain("<pubDate>")
    expect(rss).toContain("GMT")
  })

  it("处理特殊字符用 CDATA 包裹", () => {
    const posts = [makePost({ title: '<script>alert("xss")</script>' })]
    const rss = renderRss(posts, "https://example.com")
    expect(rss).toContain("<![CDATA[<script>alert")
  })
})
