import type { PipelineResult } from "./schema"
import { parseFrontmatter, parseToMdast } from "./parser"
import { extractToc } from "./transforms/toc"
import { extractExcerpt } from "./transforms/excerpt"
import { calculateReadingTime } from "./transforms/reading-time"
import { renderHtml } from "./renderers/html"

export async function processPost(slug: string, raw: string): Promise<PipelineResult> {
  const parsed = parseFrontmatter(raw)
  parsed.meta.slug = slug

  const tree = await parseToMdast(parsed.content)

  const [toc, excerpt, readingTime, html] = await Promise.all([
    Promise.resolve(extractToc(tree)),
    Promise.resolve(extractExcerpt(tree)),
    Promise.resolve(calculateReadingTime(tree)),
    renderHtml(parsed.content),
  ])

  return {
    meta: parsed.meta,
    raw,
    html,
    toc,
    excerpt,
    readingTime,
  }
}

export async function processPostSummary(
  slug: string,
  raw: string
): Promise<PipelineResult> {
  const parsed = parseFrontmatter(raw)
  parsed.meta.slug = slug

  const tree = await parseToMdast(parsed.content)

  const toc = extractToc(tree)
  const excerpt = extractExcerpt(tree)
  const readingTime = calculateReadingTime(tree)

  return {
    meta: parsed.meta,
    raw,
    html: "",
    toc,
    excerpt,
    readingTime,
  }
}
