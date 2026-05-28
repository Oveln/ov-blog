<script lang="ts">
	import Typing from "$lib/components/Typing.svelte";
</script>

<svelte:head>
	<title>Oveln Blog</title>
</svelte:head>

<main class="relative min-h-[calc(100vh-56px)] font-mono bg-linear-to-b from-transparent to-gray-50/30">
	<div class="absolute w-full top-14 md:top-1/3 -translate-y-0 md:-translate-y-1/2 px-4 md:px-12">
		<div class="max-w-7xl mx-auto flex items-center gap-8 md:flex-row flex-col">
			<div class="flex-1 space-y-6">
				<p class="text-4xl md:text-6xl 2xl:text-7xl font-mono font-bold animate-fade-up" style="animation-delay: 0ms;">
					Hi!👋
				</p>
				<p class="text-4xl md:text-6xl 2xl:text-7xl font-mono font-bold animate-fade-up" style="animation-delay: 100ms;">
					I'm
					<span class="text-fuchsia-500 text-opacity-85">Oveln🎉</span>
				</p>

				<div class="space-y-2">
					<p class="text-lg md:text-xl font-mono animate-fade-up" style="animation-delay: 200ms;">
						Language:
						<span class="text-amber-700 font-mono font-bold hover:opacity-80 transition-opacity cursor-default">Rust</span>
						<span class="mx-1">/</span>
						<span class="text-blue-500 font-mono font-bold hover:opacity-80 transition-opacity cursor-default">Typescript</span>
						<span class="mx-1">/</span>
						<span class="text-green-500 font-mono font-bold hover:opacity-80 transition-opacity cursor-default">Python</span>
					</p>
					<p class="text-lg md:text-xl font-mono animate-fade-up" style="animation-delay: 300ms;">
						Programing⌨️ and Gaming🎮
					</p>
				</div>

				<div class="flex gap-4 animate-fade-up" style="animation-delay: 400ms;">
					<a href="https://github.com/Oveln" class="p-0 mr-3 inline-flex w-fit text-lg items-center animated-underline hover:animated-underline-hover font-mono">
						<span>github</span>
					</a>
					<a href="mailto:oveln@outlook.com" class="p-0 mr-3 inline-flex w-fit text-lg items-center animated-underline hover:animated-underline-hover font-mono">
						<span>Email</span>
					</a>
				</div>
			</div>

			<div class="flex-1 flex flex-col items-center gap-8">
				<div class="size-64 md:size-72 rounded-full ring-4 ring-fuchsia-500/20 hover:ring-fuchsia-500/40 transition-all duration-300 overflow-hidden animate-fade-in">
					<img src="/avatar.jpg" alt="Oveln" class="w-full h-full object-cover" />
				</div>
				<div class="w-full max-w-md">
					<Typing class="text-2xl md:text-3xl text-center w-full font-mono" text={`print!("Hello World!")`} speed={100} />
				</div>
			</div>
		</div>
	</div>
</main>
