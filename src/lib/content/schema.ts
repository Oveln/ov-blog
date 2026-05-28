import type { PostFrontmatter, PostMeta, PostContent, PostSummary, TocItem } from "./types/post"

export type { PostFrontmatter, PostMeta, PostContent, PostSummary, TocItem }

export interface PipelineResult {
  meta: PostMeta
  raw: string
  html: string
  toc: TocItem[]
  excerpt: string
  readingTime: number
}

export function isPublished(post: PostMeta): boolean {
  return post.published
}

export function sortPostsByDate(posts: PostMeta[]): PostMeta[] {
  return [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}
