import { describe, it, expect } from "vitest"
import { isPublished, sortPostsByDate } from "$lib/content/schema"
import type { PostMeta } from "$lib/content/types/post"

function makePost(overrides: Partial<PostMeta> = {}): PostMeta {
  return {
    title: "Test",
    description: "desc",
    tags: [],
    published: true,
    createdAt: "2026-01-01",
    slug: "test",
    ...overrides,
  }
}

describe("isPublished", () => {
  it("published: true 返回 true", () => {
    expect(isPublished(makePost({ published: true }))).toBe(true)
  })

  it("published: false 返回 false", () => {
    expect(isPublished(makePost({ published: false }))).toBe(false)
  })
})

describe("sortPostsByDate", () => {
  it("按 createdAt 降序排列", () => {
    const posts = [
      makePost({ createdAt: "2026-01-01", slug: "a" }),
      makePost({ createdAt: "2026-06-15", slug: "b" }),
      makePost({ createdAt: "2026-03-10", slug: "c" }),
    ]
    const sorted = sortPostsByDate(posts)
    expect(sorted.map((p) => p.slug)).toEqual(["b", "c", "a"])
  })

  it("不修改原数组", () => {
    const posts = [
      makePost({ createdAt: "2026-01-01" }),
      makePost({ createdAt: "2026-06-15" }),
    ]
    const sorted = sortPostsByDate(posts)
    expect(posts[0].createdAt).toBe("2026-01-01")
    expect(sorted[0].createdAt).toBe("2026-06-15")
  })

  it("空数组返回空数组", () => {
    expect(sortPostsByDate([])).toEqual([])
  })

  it("单元素数组不变", () => {
    const posts = [makePost({ createdAt: "2026-01-01" })]
    expect(sortPostsByDate(posts)).toHaveLength(1)
  })
})
