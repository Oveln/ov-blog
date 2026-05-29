<script lang="ts">
	import type { VersionMeta } from "$lib/version"
	import { onMount } from "svelte"
	import { forceSimulation, forceLink, forceManyBody, forceCenter, forceY, type SimulationNodeDatum, type SimulationLinkDatum } from "d3-force"

	interface GraphNode extends SimulationNodeDatum {
		id: string
		version: number
		type: "full" | "patch"
		summary?: string
		isCurrent: boolean
	}

	interface GraphLink extends SimulationLinkDatum<GraphNode> {
		source: string | GraphNode
		target: string | GraphNode
	}

	let {
		versions = [],
		currentVersion = 0,
		selectedVersion = $bindable(0),
		onSelect,
	}: {
		versions: VersionMeta[]
		currentVersion: number
		selectedVersion: number
		onSelect?: (version: number) => void
	} = $props()

	let svgEl: SVGSVGElement
	let containerEl: HTMLDivElement
	let width = $state(600)
	let height = $state(400)
	let panOffset = $state({ x: 0, y: 0 })
	let scale = $state(1)
	let hoveredNode = $state<string | null>(null)

	const NODE_RADIUS = 24
	const LEVEL_HEIGHT = 80
	const ARROW_SIZE = 10

	let positions = $state<Record<string, { x: number; y: number }>>({})
	let simNodes = $state<GraphNode[]>([])
	let simLinks = $state<GraphLink[]>([])

	type Mode = "idle" | "node-drag" | "pan"
	let mode: Mode = "idle"
	let dragNodeId: string | null = null
	let dragStartScreen = { x: 0, y: 0 }
	let dragNodeOrigin = { x: 0, y: 0 }
	let panStartScreen = { x: 0, y: 0 }
	let panOffsetOrigin = { x: 0, y: 0 }
	const CLICK_THRESHOLD = 4

	function getDepth(version: number, parentMap: Map<number, number | null>): number {
		const depthMemo = new Map<number, number>()
		function d(v: number): number {
			if (depthMemo.has(v)) return depthMemo.get(v)!
			const p = parentMap.get(v)
			if (p === null || p === undefined) {
				depthMemo.set(v, 0)
				return 0
			}
			const result = d(p) + 1
			depthMemo.set(v, result)
			return result
		}
		return d(version)
	}

	function screenToWorld(sx: number, sy: number): { x: number; y: number } {
		const rect = svgEl.getBoundingClientRect()
		return {
			x: (sx - rect.left - panOffset.x) / scale,
			y: (sy - rect.top - panOffset.y) / scale,
		}
	}

	function centerOnNode(version: number) {
		const pos = positions[`v${version}`]
		if (!pos) return
		panOffset = {
			x: width / 2 - pos.x * scale,
			y: height / 2 - pos.y * scale,
		}
	}

	let simRef: ReturnType<typeof forceSimulation<GraphNode>> | null = null
	let activeNodes: GraphNode[] = []

	function buildGraph() {
		if (versions.length === 0) {
			simNodes = []
			simLinks = []
			positions = {}
			return
		}

		const parentMap = new Map<number, number | null>()
		for (const v of versions) {
			parentMap.set(v.version, v.parent)
		}

		const depthMap = new Map<number, number>()
		for (const v of versions) {
			depthMap.set(v.version, getDepth(v.version, parentMap))
		}

		const newNodes: GraphNode[] = versions.map((v) => {
			const depth = depthMap.get(v.version) ?? 0
			return {
				id: `v${v.version}`,
				version: v.version,
				type: v.type,
				summary: v.summary,
				isCurrent: v.version === currentVersion,
				x: width / 2,
				y: 60 + depth * LEVEL_HEIGHT,
			}
		})

		const newLinks: GraphLink[] = versions
			.filter((v) => v.parent !== null)
			.map((v) => ({
				source: `v${v.parent}`,
				target: `v${v.version}`,
			}))

		const columnCounts = new Map<number, number>()
		for (const node of newNodes) {
			const depth = depthMap.get(node.version) ?? 0
			if (!columnCounts.has(depth)) columnCounts.set(depth, 0)
			columnCounts.set(depth, columnCounts.get(depth)! + 1)
		}

		const perDepthCounter = new Map<number, number>()
		for (const node of newNodes) {
			const depth = depthMap.get(node.version) ?? 0
			const totalAtDepth = columnCounts.get(depth) ?? 1
			if (!perDepthCounter.has(depth)) perDepthCounter.set(depth, 0)
			const col = perDepthCounter.get(depth)!
			perDepthCounter.set(depth, col + 1)

			const xSpread = NODE_RADIUS * 6
			node.x = width / 2 + (col - (totalAtDepth - 1) / 2) * xSpread
			node.y = 60 + depth * LEVEL_HEIGHT
		}

		panOffset = { x: 0, y: 0 }
		scale = 1

		const initPositions: Record<string, { x: number; y: number }> = {}
		for (const node of newNodes) {
			initPositions[node.id] = { x: node.x!, y: node.y! }
		}

		simNodes = newNodes
		simLinks = newLinks
		positions = initPositions
		activeNodes = newNodes

		const simulation = forceSimulation<GraphNode>(newNodes)
			.alphaDecay(0)
			.velocityDecay(0.4)
			.force(
				"link",
				forceLink<GraphNode, GraphLink>(newLinks)
					.id((d) => d.id)
					.distance(100),
			)
			.force("charge", forceManyBody().strength(-200))
			.force("center", forceCenter(width / 2, height / 2))
			.force("y", forceY<GraphNode>((d) => d.y ?? 0).strength(0.15))
			.on("tick", () => {
				const updated: Record<string, { x: number; y: number }> = {}
				for (const node of newNodes) {
					if (node.x != null && node.y != null) {
						if (mode === "node-drag" && node.id === dragNodeId) {
							updated[node.id] = positions[node.id] ?? { x: node.x, y: node.y }
						} else {
							updated[node.id] = { x: node.x, y: node.y }
						}
					}
				}
				positions = updated
			})

		simRef = simulation

		simulation.alpha(0.8).restart()

		return () => {
			simulation.stop()
		}
	}

	let cleanup: (() => void) | void

	$effect(() => {
		if (versions.length > 0) {
			cleanup?.()
			cleanup = buildGraph()
		}
	})

	onMount(() => {
		const handleResize = () => {
			if (!containerEl) return
			width = containerEl.clientWidth
			height = containerEl.clientHeight
		}
		handleResize()
		const observer = new ResizeObserver(handleResize)
		if (containerEl) observer.observe(containerEl)
		return () => {
			observer.disconnect()
			cleanup?.()
		}
	})

	function handleGlobalMouseMove(e: MouseEvent) {
		if (mode === "node-drag" && dragNodeId) {
			const world = screenToWorld(e.clientX, e.clientY)
			const originWorld = screenToWorld(dragStartScreen.x, dragStartScreen.y)
			const dx = world.x - originWorld.x
			const dy = world.y - originWorld.y
			const nx = dragNodeOrigin.x + dx
			const ny = dragNodeOrigin.y + dy
			positions = {
				...positions,
				[dragNodeId]: { x: nx, y: ny },
			}
			const simNode = activeNodes.find((n) => n.id === dragNodeId)
			if (simNode) {
				simNode.fx = nx
				simNode.fy = ny
			}
		} else if (mode === "pan") {
			panOffset = {
				x: panOffsetOrigin.x + (e.clientX - panStartScreen.x),
				y: panOffsetOrigin.y + (e.clientY - panStartScreen.y),
			}
		}
	}

	function handleGlobalMouseUp(e: MouseEvent) {
		if (mode === "node-drag" && dragNodeId) {
			const dx = e.clientX - dragStartScreen.x
			const dy = e.clientY - dragStartScreen.y
			if (Math.abs(dx) <= CLICK_THRESHOLD && Math.abs(dy) <= CLICK_THRESHOLD) {
				const version = parseInt(dragNodeId.slice(1), 10)
				selectedVersion = version
				onSelect?.(version)
				centerOnNode(version)
			}
			const simNode = activeNodes.find((n) => n.id === dragNodeId)
			if (simNode) {
				simNode.fx = null
				simNode.fy = null
			}
			simRef?.alpha(0.1).restart()
		}
		mode = "idle"
		dragNodeId = null
	}

	function handleNodeMouseDown(e: MouseEvent, nodeId: string) {
		e.stopPropagation()
		mode = "node-drag"
		dragNodeId = nodeId
		dragStartScreen = { x: e.clientX, y: e.clientY }
		const pos = positions[nodeId]
		if (pos) {
			dragNodeOrigin = { x: pos.x, y: pos.y }
		}
	}

	function handleSvgMouseDown(e: MouseEvent) {
		if (mode !== "idle") return
		mode = "pan"
		panStartScreen = { x: e.clientX, y: e.clientY }
		panOffsetOrigin = { ...panOffset }
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault()
		const svgRect = svgEl.getBoundingClientRect()
		const mouseX = e.clientX - svgRect.left
		const mouseY = e.clientY - svgRect.top

		const oldScale = scale
		const delta = e.deltaY > 0 ? 0.9 : 1.1
		const newScale = Math.max(0.3, Math.min(3, oldScale * delta))

		const worldX = (mouseX - panOffset.x) / oldScale
		const worldY = (mouseY - panOffset.y) / oldScale

		panOffset = {
			x: mouseX - worldX * newScale,
			y: mouseY - worldY * newScale,
		}
		scale = newScale
	}

	function getLineEnd(sx: number, sy: number, tx: number, ty: number, targetRadius: number): { x: number; y: number } {
		const dx = tx - sx
		const dy = ty - sy
		const len = Math.sqrt(dx * dx + dy * dy)
		if (len === 0) return { x: tx, y: ty }
		const ux = dx / len
		const uy = dy / len
		return { x: tx - ux * (targetRadius + 2), y: ty - uy * (targetRadius + 2) }
	}

	function getArrowPath(sx: number, sy: number, tx: number, ty: number, targetRadius: number): string {
		const dx = tx - sx
		const dy = ty - sy
		const len = Math.sqrt(dx * dx + dy * dy)
		if (len === 0) return ""
		const ux = dx / len
		const uy = dy / len
		const ex = tx - ux * (targetRadius + 2)
		const ey = ty - uy * (targetRadius + 2)
		const ax = ex - ux * ARROW_SIZE
		const ay = ey - uy * ARROW_SIZE
		const px = -uy * (ARROW_SIZE * 0.4)
		const py = ux * (ARROW_SIZE * 0.4)
		return `M${ax + px},${ay + py} L${ex},${ey} L${ax - px},${ay - py}`
	}
