<script lang="ts">
	import type { PostSummary } from "$lib/content"
	import { Badge } from "$lib/components/ui/badge"

	let { post, index = 0 }: { post: PostSummary; index?: number } = $props()
</script>

<a href="/blogs/{post.slug}">
	<div
		class="mb-8 rounded-lg border border-border hover:border-foreground/30 shadow-sm hover:shadow-md p-4 group relative animate-fade-up animate-ease-in-out transition-all"
		style="animation-delay: {index * 100}ms; animation-fill-mode: backwards;"
	>
		<div class="relative mb-2">
			<h2 class="text-xl font-mono font-semibold text-foreground group-hover:text-foreground pr-32">
				{post.title}
			</h2>
			<time
				dateTime={post.createdAt}
				class="absolute right-0 top-0 text-xs text-muted-foreground"
			>
				{post.createdAt}
			</time>
		</div>

		{#if post.description}
			<div class="text-sm text-muted-foreground mb-4">
				{post.description}
			</div>
		{/if}

		<div class="flex justify-between items-center mt-3">
			<div class="flex flex-wrap gap-2">
				{#each post.tags as tag}
					<Badge variant="secondary" class="text-xs">
						{tag}
					</Badge>
				{/each}
			</div>
			<span class="text-sm text-muted-foreground group-hover:text-foreground font-mono font-medium animated-underline">
				阅读 →
			</span>
		</div>
	</div>
</a>
