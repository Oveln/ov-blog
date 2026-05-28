import { describe, it, expect } from "vitest"
import { highlightCodeBlocks } from "$lib/content/transforms/code-highlight"
import { unified } from "unified"
import remarkParse from "remark-parse"
import type { Root } from "mdast"

async function parseToRoot(md: string): Promise<Root> {
  const processor = unified().use(remarkParse)
  return processor.parse(md) as Root
}

describe("highlightCodeBlocks", () => {
  it("高亮有语言标记的代码块", async () => {
    const md = "\`\`\`typescript\nconst x: number = 1\n\`\`\`"
    const tree = await parseToRoot(md)
    await highlightCodeBlocks(tree)

    const htmlNode = tree.children.find((n: any) => n.type === "html")
    expect(htmlNode).toBeDefined()
    const value = (htmlNode as any).value as string
    expect(value).toContain("shiki-wrapper")
    expect(value).toContain("github-dark")
  })

  it("无语言标记的代码块保持不变", async () => {
    const md = "\`\`\`\nplain code\n\`\`\`"
    const tree = await parseToRoot(md)
    await highlightCodeBlocks(tree)

    const codeNode = tree.children.find((n: any) => n.type === "code")
    expect(codeNode).toBeDefined()
    expect((codeNode as any).value).toBe("plain code")
  })

  it("多语言代码块分别高亮", async () => {
    const md = "\`\`\`javascript\nconsole.log(1)\n\`\`\`\n\n\`\`\`python\nprint(1)\n\`\`\`"
    const tree = await parseToRoot(md)
    await highlightCodeBlocks(tree)

    const htmlNodes = tree.children.filter((n: any) => n.type === "html")
    expect(htmlNodes).toHaveLength(2)
  })

  it("不支持的语言保持原样", async () => {
    const md = "\`\`\`brainfuck\n+++.\n\`\`\`"
    const tree = await parseToRoot(md)
    await highlightCodeBlocks(tree)

    const codeNode = tree.children.find((n: any) => n.type === "code")
    expect(codeNode).toBeDefined()
  })

  it("无代码块的文档不变", async () => {
    const md = "# Title\n\nParagraph only"
    const tree = await parseToRoot(md)
    const originalCount = tree.children.length
    await highlightCodeBlocks(tree)
    expect(tree.children.length).toBe(originalCount)
  })
})
