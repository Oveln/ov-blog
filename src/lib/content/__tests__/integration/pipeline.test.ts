import { describe, it, expect } from "vitest"
import { processPost, processPostSummary } from "$lib/content/pipeline"

const SAMPLE_POST = `---
title: 测试文章
description: 用于集成测试的描述
tags:
  - test
  - svelte
published: true
createdAt: "2026-05-28"
updatedAt: "2026-05-29"
---

## 第一节

这是第一段内容，用于测试摘要提取。

## 第二节

这是第二段内容，包含一些 **粗体** 和 *斜体* 文本。

### 子节

- 列表项 1
- 列表项 2

\`\`\`typescript
interface Hello {
  world: string
}
\`\`\`

[链接](https://example.com)`

describe("processPost", () => {
  it("完整处理一篇文章", async () => {
    const result = await processPost("test-post", SAMPLE_POST)

    expect(result.slug).toBe("test-post")
    expect(result.title).toBe("测试文章")
    expect(result.description).toBe("用于集成测试的描述")
    expect(result.tags).toEqual(["test", "svelte"])
    expect(result.published).toBe(true)
    expect(result.updatedAt).toBe("2026-05-29")
  })

  it("生成 HTML", async () => {
    const result = await processPost("test-post", SAMPLE_POST)
    expect(result.html).toContain("<h2")
    expect(result.html).toContain("<p>")
    expect(result.html).toContain("<ul>")
    expect(result.html).toContain("shiki-wrapper")
    expect(result.html).toContain("<strong>粗体</strong>")
    expect(result.html).toContain("<em>斜体</em>")
  })

  it("提取 TOC", async () => {
    const result = await processPost("test-post", SAMPLE_POST)
    expect(result.toc.length).toBeGreaterThanOrEqual(3)
    expect(result.toc[0].depth).toBe(2)
    expect(result.toc[0].text).toBe("第一节")
  })

  it("提取摘要", async () => {
    const result = await processPost("test-post", SAMPLE_POST)
    expect(result.excerpt).toBeTruthy()
    expect(result.excerpt).toContain("第一段内容")
  })

  it("计算阅读时间", async () => {
    const result = await processPost("test-post", SAMPLE_POST)
    expect(result.readingTime).toBeGreaterThanOrEqual(1)
  })

  it("保留原始内容", async () => {
    const result = await processPost("test-post", SAMPLE_POST)
    expect(result.raw).toBe(SAMPLE_POST)
  })

  it("HTML 包含 slug id", async () => {
    const result = await processPost("test-post", SAMPLE_POST)
    expect(result.html).toContain('id="')
  })
})

describe("processPostSummary", () => {
  it("提取摘要级字段", async () => {
    const result = await processPostSummary("test-post", SAMPLE_POST)
    expect(result.slug).toBe("test-post")
    expect(result.title).toBe("测试文章")
    expect(result.excerpt).toBeTruthy()
    expect(result.readingTime).toBeGreaterThanOrEqual(1)
  })

  it("不包含 html/raw/toc", async () => {
    const result = await processPostSummary("test-post", SAMPLE_POST)
    expect("html" in result).toBe(false)
    expect("raw" in result).toBe(false)
    expect("toc" in result).toBe(false)
  })
})
