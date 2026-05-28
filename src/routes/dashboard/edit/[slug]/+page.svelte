<script lang="ts">
	import { onMount } from "svelte"
	import SourceEditor from "$lib/components/editor/SourceEditor.svelte"
	import { Button } from "$lib/components/ui/button"
	import { Input } from "$lib/components/ui/input"
	import { Badge } from "$lib/components/ui/badge"
	import { parseFrontmatter } from "$lib/content/parser"

	let { data } = $props()

	let slug = $derived(data.slug)
	let title = $state("")
	let description = $state("")
	let tags = $state("")
	let published = $state(false)
	let createdAt = $state("")
	let markdown = $state("")
	let saving = $state(false)
	let message = $state("")
	let showMeta = $state(false)

	let tagList = $derived(
		tags
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean),
	)

	onMount(() => {
		const parsed = parseFrontmatter(data.raw)
		title = parsed.frontmatter.title ?? ""
		description = parsed.frontmatter.description ?? ""
		tags = (parsed.frontmatter.tags ?? []).join(", ")
		published = parsed.frontmatter.published ?? false
		createdAt = parsed.frontmatter.createdAt ?? ""
		markdown = parsed.content
	})

	async function handleSave() {
		if (!slug) {
			message = "请填写 slug"
			return
		}

		saving = true
		message = ""

		const now = new Date().toISOString().slice(0, 10)
		const frontmatter = [
			"---",
			`title: "${title.replace(/"/g, '\\"')}"`,
			`description: "${description.replace(/"/g, '\\"')}"`,
			`tags:`,
			...tagList.map((t) => `  - "${t}"`),
			`published: ${published}`,
			`createdAt: "${createdAt || now}"`,
			`updatedAt: "${now}"`,
			"---",
			"",
		].join("\n")

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

<div class="flex flex-col gap-4 h-full">
	<div class="flex items-center justify-between">
		<div class="flex-1 min-w-0 mr-4">
			<input
				type="text"
				bind:value={title}
				class="w-full text-3xl font-mono font-bold bg-transparent outline-none placeholder:text-muted-foreground/40"
			/>
		</div>
		<div class="flex items-center gap-2 shrink-0">
			<Button variant="ghost" size="sm" onclick={() => (showMeta = !showMeta)}>
				<span class="font-mono text-sm">设置</span>
			</Button>
			<Button size="sm" onclick={handleSave} disabled={saving}>
				<span class="font-mono">{saving ? "保存中..." : "保存"}</span>
			</Button>
		</div>
	</div>

	{#if message}
		<div class="text-sm font-mono text-muted-foreground px-1">{message}</div>
	{/if}

	{#if showMeta}
		<div class="border rounded-lg p-4 space-y-4 bg-card">
			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-1">
					<label for="edit-slug" class="text-xs font-mono text-muted-foreground">Slug</label>
					<Input id="edit-slug" type="text" value={slug} disabled />
				</div>
				<div class="space-y-1">
					<label for="edit-desc" class="text-xs font-mono text-muted-foreground">描述</label>
					<Input id="edit-desc" type="text" placeholder="简短描述" bind:value={description} />
				</div>
			</div>
			<div class="flex items-end gap-6">
				<div class="flex-1 space-y-1">
					<label for="edit-tags" class="text-xs font-mono text-muted-foreground">标签</label>
					<Input id="edit-tags" type="text" placeholder="svelte, typescript" bind:value={tags} />
				</div>
				<label class="flex items-center gap-2 cursor-pointer pb-2">
					<input type="checkbox" bind:checked={published} class="rounded" />
					<span class="text-sm font-mono">发布</span>
				</label>
			</div>
			{#if tagList.length > 0}
				<div class="flex flex-wrap gap-1.5">
					{#each tagList as tag}
						<Badge variant="secondary" class="text-xs">{tag}</Badge>
					{/each}
				</div>
			{/if}
			<div class="text-xs font-mono text-muted-foreground">
				创建于 {createdAt}
			</div>
		</div>
	{/if}

	<SourceEditor bind:source={markdown} />
</div>
