import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import remarkRehype from "remark-rehype"
import rehypeStringify from "rehype-stringify"
import rehypeSlug from "rehype-slug"
import rehypeKatex from "rehype-katex"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import type { Root } from "mdast"
import { highlightCodeBlocks } from "../transforms/code-highlight"

export async function renderHtml(content: string): Promise<string> {
  const tree = await parseAndHighlight(content)

  const processor = unified()
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeKatex)
    .use(rehypeStringify, { allowDangerousHtml: true })

  const result = await processor.run(tree)
  return processor.stringify(result)
}

async function parseAndHighlight(content: string): Promise<Root> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkMath)

  const tree = processor.parse(content) as Root
  await highlightCodeBlocks(tree)
  return tree
}
