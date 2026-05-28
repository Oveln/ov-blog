import { describe, it, expect } from "vitest"
import { extractExcerpt } from "$lib/content/transforms/excerpt"
import { parseToMdast } from "$lib/content/parser"

describe("extractExcerpt", () => {
  it("提取第一段文本作为摘要", async () => {
    const md = "这是第一段摘要内容。\n\n这是第二段。"
    const tree = await parseToMdast(md)
    const excerpt = extractExcerpt(tree)
    expect(excerpt).toBe("这是第一段摘要内容。")
  })

  it("短文本不截断", async () => {
    const md = "短文本"
    const tree = await parseToMdast(md)
    const excerpt = extractExcerpt(tree)
    expect(excerpt).toBe("短文本")
    expect(excerpt).not.toContain("…")
  })

  it("长文本默认 200 字截断并加省略号", async () => {
    const longText = "a".repeat(250)
    const md = longText
    const tree = await parseToMdast(md)
    const excerpt = extractExcerpt(tree)
    expect(excerpt.length).toBeLessThan(longText.length)
    expect(excerpt).toContain("…")
    expect(excerpt.endsWith("…")).toBe(true)
  })

  it("自定义 maxLength 截断", async () => {
    const md = "这是一段测试文本用于验证截断功能是否正常工作"
    const tree = await parseToMdast(md)
    const excerpt = extractExcerpt(tree, 10)
    expect(excerpt.length).toBe(11) // 10 chars + …
    expect(excerpt).toContain("…")
  })

  it("无段落返回空字符串", async () => {
    const md = "# 只有标题"
    const tree = await parseToMdast(md)
    const excerpt = extractExcerpt(tree)
    expect(excerpt).toBe("")
  })

  it("跳过标题只取段落", async () => {
    const md = "# 标题\n\n这是摘要。\n\n第二段。"
    const tree = await parseToMdast(md)
    const excerpt = extractExcerpt(tree)
    expect(excerpt).toBe("这是摘要。")
  })

  it("恰好 maxLength 不截断", async () => {
    const text = "a".repeat(50)
    const md = text
    const tree = await parseToMdast(md)
    const excerpt = extractExcerpt(tree, 50)
    expect(excerpt).toBe(text)
    expect(excerpt).not.toContain("…")
  })
})
