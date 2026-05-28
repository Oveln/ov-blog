<script lang="ts">
	import { Button } from "$lib/components/ui/button"
	import { Badge } from "$lib/components/ui/badge"
	import { ArrowLeft } from "lucide-svelte"

	let {
		slug,
		title = $bindable(""),
		description = $bindable(""),
		tags = $bindable(""),
		published = $bindable(false),
		createdAt = "",
		saving = $bindable(false),
		message = $bindable(""),
		onSave,
	}: {
		slug: string
		title: string
		description: string
		tags: string
		published: boolean
		createdAt?: string
		saving: boolean
		message: string
		onSave: () => Promise<void>
	} = $props()

	let tagList = $derived(
		tags
			.split(",")
			.map((t) => t.trim())
			.filter(Boolean),
	)
</script>

<div class="flex flex-col gap-3">
	<div class="flex items-center gap-3">
		<a href="/dashboard" class="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
			<ArrowLeft size={20} />
		</a>
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
			<Button size="sm" onclick={onSave} disabled={saving}>
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
		{#if createdAt}
			<span class="text-[10px] font-mono text-muted-foreground/60">{createdAt}</span>
		{/if}
	</div>
</div>
