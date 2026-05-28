import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import type { Processor } from "unified"

export function mathPlugin(processor: Processor) {
  processor.use(remarkMath).use(rehypeKatex)
}
