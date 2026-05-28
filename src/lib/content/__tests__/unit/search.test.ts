import { describe, it, expect } from "vitest"
import { buildSearchEntry } from "$lib/content/renderers/search"
import type { PostMeta, TocItem } from "$lib/content/schema"

describe("buildSearchEntry", () => {
  const meta: PostMeta = {
    title: "SvelteKit 入门",
    description: "一篇关于 SvelteKit 的入门教程",
    tags: ["svelte", "tutorial"],
    published: true,
    createdAt: "2026-05-28",
    slug: "sveltekit-guide",
  }

  const toc: TocItem[] = [
    { depth: 2, text: "安装", id: "安装" },
    { depth: 2, text: "配置", id: "配置" },
    { depth: 3, text: "TypeScript", id: "typescript" },
  ]

  it("构建搜索条目包含所有字段", () => {
    const entry = buildSearchEntry(meta, toc)
    expect(entry.slug).toBe("sveltekit-guide")
    expect(entry.title).toBe("SvelteKit 入门")
    expect(entry.description).toBe("一篇关于 SvelteKit 的入门教程")
    expect(entry.tags).toEqual(["svelte", "tutorial"])
  })

  it("headings 从 toc 提取文本", () => {
    const entry = buildSearchEntry(meta, toc)
    expect(entry.headings).toEqual(["安装", "配置", "TypeScript"])
  })

  it("空 toc 返回空 headings", () => {
    const entry = buildSearchEntry(meta, [])
    expect(entry.headings).toEqual([])
  })

  it("空 tags 返回空数组", () => {
    const entry = buildSearchEntry({ ...meta, tags: [] }, toc)
    expect(entry.tags).toEqual([])
  })
})
