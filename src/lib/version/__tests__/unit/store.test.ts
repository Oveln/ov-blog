import { describe, it, expect, beforeEach } from "vitest"
import { VersionedStore } from "$lib/version/store"
import type { Storage } from "$lib/storage/interface"

class MemoryStorage implements Storage {
	private data = new Map<string, string>()

	async read(key: string): Promise<string | null> {
		return this.data.get(key) ?? null
	}
	async write(key: string, data: string): Promise<void> {
		this.data.set(key, data)
	}
	async delete(key: string): Promise<void> {
		this.data.delete(key)
	}
	async list(prefix: string): Promise<string[]> {
		const keys: string[] = []
		for (const key of this.data.keys()) {
			if (key === prefix || key.startsWith(prefix + "/")) {
				keys.push(key)
			}
		}
		return keys.sort()
	}
	async exists(key: string): Promise<boolean> {
		return this.data.has(key)
	}
}

describe("VersionedStore", () => {
	let storage: MemoryStorage
	let store: VersionedStore

	beforeEach(() => {
		storage = new MemoryStorage()
		store = new VersionedStore(storage, { snapshotInterval: 3 })
	})

	describe("commit", () => {
		it("creates first version as full snapshot", async () => {
			const meta = await store.commit("doc1", "hello world")
			expect(meta.version).toBe(1)
			expect(meta.type).toBe("full")
			expect(meta.parent).toBeNull()
			expect(meta.createdAt).toBeTruthy()
		})

		it("stores current.md on first commit", async () => {
			await store.commit("doc1", "hello world")
			const current = await storage.read("versions/doc1/current.md")
			expect(current).toBe("hello world")
		})

		it("stores v1.full.md on first commit", async () => {
			await store.commit("doc1", "hello world")
			const full = await storage.read("versions/doc1/v1.full.md")
			expect(full).toBe("hello world")
		})

		it("creates patch for subsequent changes", async () => {
			await store.commit("doc1", "hello")
			const meta = await store.commit("doc1", "hello world")
			expect(meta.version).toBe(2)
			expect(meta.type).toBe("patch")
			expect(meta.parent).toBe(1)
		})

		it("stores patch file with correct naming", async () => {
			await store.commit("doc1", "hello")
			await store.commit("doc1", "hello world")
			const patch = await storage.read("versions/doc1/v1-v2.patch")
			expect(patch).toBeTruthy()
			expect(patch).toContain("hello")
		})

		it("updates current.md on each commit", async () => {
			await store.commit("doc1", "v1")
			await store.commit("doc1", "v2")
			const current = await storage.read("versions/doc1/current.md")
			expect(current).toBe("v2")
		})

		it("creates full snapshot at interval", async () => {
			await store.commit("doc1", "v1")
			await store.commit("doc1", "v2 content")
			const v3 = await store.commit("doc1", "v3 content")
			expect(v3.type).toBe("full")
			expect(v3.version).toBe(3)

			const full = await storage.read("versions/doc1/v3.full.md")
			expect(full).toBe("v3 content")
		})

		it("skips commit when content is identical (no-op)", async () => {
			const v1 = await store.commit("doc1", "same content")
			const v2 = await store.commit("doc1", "same content")
			expect(v1.version).toBe(1)
			expect(v2.version).toBe(1)
			expect(v2).toEqual(v1)
		})

		it("accepts summary option", async () => {
			const meta = await store.commit("doc1", "hello", { summary: "initial" })
			expect(meta.summary).toBe("initial")
		})

		it("accepts parent option for branching", async () => {
			await store.commit("doc1", "original")
			await store.commit("doc1", "modified")

			const branch = await store.commit("doc1", "branched", { parent: 1 })
			expect(branch.version).toBe(3)
			expect(branch.parent).toBe(1)
		})

		it("maintains correct meta.json", async () => {
			await store.commit("doc1", "v1")
			await store.commit("doc1", "v2")
			const head = await store.head("doc1")
			expect(head).toBe(2)
			const log = await store.log("doc1")
			expect(log).toHaveLength(2)
			expect(log[0].version).toBe(1)
			expect(log[1].version).toBe(2)
		})

		it("increments lastVersion independently of currentVersion", async () => {
			await store.commit("doc1", "v1")
			await store.commit("doc1", "v2")

			const raw = await storage.read("versions/doc1/meta.json")
			const meta = JSON.parse(raw!)
			expect(meta.currentVersion).toBe(2)
			expect(meta.lastVersion).toBe(2)
		})
	})

	describe("get", () => {
		it("returns current version content via current.md (O(1))", async () => {
			await store.commit("doc1", "v1")
			await store.commit("doc1", "v2")
			const content = await store.get("doc1", 2)
			expect(content).toBe("v2")
		})

		it("returns null for non-existent doc", async () => {
			const result = await store.get("nonexistent", 1)
			expect(result).toBeNull()
		})

		it("returns null for non-existent version", async () => {
			await store.commit("doc1", "v1")
			const result = await store.get("doc1", 99)
			expect(result).toBeNull()
		})

		it("restores full snapshot directly", async () => {
			await store.commit("doc1", "v1")
			const content = await store.get("doc1", 1)
			expect(content).toBe("v1")
		})

		it("restores patch version via patch chain", async () => {
			await store.commit("doc1", "v1")
			await store.commit("doc1", "v1\nv2")
			const content = await store.get("doc1", 2)
			expect(content).toBe("v1\nv2")
		})

		it("restores multi-step patch chain", async () => {
			await store.commit("doc1", "a")
			await store.commit("doc1", "a\nb")
			await store.commit("doc1", "a\nb\nc")
			const v3 = await store.get("doc1", 3)
			expect(v3).toBe("a\nb\nc")
			const v2 = await store.get("doc1", 2)
			expect(v2).toBe("a\nb")
		})

		it("restores version after snapshot interval resets chain", async () => {
			store = new VersionedStore(storage, { snapshotInterval: 3 })

			await store.commit("doc1", "v1")
			await store.commit("doc1", "v1\nv2")
			await store.commit("doc1", "v1\nv2\nv3")
			await store.commit("doc1", "v1\nv2\nv3\nv4")

			const v4 = await store.get("doc1", 4)
			expect(v4).toBe("v1\nv2\nv3\nv4")

			const v2 = await store.get("doc1", 2)
			expect(v2).toBe("v1\nv2")
		})

		it("returns current.md after switchTo", async () => {
			await store.commit("doc1", "v1")
			await store.commit("doc1", "v2")
			await store.switchTo("doc1", 1)
			const content = await store.get("doc1", 1)
			expect(content).toBe("v1")
		})
	})

	describe("log", () => {
		it("returns empty array for non-existent doc", async () => {
			const log = await store.log("nonexistent")
			expect(log).toEqual([])
		})

		it("returns all version metadata", async () => {
			await store.commit("doc1", "v1", { summary: "first" })
			await store.commit("doc1", "v2", { summary: "second" })
			const log = await store.log("doc1")
			expect(log).toHaveLength(2)
			expect(log[0].version).toBe(1)
			expect(log[0].summary).toBe("first")
			expect(log[1].version).toBe(2)
			expect(log[1].summary).toBe("second")
		})
	})

	describe("head", () => {
		it("returns null for non-existent doc", async () => {
			const head = await store.head("nonexistent")
			expect(head).toBeNull()
		})

		it("returns current version number", async () => {
			await store.commit("doc1", "v1")
			await store.commit("doc1", "v2")
			await store.commit("doc1", "v3")
			expect(await store.head("doc1")).toBe(3)
		})

		it("returns switched version after switchTo", async () => {
			await store.commit("doc1", "v1")
			await store.commit("doc1", "v2")
			await store.switchTo("doc1", 1)
			expect(await store.head("doc1")).toBe(1)
		})
	})

	describe("switchTo", () => {
		it("switches currentVersion pointer to target version", async () => {
			await store.commit("doc1", "v1")
			await store.commit("doc1", "v2")

			const result = await store.switchTo("doc1", 1)
			expect(result.version).toBe(1)

			const head = await store.head("doc1")
			expect(head).toBe(1)
		})

		it("updates current.md to target version content", async () => {
			await store.commit("doc1", "original")
			await store.commit("doc1", "modified")

			await store.switchTo("doc1", 1)

			const current = await storage.read("versions/doc1/current.md")
			expect(current).toBe("original")
		})

		it("does not create new version nodes", async () => {
			await store.commit("doc1", "v1")
			await store.commit("doc1", "v2")

			await store.switchTo("doc1", 1)

			const log = await store.log("doc1")
			expect(log).toHaveLength(2)
		})

		it("does not change lastVersion", async () => {
			await store.commit("doc1", "v1")
			await store.commit("doc1", "v2")

			await store.switchTo("doc1", 1)

			const raw = await storage.read("versions/doc1/meta.json")
			const meta = JSON.parse(raw!)
			expect(meta.lastVersion).toBe(2)
			expect(meta.currentVersion).toBe(1)
		})

		it("commit after switchTo uses lastVersion for new version number", async () => {
			await store.commit("doc1", "v1")
			await store.commit("doc1", "v2")
			await store.switchTo("doc1", 1)

			const v3 = await store.commit("doc1", "v3 (edit from v1)", { parent: 1 })
			expect(v3.version).toBe(3)
			expect(v3.parent).toBe(1)
		})

		it("switches to current version is no-op", async () => {
			await store.commit("doc1", "v1")
			const result = await store.switchTo("doc1", 1)
			expect(result.version).toBe(1)
			expect(await store.head("doc1")).toBe(1)
		})

		it("throws for non-existent version", async () => {
			await store.commit("doc1", "v1")
			await expect(store.switchTo("doc1", 99)).rejects.toThrow()
		})

		it("throws for non-existent doc", async () => {
			await expect(store.switchTo("nonexistent", 1)).rejects.toThrow()
		})
	})

	describe("destroy", () => {
		it("removes all version data for a doc", async () => {
			await store.commit("doc1", "v1")
			await store.commit("doc1", "v2")
			await store.destroy("doc1")
			const log = await store.log("doc1")
			expect(log).toEqual([])
			expect(await store.head("doc1")).toBeNull()
		})

		it("does not affect other docs", async () => {
			await store.commit("doc1", "v1")
			await store.commit("doc2", "other")
			await store.destroy("doc1")
			expect(await store.head("doc2")).toBe(1)
		})

		it("is idempotent", async () => {
			await store.commit("doc1", "v1")
			await store.destroy("doc1")
			await store.destroy("doc1")
			expect(await store.log("doc1")).toEqual([])
		})
	})

	describe("snapshot interval", () => {
		it("creates full at every interval and patch otherwise", async () => {
			store = new VersionedStore(storage, { snapshotInterval: 3 })

			const v1 = await store.commit("doc1", "a")
			const v2 = await store.commit("doc1", "a\nb")
			const v3 = await store.commit("doc1", "a\nb\nc")
			const v4 = await store.commit("doc1", "a\nb\nc\nd")
			const v5 = await store.commit("doc1", "a\nb\nc\nd\ne")
			const v6 = await store.commit("doc1", "a\nb\nc\nd\ne\nf")

			expect(v1.type).toBe("full")
			expect(v2.type).toBe("patch")
			expect(v3.type).toBe("full")
			expect(v4.type).toBe("patch")
			expect(v5.type).toBe("patch")
			expect(v6.type).toBe("full")
		})
	})

	describe("branching", () => {
		it("supports branching from a parent version", async () => {
			await store.commit("doc1", "original")
			await store.commit("doc1", "modified")

			const branch = await store.commit("doc1", "branched", { parent: 1 })
			expect(branch.version).toBe(3)
			expect(branch.parent).toBe(1)

			const content = await store.get("doc1", 3)
			expect(content).toBe("branched")
		})

		it("can restore branched version", async () => {
			await store.commit("doc1", "original")
			await store.commit("doc1", "modified")
			await store.commit("doc1", "branched", { parent: 1 })

			const v3 = await store.get("doc1", 3)
			expect(v3).toBe("branched")

			const v2 = await store.get("doc1", 2)
			expect(v2).toBe("modified")
		})

		it("commit after switchTo creates branch from specified parent", async () => {
			await store.commit("doc1", "v1")
			await store.commit("doc1", "v2")
			await store.switchTo("doc1", 1)

			const v3 = await store.commit("doc1", "new from v1", { parent: 1 })
			expect(v3.parent).toBe(1)

			const content = await store.get("doc1", 3)
			expect(content).toBe("new from v1")

			const current = await store.get("doc1", (await store.head("doc1")) as number)
			expect(current).toBe("new from v1")
		})
	})

	describe("Chinese content support", () => {
		it("handles Chinese content across versions", async () => {
			await store.commit("doc1", "# 你好\n世界")
			await store.commit("doc1", "# 你好\n宇宙")
			const content = await store.get("doc1", 2)
			expect(content).toBe("# 你好\n宇宙")
		})

		it("handles switchTo with Chinese content", async () => {
			await store.commit("doc1", "# 第一版\n中文内容")
			await store.commit("doc1", "# 第二版\n更多内容")
			await store.switchTo("doc1", 1)
			const current = await store.get("doc1", (await store.head("doc1")) as number)
			expect(current).toBe("# 第一版\n中文内容")
		})
	})
})