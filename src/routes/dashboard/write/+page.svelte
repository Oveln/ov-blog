<script lang="ts">
	import SourceEditor from "$lib/components/editor/SourceEditor.svelte"
	import { Button } from "$lib/components/ui/button"
	import { Badge } from "$lib/components/ui/badge"

	let title = $state("")
	let slug = $state("")
	let description = $state("")
	let tags = $state("")
	let published = $state(false)
	let markdown = $state("")
	let saving = $state(false)
	let message = $state("")

	let tagList = $derived(
		tags
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean),
	)

	$effect(() => {
		if (title && !slug) {
			slug = title
				.toLowerCase()
				.replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
				.replace(/^-|-$/g, "")
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
		const frontmatter = [
			"---",
			`title: "${title.replace(/"/g, '\\"')}"`,
			`description: "${description.replace(/"/g, '\\"')}"`,
			`tags:`,
			...tagList.map((t) => `  - "${t}"`),
			`published: ${published}`,
			`createdAt: "${now}"`,
			"---",
			"",
		].join("\n")

		try {
			const resp = await fetch("/api/posts", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ slug, raw: frontmatter + markdown }),
			})
			const data = await resp.json()
			message = data.ok ? "保存成功" : (data.error ?? "保存失败")
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

<div class="flex flex-col gap-3 h-full">
	<div class="flex items-center gap-3">
		<input
			type="text"
			placeholder="文章标题"
			bind:value={title}
			class="flex-1 text-2xl font-mono font-bold bg-transparent outline-none placeholder:text-muted-foreground/40"
		/>
		<div class="flex items-center gap-2 shrink-0">
			{#if message}
				<span class="text-xs font-mono text-muted-foreground">{message}</span>
			{/if}
			<Button size="sm" onclick={handleSave} disabled={saving}>
				<span class="font-mono">{saving ? "保存中..." : "保存"}</span>
			</Button>
		</div>
	</div>

	<div class="flex items-center gap-2 flex-wrap">
		<span class="px-2 py-1 text-xs font-mono bg-muted/50 rounded text-muted-foreground">{slug || "auto-slug"}</span>
		<input
			type="text"
			placeholder="描述"
			bind:value={description}
			class="flex-1 min-w-[120px] px-2 py-1 text-xs font-mono bg-muted/50 rounded outline-none placeholder:text-muted-foreground/50"
		/>
		<input
			type="text"
			placeholder="标签 (逗号分隔)"
			bind:value={tags}
			class="w-48 px-2 py-1 text-xs font-mono bg-muted/50 rounded outline-none placeholder:text-muted-foreground/50"
		/>
		{#each tagList as tag}
			<Badge variant="secondary" class="text-[10px]">{tag}</Badge>
		{/each}
		<button
			type="button"
			onclick={() => (published = !published)}
			class="flex items-center gap-1 px-2 py-1 text-xs font-mono rounded cursor-pointer select-none transition-colors {published ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'}"
		>
			{published ? "已发布" : "草稿"}
		</button>
	</div>

	<SourceEditor bind:source={markdown} />
</div>
