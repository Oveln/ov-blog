<script lang="ts">
	import { renderHtml } from "$lib/content/renderers/html"
	import { parseToMdast } from "$lib/content/parser"

	let { source = $bindable("") }: { source?: string } = $props()

	let textareaValue = $state("")
	let previewHtml = $state("")
	let lastSyncedSource = ""
	let debounceTimer: ReturnType<typeof setTimeout> | null = null

	async function updatePreview(md: string) {
		try {
			const tree = await parseToMdast(md)
			previewHtml = await renderHtml(tree)
		} catch {
			previewHtml = "<p>渲染失败</p>"
		}
	}

	function onInput() {
		lastSyncedSource = textareaValue
		source = textareaValue
		if (debounceTimer) clearTimeout(debounceTimer)
		debounceTimer = setTimeout(() => updatePreview(textareaValue), 300)
	}

	$effect(() => {
		const currentSource = source
		if (currentSource !== lastSyncedSource) {
			textareaValue = currentSource
			lastSyncedSource = currentSource
		}
		if (currentSource) {
			updatePreview(currentSource)
		}
	})
</script>

<div class="flex h-[calc(100vh-180px)] min-h-[400px] rounded-lg border overflow-hidden bg-background">
	<div class="w-1/2 flex flex-col border-r">
		<div class="px-3 py-2 text-xs font-mono text-muted-foreground border-b bg-muted/30 select-none">
			Markdown
		</div>
		<textarea
			bind:value={textareaValue}
			class="flex-1 w-full resize-none p-4 font-mono text-sm bg-transparent outline-none leading-relaxed"
			placeholder="在这里写 Markdown..."
			oninput={onInput}
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
