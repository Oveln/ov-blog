<script lang="ts">
	import SourceEditor from "$lib/components/editor/SourceEditor.svelte"
	import EditorToolbar from "$lib/components/editor/EditorToolbar.svelte"
	import { serializeFrontmatter } from "$lib/content"
	import { parseFrontmatter } from "$lib/content/parser"
	import { page } from "$app/stores"

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
	let fromVersionLoaded = $state(false)
	let parentVersion = $state<number | null>(null)

	$effect(() => {
		const fromVersion = $page.url.searchParams.get("fromVersion")
		if (fromVersion && !fromVersionLoaded) {
			fromVersionLoaded = true
			parentVersion = parseInt(fromVersion, 10)
			fetch(`/api/versions?slug=${encodeURIComponent(slug)}&version=${fromVersion}`)
				.then((r) => r.json())
				.then((result) => {
					if (result.content) {
						const parsed = parseFrontmatter(result.content)
						title = parsed.frontmatter.title ?? title
						description = parsed.frontmatter.description ?? description
						tags = (parsed.frontmatter.tags ?? []).join(", ") || tags
						published = parsed.frontmatter.published ?? published
						markdown = parsed.content
						message = `已加载 v${fromVersion} 的内容`
					}
				})
				.catch(() => {
					message = "加载版本内容失败"
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
			createdAt: createdAt || now,
			updatedAt: now,
		})

		try {
			const body: Record<string, unknown> = { slug, raw: frontmatter + markdown }
			if (parentVersion !== null) {
				body.parent = parentVersion
			}
			const resp = await fetch("/api/posts", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			})
			const result = await resp.json()
			if (result.ok) {
				message = "保存成功"
				parentVersion = null
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