</script>

<svelte:window
	onmousemove={handleGlobalMouseMove}
	onmouseup={handleGlobalMouseUp}
/>

<div bind:this={containerEl} class="relative w-full h-full min-h-[200px]">
	<svg
		bind:this={svgEl}
		viewBox="0 0 {width} {height}"
		class="select-none w-full h-full {mode === 'pan' ? 'cursor-grabbing' : 'cursor-grab'}"
		onmousedown={handleSvgMouseDown}
		onwheel={handleWheel}
	>
		<defs>
			<filter id="glow">
				<feGaussianBlur stdDeviation="3" result="coloredBlur" />
				<feMerge>
					<feMergeNode in="coloredBlur" />
					<feMergeNode in="SourceGraphic" />
				</feMerge>
			</filter>
		</defs>

		<g transform="translate({panOffset.x}, {panOffset.y}) scale({scale})">
			{#each simLinks as link}
				{@const sourceId = typeof link.source === "string" ? link.source : link.source.id}
				{@const targetId = typeof link.target === "string" ? link.target : link.target.id}
				{@const source = positions[sourceId] ?? { x: 0, y: 0 }}
				{@const target = positions[targetId] ?? { x: 0, y: 0 }}
				{@const lineEnd = getLineEnd(source.x, source.y, target.x, target.y, NODE_RADIUS)}
				{@const arrowPath = getArrowPath(source.x, source.y, target.x, target.y, NODE_RADIUS)}
				<line
					x1={source.x}
					y1={source.y}
					x2={lineEnd.x}
					y2={lineEnd.y}
					stroke="var(--muted-foreground)"
					stroke-width="1.5"
					opacity="0.5"
				/>
				{#if arrowPath}
					<path
						d={arrowPath}
						fill="var(--muted-foreground)"
						opacity="0.7"
					/>
				{/if}
			{/each}

			{#each simNodes as node (node.id)}
				{@const pos = positions[node.id] ?? { x: 0, y: 0 }}
				{@const isCurrent = node.version === currentVersion}
				{@const isSelected = node.version === selectedVersion}
				{@const isHovered = node.id === hoveredNode}
				<g
					class="cursor-pointer"
					role="button"
					tabindex="0"
					onmousedown={(e) => handleNodeMouseDown(e, node.id)}
					onkeydown={(e) => {
						if (e.key === "Enter") {
							selectedVersion = node.version
							onSelect?.(node.version)
							centerOnNode(node.version)
						}
					}}
					onmouseenter={() => hoveredNode = node.id}
					onmouseleave={() => hoveredNode = null}
				>
					{#if isCurrent}
						<circle
							cx={pos.x}
							cy={pos.y}
							r={NODE_RADIUS + 8}
							fill="none"
							stroke="var(--primary)"
							stroke-width="2"
							stroke-dasharray="4 2"
							opacity="0.5"
						>
							<animate
								attributeName="stroke-dashoffset"
								from="0"
								to="12"
								dur="2s"
								repeatCount="indefinite"
							/>
						</circle>
					{/if}

					<circle
						cx={pos.x}
						cy={pos.y}
						r={NODE_RADIUS + (isHovered ? 3 : 0)}
						fill={isSelected
							? "var(--primary)"
							: node.type === "full"
								? "var(--card)"
								: "var(--secondary)"}
						stroke={isSelected ? "var(--primary)" : isCurrent ? "var(--primary)" : "var(--border)"}
						stroke-width={isSelected || isCurrent ? 2.5 : 1.5}
						filter={isSelected ? "url(#glow)" : undefined}
						style="transition: r 0.15s ease, fill 0.15s ease, stroke 0.15s ease"
					/>

					<text
						x={pos.x}
						y={pos.y + 1}
						text-anchor="middle"
						dominant-baseline="central"
						fill={isSelected ? "var(--primary-foreground)" : "var(--foreground)"}
						font-size="12"
						font-weight="600"
						font-family="JetBrains Mono, monospace"
						pointer-events="none"
					>
						v{node.version}
					</text>

					{#if node.type === "full"}
						<text
							x={pos.x}
							y={pos.y + NODE_RADIUS + 14}
							text-anchor="middle"
							fill="var(--muted-foreground)"
							font-size="9"
							font-family="JetBrains Mono, monospace"
							pointer-events="none"
						>
							snapshot
						</text>
					{/if}

					{#if node.summary}
						<text
							x={pos.x}
							y={pos.y - NODE_RADIUS - 8}
							text-anchor="middle"
							fill={isSelected ? "var(--primary)" : "var(--muted-foreground)"}
							font-size="10"
							font-family="JetBrains Mono, monospace"
							pointer-events="none"
						>
							{node.summary}
						</text>
					{/if}
				</g>
			{/each}
		</g>
	</svg>

	<div class="absolute bottom-2 left-3 flex items-center gap-3 text-[10px] font-mono text-muted-foreground/60 select-none pointer-events-none">
		<span class="flex items-center gap-1"><span class="inline-block w-2 h-2 rounded-full bg-primary"></span> 快照</span>
		<span class="flex items-center gap-1"><span class="inline-block w-2 h-2 rounded-full bg-secondary border border-border"></span> 补丁</span>
		<span class="flex items-center gap-1"><span class="inline-block w-2 h-2 rounded-full border-2 border-dashed border-primary"></span> 当前</span>
	</div>
</div>
