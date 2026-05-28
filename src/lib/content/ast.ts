import type { Root, Content } from "mdast"

export function getNodeText(node: Content): string {
  if ("value" in node) return node.value as string
  if ("children" in node) return (node.children as Content[]).map(getNodeText).join("")
  return ""
}

export function extractAllText(tree: Root): string {
  const parts: string[] = []
  function visit(node: Content) {
    if ("value" in node) parts.push(node.value as string)
    if ("children" in node) {
      for (const child of node.children as Content[]) {
        visit(child)
      }
    }
  }
  for (const child of tree.children) {
    visit(child)
  }
  return parts.join(" ")
}
