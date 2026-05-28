import { describe, it, expect } from "vitest"
import { renderPlainText } from "$lib/content/renderers/text"
import { parseToMdast } from "$lib/content/parser"

describe("renderPlainText", () => {
  it("提取纯文本内容", async () => {
    const tree = await parseToMdast("Hello **world** and *style*")
    const text = renderPlainText(tree)
    expect(text).toContain("Hello")
    expect(text).toContain("world")
    expect(text).toContain("style")
    expect(text).not.toContain("**")
    expect(text).not.toContain("*")
  })

  it("多个节点用双换行分隔", async () => {
    const tree = await parseToMdast("第一段\n\n第二段\n\n第三段")
    const text = renderPlainText(tree)
    expect(text).toContain("\n\n")
    expect(text.split("\n\n")).toHaveLength(3)
  })

  it("中文内容提取", async () => {
    const tree = await parseToMdast("你好世界")
    const text = renderPlainText(tree)
    expect(text).toBe("你好世界")
  })

  it("空内容返回空字符串", async () => {
    const tree = await parseToMdast("")
    const text = renderPlainText(tree)
    expect(text).toBe("")
  })

  it("链接提取文本而非 URL", async () => {
    const tree = await parseToMdast("[Click here](https://example.com)")
    const text = renderPlainText(tree)
    expect(text).toContain("Click here")
    expect(text).not.toContain("https://")
  })

  it("代码块提取代码文本", async () => {
    const tree = await parseToMdast("```\nconst x = 1\n```")
    const text = renderPlainText(tree)
    expect(text).toContain("const x = 1")
  })
})
