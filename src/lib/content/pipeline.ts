import type { PostContent, PostSummary } from "./schema"
import { parseFrontmatter, parseToMdast } from "./parser"
import { extractToc } from "./transforms/toc"
import { extractExcerpt } from "./transforms/excerpt"
import { calculateReadingTime } from "./transforms/reading-time"
import { renderHtml } from "./renderers/html"

export async function processPost(
  slug: string,
  raw: string,
  published?: boolean
): Promise<PostContent> {
  const parsed = parseFrontmatter(raw)
  parsed.meta.slug = slug
  if (published !== undefined) {
    parsed.meta.published = published
  }

  const tree = await parseToMdast(parsed.content)

  const toc = extractToc(tree)
  const excerpt = extractExcerpt(tree)
  const readingTime = calculateReadingTime(tree)
  const html = await renderHtml(tree)

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
  raw: string,
  published?: boolean
): Promise<PostSummary> {
  const parsed = parseFrontmatter(raw)
  parsed.meta.slug = slug
  if (published !== undefined) {
    parsed.meta.published = published
  }

  const tree = await parseToMdast(parsed.content)
  const excerpt = extractExcerpt(tree)
  const readingTime = calculateReadingTime(tree)

  return {
    ...parsed.meta,
    excerpt,
    readingTime,
  }
}
