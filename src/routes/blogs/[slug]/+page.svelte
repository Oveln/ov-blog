<script lang="ts">
	import type { PostContent } from "$lib/content"
	import { Badge } from "$lib/components/ui/badge"
	import TocSidebar from "$lib/components/layout/TocSidebar.svelte"

	let { data } = $props()
	let post: PostContent = $derived(data.post)
</script>

<svelte:head>
	<title>{post.title} - Oveln Blog</title>
	<meta name="description" content={post.description} />
</svelte:head>

<div class="mx-auto max-w-7xl py-8 min-h-[calc(100vh-56px)] px-4">
	<div class="flex gap-8 justify-center">
		<article class="flex-1 min-w-0 max-w-4xl">
			<header class="mb-8 text-center space-y-4">
				<h1 class="text-4xl lg:text-5xl font-mono font-bold tracking-tight">
					{post.title}
				</h1>
				<div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
					<span>{post.createdAt}</span>
					{#if post.updatedAt && post.updatedAt !== post.createdAt}
						<span>·</span>
						<span>更新于 {post.updatedAt}</span>
					{/if}
					<span>·</span>
					<span>{post.readingTime} min</span>
				</div>
				<div class="flex flex-wrap justify-center gap-2">
					{#each post.tags as tag}
						<Badge variant="secondary" class="text-xs">{tag}</Badge>
					{/each}
				</div>
			</header>

			<main class="prose dark:prose-invert prose-zinc max-w-4xl mx-auto w-full">
				{@html post.html}
			</main>
		</article>

		<aside class="hidden xl:block w-56 shrink-0">
			<div class="sticky top-20">
				<TocSidebar toc={post.toc} />
			</div>
		</aside>
	</div>
</div>
