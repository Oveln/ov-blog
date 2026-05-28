import { describe, it, expect } from "vitest"
import { parseFrontmatter, parseToMdast } from "$lib/content/parser"

const VALID_POST = `---
title: 测试文章
description: 这是一篇测试文章
tags:
  - svelte
  - ai
published: true
createdAt: "2026-05-28"
---

# 你好世界

这是正文内容。`

describe("parseFrontmatter", () => {
  it("解析完整 frontmatter", () => {
    const result = parseFrontmatter(VALID_POST)
    expect(result.frontmatter.title).toBe("测试文章")
    expect(result.frontmatter.description).toBe("这是一篇测试文章")
    expect(result.frontmatter.tags).toEqual(["svelte", "ai"])
    expect(result.frontmatter.published).toBe(true)
    expect(result.frontmatter.createdAt).toBe("2026-05-28")
  })

  it("分离 content 和 frontmatter", () => {
    const result = parseFrontmatter(VALID_POST)
    expect(result.content).not.toContain("---")
    expect(result.content.trim()).toContain("# 你好世界")
    expect(result.raw).toBe(VALID_POST)
  })

  it("slug 初始为空字符串", () => {
    const result = parseFrontmatter(VALID_POST)
    expect(result.meta.slug).toBe("")
  })

  it("meta 继承 frontmatter 所有字段", () => {
    const result = parseFrontmatter(VALID_POST)
    expect(result.meta.title).toBe(result.frontmatter.title)
    expect(result.meta.tags).toBe(result.frontmatter.tags)
  })

  it("处理无 frontmatter 的内容", () => {
    const raw = "Just plain text"
    const result = parseFrontmatter(raw)
    expect(result.content).toBe("Just plain text")
    expect(result.frontmatter.title).toBe("")
    expect(result.frontmatter.tags).toEqual([])
    expect(result.frontmatter.published).toBe(false)
  })

  it("处理 updatedAt 可选字段", () => {
    const raw = `---
title: 有更新
description: desc
tags: []
published: true
createdAt: "2026-01-01"
updatedAt: "2026-05-28"
---
content`
    const result = parseFrontmatter(raw)
    expect(result.frontmatter.updatedAt).toBe("2026-05-28")
  })
})

describe("parseToMdast", () => {
  it("解析标题为 heading 节点", async () => {
    const tree = await parseToMdast("## Hello\n### World")
    const headings = tree.children.filter((n: any) => n.type === "heading")
    expect(headings).toHaveLength(2)
    expect((headings[0] as any).depth).toBe(2)
    expect((headings[1] as any).depth).toBe(3)
  })

  it("解析段落为 paragraph 节点", async () => {
    const tree = await parseToMdast("第一段\n\n第二段")
    const paragraphs = tree.children.filter((n: any) => n.type === "paragraph")
    expect(paragraphs).toHaveLength(2)
  })

  it("解析代码块为 code 节点", async () => {
    const tree = await parseToMdast("\`\`\`typescript\nconst x = 1\n\`\`\`")
    const code = tree.children.find((n: any) => n.type === "code")
    expect(code).toBeDefined()
    expect((code as any).lang).toBe("typescript")
    expect((code as any).value).toBe("const x = 1")
  })

  it("解析 GFM 表格", async () => {
    const md = "| a | b |\n| --- | --- |\n| 1 | 2 |"
    const tree = await parseToMdast(md)
    const table = tree.children.find((n: any) => n.type === "table")
    expect(table).toBeDefined()
  })

  it("解析数学公式", async () => {
    const md = "$E = mc^2$\n\n$$\n\\int_0^1 x dx\n$$"
    const tree = await parseToMdast(md)
    const math = tree.children.filter((n: any) => n.type === "math" || n.type === "inlineMath")
    expect(math.length).toBeGreaterThanOrEqual(1)
  })
})
