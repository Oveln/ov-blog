import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { mkdtemp, rm } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { LocalStorage } from "$lib/storage/local"

describe("LocalStorage", () => {
	let storage: LocalStorage
	let tempDir: string

	beforeEach(async () => {
		tempDir = await mkdtemp(join(tmpdir(), "storage-test-"))
		storage = new LocalStorage({ baseDir: tempDir })
	})

	afterEach(async () => {
		await rm(tempDir, { recursive: true, force: true })
	})

	describe("write + read", () => {
		it("写入后可以读取", async () => {
			await storage.write("posts/hello.md", "# Hello")
			const content = await storage.read("posts/hello.md")
			expect(content).toBe("# Hello")
		})

		it("读取不存在的文件返回 null", async () => {
			const content = await storage.read("nonexistent.md")
			expect(content).toBeNull()
		})

		it("覆盖已有文件", async () => {
			await storage.write("test.md", "v1")
			await storage.write("test.md", "v2")
			const content = await storage.read("test.md")
			expect(content).toBe("v2")
		})

		it("自动创建中间目录", async () => {
			await storage.write("a/b/c/deep.md", "deep")
			const content = await storage.read("a/b/c/deep.md")
			expect(content).toBe("deep")
		})
	})

	describe("delete", () => {
		it("删除已有文件", async () => {
			await storage.write("del.md", "bye")
			await storage.delete("del.md")
			const content = await storage.read("del.md")
			expect(content).toBeNull()
		})

		it("删除不存在的文件不报错", async () => {
			await expect(storage.delete("ghost.md")).resolves.toBeUndefined()
		})
	})

	describe("exists", () => {
		it("存在的文件返回 true", async () => {
			await storage.write("exists.md", "yes")
			expect(await storage.exists("exists.md")).toBe(true)
		})

		it("不存在的文件返回 false", async () => {
			expect(await storage.exists("nope.md")).toBe(false)
		})
	})

	describe("list", () => {
		it("列出目录下所有文件", async () => {
			await storage.write("posts/a.md", "a")
			await storage.write("posts/b.md", "b")
			await storage.write("posts/sub/c.md", "c")
			const keys = await storage.list("posts")
			expect(keys.sort()).toEqual(["posts/a.md", "posts/b.md", "posts/sub/c.md"])
		})

		it("不存在的目录返回空数组", async () => {
			const keys = await storage.list("empty")
			expect(keys).toEqual([])
		})

		it("只列出不包含子目录前缀的文件", async () => {
			await storage.write("x.md", "x")
			await storage.write("posts/x.md", "px")
			const keys = await storage.list("posts")
			expect(keys).toEqual(["posts/x.md"])
		})
	})
})
