<script lang="ts">
	import { renderHtml } from "$lib/content/renderers/html"

	let { source = $bindable("") }: { source?: string } = $props()

	let previewHtml = $state("")
	let debounceTimer: ReturnType<typeof setTimeout> | null = null

	async function updatePreview(md: string) {
		try {
			previewHtml = await renderHtml(md)
		} catch {
			previewHtml = "<p>渲染失败</p>"
		}
	}

	function onInput(e: Event) {
		const target = e.target as HTMLTextAreaElement
		source = target.value
		if (debounceTimer) clearTimeout(debounceTimer)
		debounceTimer = setTimeout(() => updatePreview(source), 300)
	}

	$effect(() => {
		if (source) {
			updatePreview(source)
		}
	})
</script>

<div class="flex h-[calc(100vh-180px)] min-h-[400px] rounded-lg border overflow-hidden bg-background">
	<div class="w-1/2 flex flex-col border-r">
		<div class="px-3 py-2 text-xs font-mono text-muted-foreground border-b bg-muted/30 select-none">
			Markdown
		</div>
		<textarea
			class="flex-1 w-full resize-none p-4 font-mono text-sm bg-transparent outline-none leading-relaxed"
			placeholder="在这里写 Markdown..."
			{...{}}
			oninput={onInput}
			value={source}
		></textarea>
	</div>
	<div class="w-1/2 flex flex-col">
		<div class="px-3 py-2 text-xs font-mono text-muted-foreground border-b bg-muted/30 select-none">
			Preview
		</div>
		<div class="flex-1 overflow-auto p-4">
			<div class="prose dark:prose-invert prose-zinc max-w-none">
				{#if previewHtml}
					{@html previewHtml}
				{:else}
					<p class="text-muted-foreground">预览将在这里显示...</p>
				{/if}
			</div>
		</div>
	</div>
</div>
