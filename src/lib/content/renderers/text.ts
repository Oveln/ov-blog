import type { Root } from "mdast"
import { getNodeText } from "../ast"

export function renderPlainText(tree: Root): string {
  return tree.children.map(getNodeText).join("\n\n")
}
