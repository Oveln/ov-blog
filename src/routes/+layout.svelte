<script lang="ts">
	import { page } from "$app/stores"
	import { ModeWatcher } from "mode-watcher";
	import favicon from "$lib/assets/favicon.svg";
	import NavMenu from "$lib/components/layout/NavMenu.svelte";
	import Footer from "$lib/components/layout/Footer.svelte";
	import "../app.css";

	let { children } = $props();

	let isEditor = $derived(
		$page.url.pathname.startsWith("/dashboard/write") ||
		$page.url.pathname.startsWith("/dashboard/edit")
	)
</script>

<ModeWatcher />

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Oveln Blog</title>
	<meta name="description" content="Oveln的小站，记录一些有趣的事" />
</svelte:head>

{#if isEditor}
	<div class="w-screen h-screen flex flex-col overflow-hidden">
		{@render children()}
	</div>
{:else}
	<div class="mx-auto max-w-[calc(100vw-10px)] lg:px-0 w-screen min-h-screen flex flex-col">
		<nav class="mx-auto w-full max-w-272 shrink-0">
			<NavMenu />
		</nav>
		<div class="mx-auto w-full max-w-272 flex-1">
			{@render children()}
		</div>
		<Footer />
	</div>
{/if}
