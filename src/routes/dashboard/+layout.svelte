<script lang="ts">
	import { page } from "$app/stores"

	let { children } = $props()

	let currentPath = $derived($page.url.pathname)
	let isEditor = $derived(
		currentPath.startsWith("/dashboard/write") || currentPath.startsWith("/dashboard/edit"),
	)
</script>

{#if isEditor}
	<div class="px-4 py-4 min-h-[calc(100vh-56px)]">
		{@render children()}
	</div>
{:else}
	<div class="mx-auto max-w-6xl py-8 min-h-[calc(100vh-56px)] px-4">
		<div class="flex items-center justify-between mb-8">
			<h1 class="text-2xl font-mono font-bold">Dashboard</h1>
			<a
				href="/dashboard/write"
				class="inline-flex items-center gap-2 px-4 py-2 text-sm font-mono bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
			>
				新建文章
			</a>
		</div>

		<nav class="flex gap-4 mb-6 border-b pb-2">
			<a
				href="/dashboard"
				class={currentPath === "/dashboard" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}
			>
				文章列表
			</a>
		</nav>

		{@render children()}
	</div>
{/if}
