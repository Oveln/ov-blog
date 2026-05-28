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

export function parseFrontmatter(raw: string): ParsedPost {
  const { data, content } = matter(raw)
  const frontmatter = data as PostFrontmatter
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
