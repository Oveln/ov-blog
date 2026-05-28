<script lang="ts">
	import type { PostSummary } from "$lib/content"
	import { Badge } from "$lib/components/ui/badge"

	let { data } = $props()
	let posts: PostSummary[] = $derived(data.posts)
</script>

<svelte:head>
	<title>Dashboard - Oveln Blog</title>
</svelte:head>

<div class="space-y-4">
	{#if posts.length === 0}
		<div class="text-center text-muted-foreground py-12">
			暂无文章，点击右上角新建
		</div>
	{/if}

	{#each posts as post}
		<div class="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-2">
					<h3 class="font-mono font-medium truncate">{post.title}</h3>
					{#if !post.published}
						<Badge variant="outline" class="text-[10px] shrink-0">草稿</Badge>
					{/if}
				</div>
				<div class="flex items-center gap-2 text-sm text-muted-foreground mt-1">
					<span>{post.createdAt}</span>
					<span>·</span>
					<span>{post.readingTime} min</span>
					{#if post.tags.length > 0}
						<span>·</span>
						<div class="flex gap-1">
							{#each post.tags as tag}
								<span class="text-xs px-1.5 py-0.5 rounded bg-secondary">{tag}</span>
							{/each}
						</div>
					{/if}
				</div>
			</div>
			<div class="flex items-center gap-2 ml-4">
				{#if post.published}
					<a
						href="/blogs/{post.slug}"
						class="text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						查看
					</a>
				{/if}
				<a
					href="/dashboard/edit/{post.slug}"
					class="text-sm text-primary hover:text-primary/80 transition-colors font-mono"
				>
					编辑
				</a>
			</div>
		</div>
	{/each}
</div>
