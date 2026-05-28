import type { Root, Content } from "mdast"

function getNodeText(node: Content): string {
  if ("value" in node) return node.value as string
  if ("children" in node) return (node.children as Content[]).map(getNodeText).join("")
  return ""
}

export function extractExcerpt(tree: Root, maxLength = 200): string {
  const paragraphs = tree.children.filter((n) => n.type === "paragraph")
  if (paragraphs.length === 0) return ""
  const text = getNodeText(paragraphs[0])
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s+$/, "") + "…"
}
