<script lang="ts">
	import { Globe, Rocket, Terminal } from "lucide-svelte";
</script>

<svelte:head>
	<title>About - Oveln Blog</title>
</svelte:head>

<main class="min-h-[calc(100vh-56px)] p-6 md:p-8 animate-fade-up">
	<div class="max-w-5xl mx-auto space-y-12">
		<section class="text-center space-y-4 py-8">
			<h1 class="text-4xl md:text-5xl font-mono font-bold leading-[1.4] pb-1 bg-linear-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
				关于 Oveln Blog
			</h1>
			<p class="text-lg text-muted-foreground max-w-2xl mx-auto font-mono">
				一个使用 SvelteKit 和 TypeScript 构建的现代博客平台，具有简洁的设计和强大的内容创建和管理功能。
			</p>
		</section>

		<div class="grid md:grid-cols-2 gap-6">
			{#each [
				{ title: "前端", icon: Terminal, items: ["SvelteKit", "Svelte 5", "TypeScript", "Tailwind CSS v4", "shadcn-svelte"] },
				{ title: "内容系统", icon: Globe, items: ["unified + remark + rehype", "SourceEditor", "Shiki 代码高亮", "KaTeX 数学公式", "Markdown-first"] },
				{ title: "功能", icon: Rocket, items: ["GitHub OAuth", "Markdown 编辑器", "代码高亮", "数学公式", "评论系统"] },
				{ title: "部署", icon: Globe, items: ["Docker", "GitHub Actions"] },
			] as category}
				<div class="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-300">
					<div class="flex flex-col space-y-1.5 p-6">
						<h3 class="flex items-center gap-2 font-mono font-semibold">
							<category.icon class="h-5 w-5" />
							{category.title}
						</h3>
					</div>
					<div class="p-6 pt-0">
						<div class="flex flex-wrap gap-2">
							{#each category.items as item}
								<span class="inline-flex items-center rounded-md border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 px-2.5 py-0.5 text-xs font-semibold font-mono transition-all hover:scale-105 cursor-default">
									{item}
								</span>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>

		<section class="space-y-6 bg-muted/50 rounded-lg p-6">
			<h2 class="text-2xl font-mono font-semibold flex items-center gap-2">
				<Rocket class="h-6 w-6" />
				主要功能
			</h2>
			<div class="grid md:grid-cols-2 gap-4">
				{#each [
					{ title: "现代设计", desc: "响应式布局，支持暗模式" },
					{ title: "Markdown-first", desc: "Markdown 作为唯一内容源" },
					{ title: "AI Native", desc: "AI 辅助写作和内容处理" },
					{ title: "Local-first", desc: "本地优先的内容存储架构" },
					{ title: "Content Pipeline", desc: "可扩展的 AST 内容处理管线" },
					{ title: "版本控制", desc: "快照 + 增量补丁的版本管理" },
				] as feature}
					<div class="p-4 rounded-lg bg-card shadow-sm hover:shadow-md transition-all duration-300">
						<h3 class="font-mono font-semibold mb-1">{feature.title}</h3>
						<p class="text-sm text-muted-foreground font-mono">{feature.desc}</p>
					</div>
				{/each}
			</div>
		</section>
	</div>
</main>
