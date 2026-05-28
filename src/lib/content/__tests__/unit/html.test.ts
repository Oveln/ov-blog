import { describe, it, expect } from "vitest"
import { renderHtml } from "$lib/content/renderers/html"
import { parseToMdast } from "$lib/content/parser"

async function render(markdown: string): Promise<string> {
  const tree = await parseToMdast(markdown)
  return renderHtml(tree)
}

describe("renderHtml", () => {
  it("渲染基础 Markdown 为 HTML", async () => {
    const html = await render("# Hello\n\nWorld")
    expect(html).toContain("<h1")
    expect(html).toContain("Hello")
    expect(html).toContain("<p>")
    expect(html).toContain("World")
  })

  it("为标题添加 slug id", async () => {
    const html = await render("## Hello World")
    expect(html).toContain('id="hello-world"')
  })

  it("自动链接标题", async () => {
    const html = await render("## Hello World")
    expect(html).toContain("<a ")
    expect(html).toContain('href="#hello-world"')
  })

  it("渲染行内代码", async () => {
    const html = await render("Use `npm install` to install")
    expect(html).toContain("<code>")
    expect(html).toContain("npm install")
  })

  it("渲染代码块并高亮", async () => {
    const html = await render("```typescript\nconst x = 1\n```")
    expect(html).toContain("shiki-wrapper")
  })

  it("渲染 GFM 表格", async () => {
    const html = await render("| a | b |\n| --- | --- |\n| 1 | 2 |")
    expect(html).toContain("<table>")
    expect(html).toContain("<th")
  })

  it("渲染 GFM 任务列表", async () => {
    const html = await render("- [x] done\n- [ ] todo")
    expect(html).toContain("checkbox")
    expect(html).toContain("checked")
  })

  it("渲染数学公式为 KaTeX", async () => {
    const html = await render("$E = mc^2$")
    expect(html).toContain("katex")
  })

  it("渲染块级数学公式", async () => {
    const html = await render("$$\n\\int_0^1 x \\, dx\n$$")
    expect(html).toContain("katex")
  })

  it("渲染粗体和斜体", async () => {
    const html = await render("**bold** and *italic*")
    expect(html).toContain("<strong>bold</strong>")
    expect(html).toContain("<em>italic</em>")
  })

  it("渲染链接", async () => {
    const html = await render("[link](https://example.com)")
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain(">link<")
  })

  it("渲染图片", async () => {
    const html = await render("![alt](https://example.com/img.png)")
    expect(html).toContain("<img")
    expect(html).toContain('src="https://example.com/img.png"')
    expect(html).toContain('alt="alt"')
  })

  it("渲染列表", async () => {
    const html = await render("- item 1\n- item 2\n- item 3")
    expect(html).toContain("<ul>")
    expect(html).toContain("<li>")
  })

  it("渲染分割线", async () => {
    const html = await render("above\n\n---\n\nbelow")
    expect(html).toContain("<hr")
  })

  it("中文内容渲染正常", async () => {
    const html = await render("## 你好世界\n\n这是一段中文内容。")
    expect(html).toContain("你好世界")
    expect(html).toContain("这是一段中文内容。")
  })
})
