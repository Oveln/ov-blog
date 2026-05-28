<script lang="ts">
	import AppCard from "$lib/components/AppCard.svelte";

	const apps = [
		{ name: "Excalidraw", description: "一个在线画图工具", url: "https://excalidraw.oveln.icu" },
		{ name: "Oveln Note", description: "Oveln的学习笔记，基于Obisidan", url: "https://note.oveln.icu" },
		{ name: "Oveln Pan", description: "Oveln自用的网盘", url: "https://pan.oveln.icu:5080/" },
		{ name: "Oveln Music", description: "Oveln自用的音乐播放器", url: "https://music.oveln.icu:5080/" },
		{ name: "Suger OJ", description: "Oveln搭建的在线评测平台", url: "https://oj.oveln.icu:5080" },
	];
</script>

<svelte:head>
	<title>Apps - Oveln Blog</title>
</svelte:head>

<div class="min-h-[calc(100vh-54px)] pt-8">
	<ul class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-4">
		{#each apps as app, idx}
			<li class="animate-fade-up" style="animation-delay: {Math.floor(idx / 3) * 100}ms;">
				<AppCard name={app.name} description={app.description} url={app.url} />
			</li>
		{/each}
	</ul>
</div>
