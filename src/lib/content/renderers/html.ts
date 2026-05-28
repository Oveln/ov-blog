import { unified } from "unified"
import remarkRehype from "remark-rehype"
import rehypeStringify from "rehype-stringify"
import rehypeSlug from "rehype-slug"
import rehypeKatex from "rehype-katex"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import type { Root } from "mdast"
import { highlightCodeBlocks } from "../transforms/code-highlight"

export async function renderHtml(tree: Root): Promise<string> {
  await highlightCodeBlocks(tree)

  const processor = unified()
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeKatex)
    .use(rehypeStringify, { allowDangerousHtml: true })

  const hastTree = await processor.run(tree)
  return processor.stringify(hastTree)
}
