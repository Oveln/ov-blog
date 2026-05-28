import matter from "gray-matter"
import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import type { PostFrontmatter, PostMeta } from "./schema"

export interface ParsedPost {
  meta: PostMeta
  raw: string
  content: string
  frontmatter: PostFrontmatter
}

function stringifyDates(data: Record<string, unknown>): void {
  for (const key of ["createdAt", "updatedAt"]) {
    const val = data[key]
    if (val instanceof Date) {
      data[key] = val.toISOString().slice(0, 10)
    }
  }
}

export function parseFrontmatter(raw: string): ParsedPost {
  const { data, content } = matter(raw)
  stringifyDates(data as Record<string, unknown>)
  const frontmatter = {
    title: data.title ?? "",
    description: data.description ?? "",
    tags: data.tags ?? [],
    published: data.published ?? false,
    createdAt: data.createdAt ?? "",
    updatedAt: data.updatedAt,
  } as PostFrontmatter
  return {
    meta: { ...frontmatter, slug: "" },
    raw,
    content,
    frontmatter,
  }
}

export async function parseToMdast(content: string) {
  const processor = unified()
    .use(remarkParse)
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkMath)
  return processor.parse(content)
}
