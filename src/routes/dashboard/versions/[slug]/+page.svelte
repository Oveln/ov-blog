<script lang="ts">
	import { renderHtml } from "$lib/content/renderers/html"
	import { parseToMdast } from "$lib/content/parser"
	import VersionGraph from "$lib/components/version/VersionGraph.svelte"
	import type { VersionMeta } from "$lib/version"
	import { ArrowLeft, ArrowRightLeft, Pencil } from "lucide-svelte"
	import { Button } from "$lib/components/ui/button"
	import { Badge } from "$lib/components/ui/badge"

	let { data } = $props()

	const d = () => data
	let slug = $derived(d().slug)
	let versions = $state<VersionMeta[]>(d().versions)
	let currentVersion = $state(d().currentVersion ?? (versions.length > 0 ? versions[versions.length - 1].version : 0))

	let selectedVersion = $state(0)
	let versionContent = $state<string | null>(null)
	let versionHtml = $state("")
	let loadedVersion = $state(0)
	let loading = $state(false)
	let switching = $state(false)
	let message = $state("")

	let selectedMeta = $derived(versions.find((v) => v.version === selectedVersion))

	async function loadVersionContent(version: number) {
		if (version === loadedVersion && versionHtml) return
		loading = true
		try {
			const resp = await fetch(`/api/versions?slug=${encodeURIComponent(slug)}&version=${version}`)
			if (resp.ok) {
				const result = await resp.json()
				versionContent = result.content
				const tree = await parseToMdast(versionContent!)
				versionHtml = await renderHtml(tree)
				loadedVersion = version
			} else {
				versionContent = null
				versionHtml = "<p>版本不存在</p>"
			}
		} catch {
			versionContent = null
			versionHtml = "<p>加载失败</p>"
		} finally {
			loading = false
		}
	}

	async function handleSwitchTo(version: number) {
		if (!confirm(`确认切换到 v${version}？当前版本指针将变为 v${version}。`)) return

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
				selectedVersion = version
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
		window.location.href = `/dashboard/edit/${slug}?fromVersion=${version}`
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
			<a href="/dashboard" class="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
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
			<a href="/dashboard/edit/{slug}">
				<Button size="sm" variant="outline" class="font-mono">
					<Pencil size={14} class="mr-1" />编辑当前
				</Button>
			</a>
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
					<div class="px-3 py-2 text-xs font-mono text-muted-foreground border-b bg-muted/30 select-none relative z-10">
						版本图
					</div>
					<div class="h-[calc(100%-36px)] relative z-0">
						<VersionGraph
							bind:versions
							bind:currentVersion
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
										<span>← v{v.parent}</span>
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
					<div class="flex items-center gap-2">
						<span class="text-xs font-mono text-muted-foreground">
							{#if selectedMeta}
								v{selectedMeta.version} · {formatDate(selectedMeta.createdAt)}
								{#if selectedMeta.summary}
									· {selectedMeta.summary}
								{/if}
								{#if selectedMeta.parent !== null}
									· parent: v{selectedMeta.parent}
								{/if}
							{:else}
								选择版本
							{/if}
						</span>
					</div>
					<div class="flex items-center gap-2">
						{#if selectedVersion > 0 && selectedMeta}
							{#if selectedVersion !== currentVersion}
								<Button
									size="sm"
									variant="outline"
									class="font-mono text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
									onclick={() => handleSwitchTo(selectedVersion)}
									disabled={switching}
								>
									<ArrowRightLeft size={12} class="mr-1" />
									{switching ? "切换中..." : "设为当前版本"}
								</Button>
							{/if}
							<Button
								size="sm"
								variant="secondary"
								class="font-mono text-xs hover:bg-primary hover:text-primary-foreground transition-colors"
								onclick={() => handleEditFromVersion(selectedVersion)}
							>
								<Pencil size={12} class="mr-1" />
								从此版本修改
							</Button>
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
							点击版本查看内容
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>