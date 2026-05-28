<script lang="ts">
	let { text, speed = 500, class: className = "" }: { text: string; speed?: number; class?: string } = $props();

	let displayedText = $state("");
	let currentIndex = $state(0);

	$effect(() => {
		if (currentIndex < text.length) {
			const timeout = setTimeout(() => {
				displayedText += text[currentIndex];
				currentIndex += 1;
			}, speed);
			return () => clearTimeout(timeout);
		}
	});
</script>

<div class={className}>
	{displayedText}
	<span class="blinking-cursor">_</span>
</div>

<style>
	@keyframes blink {
		from, to { opacity: 1; }
		50% { opacity: 0; }
	}

	.blinking-cursor {
		display: inline;
		font-weight: bold;
		animation: blink 1s step-end infinite;
	}
</style>
