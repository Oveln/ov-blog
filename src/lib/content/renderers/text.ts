import type { Root, Content } from "mdast"

function getNodeText(node: Content): string {
  if ("value" in node) return node.value as string
  if ("children" in node) return (node.children as Content[]).map(getNodeText).join("")
  return ""
}

export function renderPlainText(tree: Root): string {
  return tree.children.map(getNodeText).join("\n\n")
}
