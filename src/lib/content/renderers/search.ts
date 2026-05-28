import type { PostMeta, TocItem } from "../schema"

export interface SearchEntry {
  slug: string
  title: string
  description: string
  tags: string[]
  headings: string[]
}

export function buildSearchEntry(
  meta: PostMeta,
  toc: TocItem[]
): SearchEntry {
  return {
    slug: meta.slug,
    title: meta.title,
    description: meta.description,
    tags: meta.tags,
    headings: toc.map((t) => t.text),
  }
}
