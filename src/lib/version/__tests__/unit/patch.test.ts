import { describe, it, expect } from "vitest"
import { makePatch, applyPatchContent } from "$lib/version/patch"

describe("makePatch", () => {
	it("generates a unified diff between two strings", () => {
		const oldContent = "# Hello\nWorld"
		const newContent = "# Hello\nUniverse"
		const patch = makePatch("test", oldContent, newContent)
		expect(patch).toContain("test.md")
		expect(patch).toContain("-World")
		expect(patch).toContain("+Universe")
	})

	it("generates a diff header for identical content", () => {
		const content = "same content"
		const patch = makePatch("test", content, content)
		expect(patch).toContain("test.md")
		expect(patch.trim()).not.toBe("")
	})

	it("handles Chinese content", () => {
		const oldContent = "# 你好\n世界"
		const newContent = "# 你好\n宇宙"
		const patch = makePatch("cn-doc", oldContent, newContent)
		expect(patch).toContain("-世界")
		expect(patch).toContain("+宇宙")
	})

	it("handles multi-line changes", () => {
		const oldContent = ["line 1", "line 2", "line 3"].join("\n")
		const newContent = ["line 1", "line 2 modified", "line 3", "line 4"].join("\n")
		const patch = makePatch("multi", oldContent, newContent)
		expect(patch).toContain("-line 2")
		expect(patch).toContain("+line 2 modified")
		expect(patch).toContain("+line 4")
	})
})

describe("applyPatchContent", () => {
	it("applies a patch to restore new content", () => {
		const oldContent = "# Hello\nWorld"
		const newContent = "# Hello\nUniverse"
		const patch = makePatch("test", oldContent, newContent)
		const result = applyPatchContent(oldContent, patch)
		expect(result).toBe(newContent)
	})

	it("round-trips: makePatch then applyPatchContent", () => {
		const oldContent = "a\nb\nc"
		const newContent = "a\nB\nc\nd"
		const patch = makePatch("roundtrip", oldContent, newContent)
		expect(applyPatchContent(oldContent, patch)).toBe(newContent)
	})

	it("handles Chinese content round-trip", () => {
		const oldContent = "# 标题\n第一段\n第二段"
		const newContent = "# 新标题\n第一段\n第三段"
		const patch = makePatch("cn", oldContent, newContent)
		expect(applyPatchContent(oldContent, patch)).toBe(newContent)
	})

	it("returns original content on garbage patch", () => {
		const result = applyPatchContent("content", "not a valid patch")
		expect(result).toBe("content")
	})

	it("throws on patch that fails to apply", () => {
		const patch = makePatch("test", "old", "new")
		expect(() => applyPatchContent("completely different", patch)).toThrow()
	})

	it("handles empty-to-content patch", () => {
		const patch = makePatch("empty", "", "hello")
		expect(applyPatchContent("", patch)).toBe("hello")
	})

	it("handles content-to-empty patch", () => {
		const patch = makePatch("gone", "hello", "")
		expect(applyPatchContent("hello", patch)).toBe("")
	})

	it("handles long content", () => {
		const oldContent = "x".repeat(10_000)
		const newContent = "y".repeat(10_000)
		const patch = makePatch("long", oldContent, newContent)
		expect(applyPatchContent(oldContent, patch)).toBe(newContent)
	})
})