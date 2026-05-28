import type { Root, Content } from "mdast"

function getNodeText(node: Content): string {
  if ("value" in node) return node.value as string
  if ("children" in node) return (node.children as Content[]).map(getNodeText).join("")
  return ""
}

const WORDS_PER_MINUTE_ZH = 300
const WORDS_PER_MINUTE_EN = 200

export function calculateReadingTime(tree: Root): number {
  const text = extractAllText(tree)
  const cjkChars = (text.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g) || []).length
  const latinWords = (text.match(/[a-zA-Z]+/g) || []).length
  const minutes = cjkChars / WORDS_PER_MINUTE_ZH + latinWords / WORDS_PER_MINUTE_EN
  return Math.max(1, Math.ceil(minutes))
}

function extractAllText(tree: Root): string {
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
