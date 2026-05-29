<script lang="ts">
	import { renderHtml } from "$lib/content/renderers/html"
	import { parseToMdast } from "$lib/content/parser"
	import VersionGraph from "$lib/components/version/VersionGraph.svelte"
	import type { VersionMeta } from "$lib/version"
	import { ArrowLeft, ArrowRightLeft, Pencil } from "lucide-svelte"
	import { Button } from "$lib/components/ui/button"
	import { Badge } from "$lib/components/ui/badge"
	import { goto } from "$app/navigation"

	let { data } = $props()

	let slug = $derived(data.slug)
	let versions = $state<VersionMeta[]>(data.versions)
	let currentVersion = $state(data.currentVersion ?? (versions.length > 0 ? versions[versions.length - 1].version : 0))

	let selectedVersion = $state(0)
	let versionHtml = $state("")
	let loadedVersion = $state(0)
	let loading = $state(false)
	let switching = $state(false)
	let message = $state("")

	let selectedMeta = $derived(versions.find((v) => v.version === selectedVersion))
	let backHref = $derived(
		data.from === "editor"
			? `/dashboard/edit/${slug}`
			: "/dashboard",
	)

	async function loadVersionContent(version: number) {
		if (version === loadedVersion && versionHtml) return
		loading = true
		try {
			const resp = await fetch(`/api/versions?slug=${encodeURIComponent(slug)}&version=${version}`)
			if (resp.ok) {
				const result = await resp.json()
				const tree = await parseToMdast(result.content)
				versionHtml = await renderHtml(tree)
				loadedVersion = version
			} else {
				versionHtml = "<p>版本不存在</p>"
			}
		} catch {
			versionHtml = "<p>加载失败</p>"
		} finally {
			loading = false
		}
	}

	async function handleSwitchTo(version: number) {
		if (!confirm(`确认切换到 v${version}？当前版本指针将变为 v${version}，不会创建新版本。`)) return

		switching = true
		message = ""
		try {
			const resp = await fetch("/api/versions/switch", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ slug, version }),
			})
			const result = await resp.json()
			if (result.ok) {
				message = `已切换到 v${version}`
				const versionsResp = await fetch(`/api/versions?slug=${encodeURIComponent(slug)}`)
				if (versionsResp.ok) {
					const vData = await versionsResp.json()
					versions = vData.versions
					currentVersion = vData.currentVersion ?? version
				}
				loadedVersion = 0
				await loadVersionContent(version)
			} else {
				message = result.error ?? "切换失败"
			}
		} catch {
			message = "网络错误"
		} finally {
			switching = false
		}
	}

	function handleEditFromVersion(version: number) {
		goto(`/dashboard/edit/${slug}?fromVersion=${version}&from=versions`)
	}

	function handleSelectVersion(version: number) {
		selectedVersion = version
		loadVersionContent(version)
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleString("zh-CN", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		})
	}

	$effect(() => {
		if (versions.length > 0 && selectedVersion === 0) {
			selectedVersion = currentVersion
			loadVersionContent(currentVersion)
		}
	})
</script>

<svelte:head>
	<title>版本历史: {slug} - Dashboard - Oveln Blog</title>
</svelte:head>

<div class="flex flex-col h-full">
	<div class="flex items-center justify-between py-3 px-1">
		<div class="flex items-center gap-3">
			<a href={backHref} class="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
				<ArrowLeft size={20} />
			</a>
			<div>
				<h1 class="text-lg font-mono font-bold">版本历史</h1>
				<p class="text-xs text-muted-foreground font-mono">{slug}</p>
			</div>
		</div>
		<div class="flex items-center gap-2">
			{#if message}
				<span class="text-xs font-mono text-muted-foreground">{message}</span>
			{/if}
		</div>
	</div>

	{#if versions.length === 0}
		<div class="flex-1 flex items-center justify-center text-muted-foreground font-mono">
			暂无版本历史 — 保存文章后自动创建版本
		</div>
	{:else}
		<div class="flex gap-4 flex-1 min-h-0">
			<div class="w-[380px] shrink-0 flex flex-col gap-3">
				<div class="rounded-lg border bg-card h-[280px] overflow-hidden relative">
					<div class="px-3 py-2 text-xs font-mono text-muted-foreground border-b bg-muted/30 select-none relative z-10 flex items-center justify-between">
						<span>版本图</span>
						<span class="text-[10px] opacity-60">拖拽 · 滚轮缩放</span>
					</div>
					<div class="h-[calc(100%-36px)] relative z-0">
					<VersionGraph
						{versions}
						{currentVersion}
						bind:selectedVersion
						onSelect={handleSelectVersion}
					/>
					</div>
				</div>

				<div class="flex-1 overflow-auto rounded-lg border bg-card">
					<div class="px-3 py-2 text-xs font-mono text-muted-foreground border-b bg-muted/30 select-none sticky top-0">
						版本列表
					</div>
					<div class="divide-y">
						{#each [...versions].reverse() as v (v.version)}
							<button
								class="w-full text-left px-3 py-2.5 hover:bg-accent/50 transition-colors {v.version === selectedVersion ? 'bg-accent' : ''}"
								onclick={() => handleSelectVersion(v.version)}
							>
								<div class="flex items-center gap-2">
									<span class="font-mono font-medium text-sm">v{v.version}</span>
									<Badge
										variant={v.type === "full" ? "default" : "secondary"}
										class="text-[10px] px-1.5 py-0"
									>
										{v.type === "full" ? "快照" : "补丁"}
									</Badge>
									{#if v.version === currentVersion}
										<Badge class="text-[10px] px-1.5 py-0 bg-primary text-primary-foreground">
											当前
										</Badge>
									{/if}
								</div>
								<div class="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground font-mono">
									<span>{formatDate(v.createdAt)}</span>
									{#if v.parent !== null}
										<span>&larr; v{v.parent}</span>
									{/if}
								</div>
								{#if v.summary}
									<p class="text-xs mt-1 text-muted-foreground truncate">{v.summary}</p>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			</div>

			<div class="flex-1 flex flex-col min-w-0">
				<div class="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
					<span class="text-xs font-mono text-muted-foreground">
						{#if selectedMeta}
							v{selectedMeta.version} · {formatDate(selectedMeta.createdAt)}
							{#if selectedMeta.summary}
								· {selectedMeta.summary}
							{/if}
							{#if selectedMeta.parent !== null}
								· &larr; v{selectedMeta.parent}
							{/if}
						{:else}
							选择版本查看内容
						{/if}
					</span>
					<div class="flex items-center gap-2">
						{#if selectedVersion > 0 && selectedMeta}
							<Button
								size="sm"
								variant="secondary"
								class="font-mono text-xs"
								onclick={() => handleEditFromVersion(selectedVersion)}
							>
								<Pencil size={12} class="mr-1" />
								编辑
							</Button>
							{#if selectedVersion !== currentVersion}
								<Button
									size="sm"
									variant="outline"
									class="font-mono text-xs"
									onclick={() => handleSwitchTo(selectedVersion)}
									disabled={switching}
								>
									<ArrowRightLeft size={12} class="mr-1" />
									{switching ? "切换中..." : "切换到此版本"}
								</Button>
							{/if}
						{/if}
					</div>
				</div>

				<div class="flex-1 overflow-auto p-4">
					{#if loading}
						<div class="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">
							加载中...
						</div>
					{:else if versionHtml}
						<div class="prose dark:prose-invert prose-zinc max-w-none">
							{@html versionHtml}
						</div>
					{:else}
						<div class="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">
							点击左侧版本查看内容
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
