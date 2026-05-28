<script lang="ts">
	let { name, description, url }: { name: string; description: string; url: string } = $props();
</script>

<a href={url}>
	<div class="w-full h-28 border shadow-md p-2 group relative">
		<h2 class="text-xl font-bold">{name}</h2>
		<p class="text-sm">{description}</p>
		<span class="absolute left-2 bottom-2 animated-underline group-hover:animated-underline-hover">
			Go to →
		</span>
	</div>
</a>
