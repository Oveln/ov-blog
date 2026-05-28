<script lang="ts">
	import SourceEditor from "$lib/components/editor/SourceEditor.svelte"
	import EditorToolbar from "$lib/components/editor/EditorToolbar.svelte"
	import { serializeFrontmatter } from "$lib/content"

	let { data } = $props()

	let slug = $derived(data.slug)
	let title = $state(data.title)
	let description = $state(data.description)
	let tags = $state(data.tags)
	let published = $state(data.published)
	let createdAt = $derived(data.createdAt)
	let markdown = $state(data.content)
	let saving = $state(false)
	let message = $state("")

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
			published,
			createdAt: createdAt || now,
			updatedAt: now,
		})

		try {
			const resp = await fetch("/api/posts", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ slug, raw: frontmatter + markdown }),
			})
			const result = await resp.json()
			message = result.ok ? "保存成功" : (result.error ?? "保存失败")
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
		bind:title
		bind:description
		bind:tags
		bind:published
		{createdAt}
		bind:saving
		bind:message
		onSave={handleSave}
	/>

	<SourceEditor bind:source={markdown} />
</div>
