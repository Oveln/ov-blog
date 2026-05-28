<script lang="ts">
	import type { TocItem } from "$lib/content"
	import { cn } from "$lib/utils"

	let { toc, class: className = "" }: { toc: TocItem[]; class?: string } = $props()

	const headingClasses: Record<number, string> = {
		2: "",
		3: "pl-3",
	}

	let activeId = $state<string>("")

	$effect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeId = entry.target.id
					}
				}
			},
			{ rootMargin: "-80px 0px -80% 0px" }
		)

		const headings = document.querySelectorAll("h2[id], h3[id]")
		headings.forEach((h) => observer.observe(h))

		return () => observer.disconnect()
	})
</script>

{#if toc.length > 0}
	<nav class={cn("text-sm", className)}>
		<h4 class="font-mono font-semibold mb-3 text-foreground/80">目录</h4>
		<ul class="space-y-1.5">
			{#each toc as item}
				<li>
					<a
						href="#{item.id}"
						class={cn(
							"block text-muted-foreground hover:text-foreground transition-colors border-l-2 py-0.5 leading-relaxed",
							headingClasses[item.depth] ?? "",
							activeId === item.id
								? "border-primary text-foreground font-medium"
								: "border-transparent"
						)}
					>
						{item.text}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
