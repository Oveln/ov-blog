import type { PostContent, PostSummary } from "./schema"
import { parseFrontmatter, parseToMdast } from "./parser"
import { extractToc } from "./transforms/toc"
import { extractExcerpt } from "./transforms/excerpt"
import { calculateReadingTime } from "./transforms/reading-time"
import { renderHtml } from "./renderers/html"

export async function processPost(slug: string, raw: string): Promise<PostContent> {
  const parsed = parseFrontmatter(raw)
  parsed.meta.slug = slug

  const tree = await parseToMdast(parsed.content)

  const [toc, html] = await Promise.all([
    extractToc(tree),
    renderHtml(tree),
  ])
  const excerpt = extractExcerpt(tree)
  const readingTime = calculateReadingTime(tree)

  return {
    ...parsed.meta,
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
): Promise<PostSummary> {
  const parsed = parseFrontmatter(raw)
  parsed.meta.slug = slug

  const tree = await parseToMdast(parsed.content)
  const excerpt = extractExcerpt(tree)
  const readingTime = calculateReadingTime(tree)

  return {
    ...parsed.meta,
    excerpt,
    readingTime,
  }
}
