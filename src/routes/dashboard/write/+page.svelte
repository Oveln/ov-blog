<script lang="ts">
	import SourceEditor from "$lib/components/editor/SourceEditor.svelte"
	import EditorToolbar from "$lib/components/editor/EditorToolbar.svelte"
	import { serializeFrontmatter } from "$lib/content"
	import { goto } from "$app/navigation"

	let title = $state("")
	let slug = $state("")
	let description = $state("")
	let tags = $state("")
	let published = $state(false)
	let markdown = $state("")
	let saving = $state(false)
	let message = $state("")
	let slugLoaded = $state(false)

	$effect(() => {
		if (!slugLoaded) {
			fetch("/api/posts/next-id")
				.then((r) => r.json())
				.then((data) => {
					if (data.nextId) {
						slug = String(data.nextId)
					}
				})
				.finally(() => {
					slugLoaded = true
				})
		}
	})

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
			createdAt: now,
		})

		try {
			const resp = await fetch("/api/posts", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ slug, raw: frontmatter + markdown }),
			})
			const data = await resp.json()
			if (data.ok) {
				message = "保存成功"
				goto(`/dashboard/edit/${slug}`)
			} else {
				message = data.error ?? "保存失败"
			}
		} catch {
			message = "网络错误"
		} finally {
			saving = false
		}
	}
</script>

<svelte:head>
	<title>写文章 - Dashboard - Oveln Blog</title>
</svelte:head>

<div class="flex flex-col gap-3 flex-1 min-h-0">
	<EditorToolbar
		{slug}
		bind:title
		bind:description
		bind:tags
		bind:published
		bind:saving
		bind:message
		onSave={handleSave}
	/>

	<SourceEditor bind:source={markdown} />
</div>
