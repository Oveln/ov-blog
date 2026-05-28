<script lang="ts">
	import { Input } from "$lib/components/ui/input"
	import { cn } from "$lib/utils"
	import PostCard from "$lib/components/PostCard.svelte"
	import type { PostSummary } from "$lib/content"

	let { data } = $props()

	let searchTerm = $state("")
	let selectedTag = $state<string | null>(null)

	let filteredPosts = $derived(
		data.posts.filter((post: PostSummary) => {
			const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase())
			const matchesTag = !selectedTag || post.tags.includes(selectedTag)
			return matchesSearch && matchesTag
		}),
	)

	let visibleTags = $derived.by(() => {
		const tagSet = new Set<string>()
		for (const post of filteredPosts) {
			for (const tag of post.tags) {
				tagSet.add(tag)
			}
		}
		return Array.from(tagSet).sort()
	})

	function toggleTag(tag: string) {
		selectedTag = selectedTag === tag ? null : tag
	}
</script>

<svelte:head>
	<title>Blogs - Oveln Blog</title>
</svelte:head>

<div class="mx-auto max-w-3xl py-8 min-h-[calc(100vh-56px)] px-4">
	<div class="space-y-4 mb-8">
		<Input
			type="text"
			placeholder="搜索文章..."
			class="w-full px-4 py-2.5 border rounded-lg bg-background hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none font-mono"
			bind:value={searchTerm}
		/>
		<div class="flex flex-wrap gap-2">
			{#each visibleTags as tag}
				<button
					class={cn(
						"inline-flex items-center px-3 py-1 text-sm rounded-md border font-mono select-none transition-all duration-200 cursor-pointer",
						selectedTag === tag
							? "bg-primary text-primary-foreground border-primary"
							: "bg-secondary text-secondary-foreground border-muted-foreground/20 hover:bg-primary/20 hover:text-primary",
					)}
					onclick={() => toggleTag(tag)}
				>
					{tag}
				</button>
			{/each}
		</div>
	</div>

	{#each filteredPosts as post, i}
		<PostCard {post} index={i} />
	{/each}

	{#if filteredPosts.length === 0}
		<div class="text-center text-muted-foreground py-8">
			没有找到匹配的文章
		</div>
	{/if}
</div>
