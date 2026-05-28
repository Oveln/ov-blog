import type { Root } from "mdast"
import { getNodeText } from "../ast"

export function extractExcerpt(tree: Root, maxLength = 200): string {
  const paragraphs = tree.children.filter((n) => n.type === "paragraph")
  if (paragraphs.length === 0) return ""
  const text = getNodeText(paragraphs[0])
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "…"
}
