<script lang="ts">
	import SourceEditor from "$lib/components/editor/SourceEditor.svelte"
	import EditorToolbar from "$lib/components/editor/EditorToolbar.svelte"
	import { serializeFrontmatter } from "$lib/content"
	import { goto } from "$app/navigation"
	import { page } from "$app/stores"

	let { data } = $props()

	let slug = $derived(data.slug)
	let createdAt = $derived(data.createdAt)

	let title = $state(data.title)
	let description = $state(data.description)
	let tags = $state(data.tags)
	let markdown = $state(data.content)
	let saving = $state(false)
	let message = $state(data.fromVersion ? `已加载 v${data.fromVersion} 的内容` : "")
	let summary = $state("")
	let parentVersion = $state<number | null>(data.fromVersion)

	let backHref = $derived(
		data.from === "versions"
			? `/dashboard/versions/${slug}`
			: "/dashboard",
	)

	async function handleSave() {
		if (!slug) {
			message = "请填写 slug"
			return
		}

		saving = true
		message = ""

		const now = new Date().toISOString().slice(0, 10)
		const frontmatter = serializeFrontmatter({
			title,
			description,
			tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
			createdAt: createdAt || now,
			updatedAt: now,
		})

		try {
			const body: Record<string, unknown> = { slug, raw: frontmatter + markdown }
			if (parentVersion !== null) {
				body.parent = parentVersion
			}
			if (summary.trim()) {
				body.summary = summary.trim()
			}
			const resp = await fetch("/api/posts", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			})
			const result = await resp.json()
			if (result.ok) {
				parentVersion = null
				summary = ""
				const v = result.version
				const vInfo = v ? `v${v.version}` + (v.parent ? ` (基于 v${v.parent})` : "") : ""
				message = vInfo ? `已保存 ${vInfo}` : "保存成功"
				if ($page.url.searchParams.has("fromVersion")) {
					goto(`/dashboard/edit/${slug}`, { replaceState: true })
				}
			} else {
				message = result.error ?? "保存失败"
			}
		} catch {
			message = "网络错误"
		} finally {
			saving = false
		}
	}
</script>

<svelte:head>
	<title>编辑: {title} - Dashboard - Oveln Blog</title>
</svelte:head>

<div class="flex flex-col gap-3 flex-1 min-h-0">
	<EditorToolbar
		{slug}
		{backHref}
		bind:title
		bind:description
		bind:tags
		{createdAt}
		bind:saving
		bind:message
		bind:summary
		onSave={handleSave}
	/>

	<SourceEditor bind:source={markdown} />
</div>
