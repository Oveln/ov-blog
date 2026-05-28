import { describe, it, expect } from "vitest"
import { extractToc } from "$lib/content/transforms/toc"
import { parseToMdast } from "$lib/content/parser"

describe("extractToc", () => {
  it("提取 h2 和 h3 标题", async () => {
    const md = `# H1\n\n## 第一章\n\n### 第一节\n\n## 第二章\n\n### 第二节\n\n### 第三节`
    const tree = await parseToMdast(md)
    const toc = extractToc(tree)
    expect(toc).toHaveLength(5)
    expect(toc[0]).toEqual({ depth: 2, text: "第一章", id: "第一章" })
    expect(toc[1]).toEqual({ depth: 3, text: "第一节", id: "第一节" })
    expect(toc[4]).toEqual({ depth: 3, text: "第三节", id: "第三节" })
  })

  it("忽略 h1 和 h4+ 标题", async () => {
    const md = "# H1\n\n#### H4\n\n##### H5"
    const tree = await parseToMdast(md)
    const toc = extractToc(tree)
    expect(toc).toHaveLength(0)
  })

  it("英文标题生成 slug id", async () => {
    const md = "## Hello World\n\n### Some Section"
    const tree = await parseToMdast(md)
    const toc = extractToc(tree)
    expect(toc[0].id).toBe("hello-world")
    expect(toc[1].id).toBe("some-section")
  })

  it("中英混合标题生成正确 id", async () => {
    const md = "## SvelteKit 入门指南"
    const tree = await parseToMdast(md)
    const toc = extractToc(tree)
    expect(toc[0].id).toBe("sveltekit-入门指南")
  })

  it("空内容返回空数组", async () => {
    const tree = await parseToMdast("")
    const toc = extractToc(tree)
    expect(toc).toEqual([])
  })

  it("无标题内容返回空数组", async () => {
    const md = "只有段落文字\n\n没有标题"
    const tree = await parseToMdast(md)
    const toc = extractToc(tree)
    expect(toc).toEqual([])
  })

  it("处理带链接的标题", async () => {
    const md = "## [Link Text](url)"
    const tree = await parseToMdast(md)
    const toc = extractToc(tree)
    expect(toc[0].text).toBe("Link Text")
  })

  it("处理带行内代码的标题", async () => {
    const md = "## Using `npm install`"
    const tree = await parseToMdast(md)
    const toc = extractToc(tree)
    expect(toc[0].text).toBe("Using npm install")
  })
})
