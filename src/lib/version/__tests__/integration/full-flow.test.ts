import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { join } from "node:path"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { LocalStorage } from "$lib/storage/local"
import type { Storage } from "$lib/storage/interface"
import { VersionedStore } from "$lib/version/store"

describe("VersionedStore — 集成测试 (LocalStorage)", () => {
	let storage: Storage
	let store: VersionedStore
	let tempDir: string

	beforeEach(() => {
		tempDir = mkdtempSync(join(tmpdir(), "version-integration-"))
		storage = new LocalStorage({ baseDir: tempDir })
		store = new VersionedStore(storage, { snapshotInterval: 3 })
	})

	afterEach(() => {
		rmSync(tempDir, { recursive: true, force: true })
	})

	it("完整生命周期：创建 → 多次修改 → 还原 → switchTo", async () => {
		const v1 = await store.commit("post-1", "---\ntitle: Hello\n---\n\nFirst version.")
		expect(v1.version).toBe(1)
		expect(v1.type).toBe("full")

		const v2 = await store.commit("post-1", "---\ntitle: Hello\n---\n\nSecond version.", {
			summary: "增加内容",
		})
		expect(v2.version).toBe(2)
		expect(v2.type).toBe("patch")

		const v3 = await store.commit("post-1", "---\ntitle: Hello\n---\n\nThird version.")
		expect(v3.type).toBe("full")

		const v4 = await store.commit("post-1", "---\ntitle: Hello\n---\n\nFourth version.")
		expect(v4.type).toBe("patch")

		expect(await store.head("post-1")).toBe(4)

		expect(await store.get("post-1", 4)).toBe("---\ntitle: Hello\n---\n\nFourth version.")
		expect(await store.get("post-1", 3)).toBe("---\ntitle: Hello\n---\n\nThird version.")
		expect(await store.get("post-1", 2)).toBe("---\ntitle: Hello\n---\n\nSecond version.")
		expect(await store.get("post-1", 1)).toBe("---\ntitle: Hello\n---\n\nFirst version.")

		const rolled = await store.switchTo("post-1", 1)
		expect(rolled.version).toBe(1)
		expect(await store.head("post-1")).toBe(1)

		const current = await store.get("post-1", (await store.head("post-1")) as number)
		expect(current).toBe("---\ntitle: Hello\n---\n\nFirst version.")

		const v5 = await store.commit("post-1", "---\ntitle: Hello\n---\n\nNew from v1.", {
			parent: 1,
		})
		expect(v5.version).toBe(5)
		expect(v5.parent).toBe(1)
	})

	it("switchTo 不创建新版本，只改指针", async () => {
		await store.commit("post-a", "A v1")
		await store.commit("post-a", "A v2")

		const logBefore = await store.log("post-a")
		expect(logBefore).toHaveLength(2)

		await store.switchTo("post-a", 1)

		const logAfter = await store.log("post-a")
		expect(logAfter).toHaveLength(2)

		const raw = await storage.read("versions/post-a/meta.json")
		const meta = JSON.parse(raw!)
		expect(meta.currentVersion).toBe(1)
		expect(meta.lastVersion).toBe(2)
	})

	it("多篇文章独立管理", async () => {
		await store.commit("post-a", "A v1")
		await store.commit("post-b", "B v1")
		await store.commit("post-a", "A v2")
		await store.commit("post-b", "B v2")

		expect(await store.head("post-a")).toBe(2)
		expect(await store.head("post-b")).toBe(2)

		const aLog = await store.log("post-a")
		const bLog = await store.log("post-b")
		expect(aLog).toHaveLength(2)
		expect(bLog).toHaveLength(2)

		expect(await store.get("post-a", 2)).toBe("A v2")
		expect(await store.get("post-b", 2)).toBe("B v2")
	})

	it("destroy 不影响其他文章", async () => {
		await store.commit("keep", "keep content")
		await store.commit("delete-me", "delete content")
		await store.destroy("delete-me")

		expect(await store.head("keep")).toBe(1)
		expect(await store.head("delete-me")).toBeNull()
		expect(await store.get("delete-me", 1)).toBeNull()
	})

	it("snapshot interval 正确生成 full 和 patch", async () => {
		for (let i = 1; i <= 7; i++) {
			await store.commit("doc", `version ${i}`)
		}

		const log = await store.log("doc")
		expect(log).toHaveLength(7)
		expect(log[0].type).toBe("full")
		expect(log[1].type).toBe("patch")
		expect(log[2].type).toBe("full")
		expect(log[3].type).toBe("patch")
		expect(log[4].type).toBe("patch")
		expect(log[5].type).toBe("full")
		expect(log[6].type).toBe("patch")
	})

	it("跨 snapshot 还原：从 v6 full 还原 v4 并回溯", async () => {
		for (let i = 1; i <= 7; i++) {
			await store.commit("doc", `content line ${i}`)
		}

		const v4 = await store.get("doc", 4)
		expect(v4).toBe("content line 4")

		const v7 = await store.get("doc", 7)
		expect(v7).toBe("content line 7")
	})

	it("分支场景：从 v1 创建分支", async () => {
		await store.commit("doc", "trunk v1")
		await store.commit("doc", "trunk v2")
		await store.commit("doc", "branch from v1", { parent: 1 })

		const trunk = await store.get("doc", 2)
		expect(trunk).toBe("trunk v2")

		const branch = await store.get("doc", 3)
		expect(branch).toBe("branch from v1")
	})

	it("中文内容完整流转", async () => {
		await store.commit("cn-doc", "# 第一篇文章\n\n这是中文内容。")
		await store.commit("cn-doc", "# 第一篇文章\n\n内容被修改了。")
		await store.commit("cn-doc", "# 第一篇文章\n\n再次更新内容。")

		const v3 = await store.get("cn-doc", 3)
		expect(v3).toBe("# 第一篇文章\n\n再次更新内容。")

		const v1 = await store.get("cn-doc", 1)
		expect(v1).toBe("# 第一篇文章\n\n这是中文内容。")

		await store.switchTo("cn-doc", 1)
		const current = await store.get("cn-doc", (await store.head("cn-doc")) as number)
		expect(current).toBe("# 第一篇文章\n\n这是中文内容。")
	})

	it("重建后可以继续 commit", async () => {
		await store.commit("doc", "v1")
		await store.destroy("doc")

		const v1New = await store.commit("doc", "fresh start")
		expect(v1New.version).toBe(1)
		expect(v1New.type).toBe("full")

		const v2 = await store.commit("doc", "fresh start v2")
		expect(v2.version).toBe(2)
	})

	it("switchTo 后 commit 创建分支", async () => {
		await store.commit("doc", "v1")
		await store.commit("doc", "v2")
		await store.commit("doc", "v3")

		await store.switchTo("doc", 1)

		const v4 = await store.commit("doc", "edit from v1", { parent: 1 })
		expect(v4.version).toBe(4)
		expect(v4.parent).toBe(1)

		await store.switchTo("doc", 2)
		const v5 = await store.commit("doc", "edit from v2", { parent: 2 })
		expect(v5.version).toBe(5)
		expect(v5.parent).toBe(2)

		expect(await store.head("doc")).toBe(5)

		const v2Content = await store.get("doc", 2)
		expect(v2Content).toBe("v2")

		const v4Content = await store.get("doc", 4)
		expect(v4Content).toBe("edit from v1")

		const v5Content = await store.get("doc", 5)
		expect(v5Content).toBe("edit from v2")
	})
})