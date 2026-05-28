export interface PostFrontmatter {
  title: string
  description: string
  tags: string[]
  published: boolean
  createdAt: string
  updatedAt?: string
}

export interface PostMeta extends PostFrontmatter {
  slug: string
}

export interface TocItem {
  depth: number
  text: string
  id: string
}

export interface PostContent extends PostMeta {
  raw: string
  html: string
  toc: TocItem[]
  excerpt: string
  readingTime: number
}

export interface PostSummary extends PostMeta {
  excerpt: string
  readingTime: number
}

export function sortPostsByDate<T extends PostMeta>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}
