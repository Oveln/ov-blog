import { visit } from "unist-util-visit"
import type { Root, Code } from "mdast"
import { createHighlighter, type Highlighter } from "shiki"

let highlighterPromise: Promise<Highlighter> | null = null

async function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: ["javascript", "typescript", "python", "rust", "go", "bash", "json", "html", "css", "svelte", "vue", "jsx", "tsx", "markdown", "yaml", "toml", "sql", "shell"],
    })
  }
  return highlighterPromise
}

export async function highlightCodeBlocks(tree: Root): Promise<void> {
  const highlighter = await getHighlighter()

  visit(tree, "code", (node: Code) => {
    if (!node.lang) return

    try {
      const html = highlighter.codeToHtml(node.value, {
        lang: node.lang,
        themes: {
          dark: "github-dark",
          light: "github-light",
        },
      })
      node.type = "html" as any
      ;(node as any).value = `<div class="shiki-wrapper">${html}</div>`
      delete (node as any).lang
      delete (node as any).meta
    } catch {
      // lang not supported, leave as-is
    }
  })
}
