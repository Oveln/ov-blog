<script lang="ts">
	import SourceEditor from "$lib/components/editor/SourceEditor.svelte"
	import EditorToolbar from "$lib/components/editor/EditorToolbar.svelte"
	import { serializeFrontmatter } from "$lib/content"

	let { data } = $props()

	const d = () => data
	let slug = $derived(d().slug)
	let createdAt = $derived(d().createdAt)

	let title = $state(d().title)
	let description = $state(d().description)
	let tags = $state(d().tags)
	let published = $state(d().published)
	let markdown = $state(d().content)
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
