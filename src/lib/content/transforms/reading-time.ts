import type { Root } from "mdast"
import { extractAllText } from "../ast"

const WORDS_PER_MINUTE_ZH = 300
const WORDS_PER_MINUTE_EN = 200

export function calculateReadingTime(tree: Root): number {
  const text = extractAllText(tree)
  const cjkChars = (text.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g) || []).length
  const latinWords = (text.match(/[a-zA-Z]+/g) || []).length
  const minutes = cjkChars / WORDS_PER_MINUTE_ZH + latinWords / WORDS_PER_MINUTE_EN
  return Math.max(1, Math.ceil(minutes))
}
