import type { Root, Content } from "mdast"
import type { TocItem } from "../schema"

function getNodeText(node: Content): string {
  if ("value" in node) return node.value as string
  if ("children" in node) return (node.children as Content[]).map(getNodeText).join("")
  return ""
}

export function extractToc(tree: Root): TocItem[] {
  const toc: TocItem[] = []
  function visit(node: Content) {
    if (node.type === "heading" && (node.depth === 2 || node.depth === 3)) {
      const text = getNodeText(node)
      const id = text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fff]+/g, "-")
        .replace(/^-|-$/g, "")
      toc.push({ depth: node.depth, text, id })
    }
    if ("children" in node) {
      for (const child of node.children as Content[]) {
        visit(child)
      }
    }
  }
  for (const child of tree.children) {
    visit(child)
  }
  return toc
}
