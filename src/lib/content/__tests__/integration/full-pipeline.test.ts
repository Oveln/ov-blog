import { describe, it, expect } from "vitest"
import { processPost } from "$lib/content/pipeline"
import { renderRss } from "$lib/content/renderers/rss"
import { buildSearchEntry } from "$lib/content/renderers/search"
import { renderPlainText } from "$lib/content/renderers/text"
import { parseToMdast } from "$lib/content/parser"

const COMPLEX_POST = `---
title: 复杂文章：GFM + 数学 + 代码 + 中文
description: 测试全链路 Content Pipeline
tags:
  - svelte
  - typescript
  - math
published: true
createdAt: "2026-05-28"
---

## 简介

这是一篇包含各种 Markdown 特性的测试文章，用于验证 Content Pipeline 的完整性。

## GFM 扩展

### 任务列表

- [x] 已完成的任务
- [ ] 未完成的任务

### 表格

| 特性 | 状态 |
| --- | --- |
| GFM | ✅ |
| 数学 | ✅ |
| 代码高亮 | ✅ |

### 删除线

~~这段文字被删除了~~

## 代码高亮

\`\`\`typescript
interface Post<T> {
  id: string
  data: T
  createdAt: Date
}

function createPost<T>(data: T): Post<T> {
  return { id: crypto.randomUUID(), data, createdAt: new Date() }
}
\`\`\`

行内代码：使用 \`npm install\` 安装依赖。

## 数学公式

行内公式：$E = mc^2$

块级公式：

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

## 中英混合内容

SvelteKit 是一个基于 Svelte 的全栈框架，它提供了：

1. **文件系统路由** — 基于 \`src/routes/\` 目录结构
2. **SSR/SSG** — 服务端渲染或静态生成
3. **TypeScript 支持** — 开箱即用

> 这是一段引用文字，包含一些重要的观点。

## 总结

以上就是 Content Pipeline 的完整测试。`

describe("全链路集成测试", () => {
  it("复杂 Markdown 完整处理", async () => {
    const result = await processPost("complex-post", COMPLEX_POST)

    expect(result.slug).toBe("complex-post")
    expect(result.title).toBe("复杂文章：GFM + 数学 + 代码 + 中文")
    expect(result.tags).toEqual(["svelte", "typescript", "math"])
  })

  it("GFM 表格渲染", async () => {
    const result = await processPost("complex-post", COMPLEX_POST)
    expect(result.html).toContain("<table>")
    expect(result.html).toContain("<td>")
  })

  it("GFM 任务列表渲染", async () => {
    const result = await processPost("complex-post", COMPLEX_POST)
    expect(result.html).toContain("checkbox")
  })

  it("GFM 删除线渲染", async () => {
    const result = await processPost("complex-post", COMPLEX_POST)
    expect(result.html).toContain("<del>这段文字被删除了</del>")
  })

  it("代码高亮包含 Shiki", async () => {
    const result = await processPost("complex-post", COMPLEX_POST)
    expect(result.html).toContain("shiki-wrapper")
    expect(result.html).toContain("github-dark")
  })

  it("KaTeX 数学公式渲染", async () => {
    const result = await processPost("complex-post", COMPLEX_POST)
    expect(result.html).toContain("katex")
  })

  it("TOC 提取所有 h2/h3", async () => {
    const result = await processPost("complex-post", COMPLEX_POST)
    const h2s = result.toc.filter((t) => t.depth === 2)
    const h3s = result.toc.filter((t) => t.depth === 3)
    expect(h2s.length).toBeGreaterThanOrEqual(4)
    expect(h3s.length).toBeGreaterThanOrEqual(1)
  })

  it("摘要从第一段提取", async () => {
    const result = await processPost("complex-post", COMPLEX_POST)
    expect(result.excerpt).toContain("各种 Markdown 特性")
  })

  it("阅读时间 > 1", async () => {
    const result = await processPost("complex-post", COMPLEX_POST)
    expect(result.readingTime).toBeGreaterThanOrEqual(1)
  })

  it("HTML 包含自动链接标题", async () => {
    const result = await processPost("complex-post", COMPLEX_POST)
    expect(result.html).toContain("<a ")
    expect(result.html).toMatch(/href="#[^"]*"/)
  })

  it("HTML 包含引用块", async () => {
    const result = await processPost("complex-post", COMPLEX_POST)
    expect(result.html).toContain("<blockquote>")
  })

  it("HTML 包含有序列表", async () => {
    const result = await processPost("complex-post", COMPLEX_POST)
    expect(result.html).toContain("<ol>")
  })
})

describe("跨模块集成", () => {
  const SITE_URL = "https://blog.example.com"

  it("pipeline → RSS 完整流程", async () => {
    const result = await processPost("slug-1", COMPLEX_POST)
    const rss = renderRss([result], SITE_URL)
    expect(rss).toContain("<?xml")
    expect(rss).toContain("slug-1")
    expect(rss).toContain(SITE_URL)
  })

  it("pipeline → search index 完整流程", async () => {
    const result = await processPost("slug-1", COMPLEX_POST)
    const entry = buildSearchEntry(result, result.toc)
    expect(entry.slug).toBe("slug-1")
    expect(entry.headings.length).toBeGreaterThan(0)
    expect(entry.tags).toEqual(["svelte", "typescript", "math"])
  })

  it("parser → renderPlainText 完整流程", async () => {
    const parsed = await parseToMdast(COMPLEX_POST.split("---\n").slice(2).join("---\n"))
    const text = renderPlainText(parsed)
    expect(text).toContain("SvelteKit")
    expect(text).toContain("代码高亮")
    expect(text).not.toContain("**")
  })
})
