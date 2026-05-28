import { describe, it, expect, beforeEach, afterEach } from "vitest"
import type { Storage } from "$lib/storage/interface"

export function runStorageContractTests(
	name: string,
	createStorage: () => Promise<Storage>,
	cleanup?: () => Promise<void>,
) {
	describe(`${name} — Storage 合约`, () => {
		let storage: Storage

		beforeEach(async () => {
			storage = await createStorage()
		})

		afterEach(async () => {
			await cleanup?.()
		})

		it("read 不存在的 key 返回 null", async () => {
			expect(await storage.read("nonexistent.md")).toBeNull()
		})

		it("write → read 往返", async () => {
			await storage.write("test.md", "hello world")
			expect(await storage.read("test.md")).toBe("hello world")
		})

		it("write 覆盖", async () => {
			await storage.write("test.md", "v1")
			await storage.write("test.md", "v2")
			expect(await storage.read("test.md")).toBe("v2")
		})

		it("delete 后 read 返回 null", async () => {
			await storage.write("del.md", "bye")
			await storage.delete("del.md")
			expect(await storage.read("del.md")).toBeNull()
		})

		it("delete 不存在的 key 不报错", async () => {
			await expect(storage.delete("ghost.md")).resolves.toBeUndefined()
		})

		it("exists 对已有文件返回 true", async () => {
			await storage.write("exists.md", "yes")
			expect(await storage.exists("exists.md")).toBe(true)
		})

		it("exists 对不存在文件返回 false", async () => {
			expect(await storage.exists("nope.md")).toBe(false)
		})

		it("list 返回匹配前缀的文件", async () => {
			await storage.write("posts/a.md", "a")
			await storage.write("posts/b.md", "b")
			const keys = await storage.list("posts")
			expect(keys.sort()).toEqual(["posts/a.md", "posts/b.md"])
		})

		it("list 不存在的前缀返回空数组", async () => {
			expect(await storage.list("empty")).toEqual([])
		})

		it("支持中文内容", async () => {
			await storage.write("中文.md", "# 你好世界\n这是中文内容")
			expect(await storage.read("中文.md")).toBe("# 你好世界\n这是中文内容")
		})

		it("支持长内容", async () => {
			const longContent = "x".repeat(100_000)
			await storage.write("long.md", longContent)
			expect(await storage.read("long.md")).toBe(longContent)
		})

		it("支持空内容", async () => {
			await storage.write("empty.md", "")
			expect(await storage.read("empty.md")).toBe("")
		})
	})
}
