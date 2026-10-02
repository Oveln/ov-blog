<script lang="ts">
	import { resolve } from "$app/paths";
	import {
		ArrowRight,
		BadgeCheck,
		Bot,
		Brain,
		Briefcase,
		Check,
		CircuitBoard,
		CodeXml,
		Compass,
		Copy,
		Cpu,
		ExternalLink,
		Handshake,
		Layers,
		Mail,
		MessageSquare,
		Rocket,
		ScrollText,
		Sparkles,
		Target,
		Terminal,
	} from "lucide-svelte";

	type Icon = typeof Brain;
	type Service = { title: string; desc: string; icon: Icon; items: string[] };
	type Capability = { title: string; desc: string; icon: Icon; tags: string[] };
	type Project = {
		name: string;
		role: string;
		meta: string;
		summary: string;
		metrics: { value: string; label: string }[];
		tags: string[];
		link?: { href: string; label: string };
		code?: string;
	};
	type Contact = { label: string; hint: string; icon: Icon; href?: string; copy?: string };

	let copiedLabel = $state<string | null>(null);

	async function copyText(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			copiedLabel = text;
			setTimeout(() => {
				if (copiedLabel === text) copiedLabel = null;
			}, 1500);
		} catch {
			copiedLabel = null;
		}
	}

	const stats = [
		{ value: "2018", label: "开始参与开源" },
		{ value: "99", label: "个公开仓库" },
		{ value: "Rust / RISC-V", label: "主要技术方向" },
		{ value: "AI Agent", label: "当前主攻方向" },
	];

	const services: Service[] = [
		{
			title: "定制化软件制作",
			desc: "按需求定制软件，从需求梳理到上线部署。",
			icon: CodeXml,
			items: [
				"Web 系统、内部工具、桌面和嵌入式程序",
				"智能识别与分类系统：文档识别、自动归类、人工复核",
				"覆盖需求梳理、原型、开发与部署",
				"文档与部署方式交付",
			],
		},
		{
			title: "企业内智能化管理",
			desc: "将大模型接入企业内部文档与业务流程。",
			icon: Bot,
			items: [
				"内部知识库与问答，接入私有文档与内部系统",
				"文档处理、审批、报表等重复流程的自动化",
				"模型输出不稳定的环节，以测试和验收标准约束",
			],
		},
		{
			title: "技术咨询与架构评审",
			desc: "技术选型、成本评估与架构评审。",
			icon: Compass,
			items: [
				"哪些环节适合用 AI，哪些不适合",
				"现有系统的架构和性能问题排查",
				"本地部署与云端部署的选型与成本评估",
			],
		},
	];

	const capabilities: Capability[] = [
		{
			title: "AI Agent 工程化",
			desc: "LLM 应用落地：Agent 编排、SSE 流式链路、知识库检索，以及模型输出不稳定时的测试与回归。",
			icon: Brain,
			tags: ["Agent 编排", "SSE 流式链路", "分层验证", "RAG / 知识库", "本地推理"],
		},
		{
			title: "Rust 系统编程与内核",
			desc: "使用 Rust 开发 Linux 驱动、ArceOS 内核组件与异步运行时，并完成 OpenSBI、U-Boot 移植。",
			icon: Cpu,
			tags: ["Rust for Linux", "rCore / ArceOS", "OpenSBI", "U-Boot", "RISC-V"],
		},
		{
			title: "嵌入式与实时系统",
			desc: "在内存仅数百 KB 的板卡上实现实时调度与核间通信，涉及抢占式调度、设备树驱动与 no_std。",
			icon: CircuitBoard,
			tags: ["抢占式调度", "异步运行时", "AMP 多核", "共享内存 IPC", "no_std"],
		},
		{
			title: "全栈产品交付",
			desc: "覆盖数据库、后端接口、前端界面与 Docker 部署，本站是其实际案例。",
			icon: Layers,
			tags: ["SvelteKit / Svelte 5", "TypeScript", "Tailwind CSS", "内容管线", "Docker"],
		},
	];

	const projects: Project[] = [
		{
			name: "RT-Async",
			role: "个人项目",
			meta: "Rust 异步实时操作系统",
			summary:
				"从执行器、任务模型到抢占点逐步验证「async 语法 + 实时调度」在 RISC-V 与 ARM 上的可行性。全部使用 Rust 编写，不依赖标准库，亦不做动态内存分配。RT-Async-AMP 中的实时内核即该项目。",
			metrics: [
				{ value: "Rust", label: "没有 GC，运行时开销可预期" },
				{ value: "no_std", label: "不依赖标准库，不动态分配" },
				{ value: "RISC-V / ARM", label: "两个架构均已验证" },
			],
			tags: ["Rust", "Executor", "RTOS", "no_std"],
			link: { href: "https://rtos.oveln.icu", label: "项目网站" },
			code: "https://github.com/Oveln/RT-Async",
		},
		{
			name: "RT-Async-AMP",
			role: "主要开发者 · 报告人",
			meta: "面向异构多核 SoC 的 AMP 双内核系统",
			summary:
				"通用大核（AP）运行 Linux 兼容内核 StarryOS，实时小核（RP）运行自研 rt-async，两核通过共享内存与硬件邮箱或核间中断协作。设计上采用系统分解思路，将实时域从通用内核剥离到独立小核，AP 侧通用内核基本保持原状。实时侧板级驱动由设备树在运行时探测并实例化，引脚复用与时钟使能在驱动 probe 前自动完成；跨核通信栈覆盖内核态与用户态，用户态经 mmap 获取设备文件，通信不产生中断开销。工具链与设备树宏编译链统一了 QEMU 仿真与真板两条路径，并通过机器人控制应用验证端到端可用性。目标平台为进迭时空 K3 的 RT24 实时小核（CVA6 / RV64GC）。",
			metrics: [
				{ value: "AP + RP", label: "大核运行 StarryOS，小核运行 rt-async" },
				{ value: "K3 / RT24", label: "目标 SoC（CVA6 / RV64GC）" },
				{ value: "2 条", label: "QEMU 仿真与真板验证路径" },
			],
			tags: ["Rust", "AMP", "跨核 RPC", "设备树", "共享内存", "CVA6"],
			link: {
				href: "https://rtos.oveln.icu/%E6%8A%80%E6%9C%AF%E6%8A%A5%E5%91%8A/2026-09-05-AMP%E5%8F%8C%E5%86%85%E6%A0%B8%E5%AE%9E%E6%97%B6%E7%B3%BB%E7%BB%9F%E6%8A%80%E6%9C%AF%E6%8A%A5%E5%91%8A.html",
				label: "技术报告",
			},
			code: "https://github.com/Oveln/Rt-Async-AMP",
		},
		{
			name: "ov-archive · 智能识别与分类",
			role: "独立开发 · 进行中",
			meta: "档案资料的自动识别与分类系统",
			summary:
				"正在为客户定制的档案资料自动识别与分类系统，目前处于开发阶段，尚未完整交付。目标是把原来靠人工翻阅、判断、归档的流程改为自动处理：识别文档类型与关键字段，按分类表匹配归类，无法确定的条目转人工复核，最后输出归档成果与报表。系统按数据流节点拆分，每个环节可单独评测成功率；测试数据分级管理，最终正确率以已验收数据为基准。因涉及客户资料，具体业务与数据细节不便展开。",
			metrics: [
				{ value: "在建", label: "客户定制，尚未完整交付" },
				{ value: "逐环节", label: "每个处理环节可单独评测" },
				{ value: "三级", label: "测试数据分级，以验收数据为准" },
			],
			tags: ["Python", "OCR", "文档分类", "人工复核", "定制交付"],
		},
		{
			name: "Embassy Preempt",
			role: "核心开发",
			meta: "Rust 异步抢占式 RTOS 调度模块",
			summary:
				"将 Rust 协程与传统 RTOS 的抢占式调度结合：任务主动让权时复用程序栈，被抢占时才分配私有栈。2025 年底起负责 RISC-V 平台适配，在 VisionFive2 上以 S7 核（运行实时任务）与 U74 核（运行 StarryOS）构成一套 AMP 方案，两核通过共享内存完成双向通知与 RPC 调用。",
			metrics: [
				{ value: "约 53%", label: "64 个任务时的栈内存节省" },
				{ value: "378 条", label: "一次上下文切换的指令数" },
				{ value: "5~6 倍", label: "核间通信延迟比官方 AMP 低" },
			],
			tags: ["Rust", "RISC-V", "VisionFive2 / JH7110", "L2 Cache LIM", "SPL 自搬运"],
			code: "https://github.com/Oveln/embassy_preempt_VisionFive2",
		},
		{
			name: "ov-channels",
			role: "作者",
			meta: "no_std 无锁共享内存通信库",
			summary:
				"为上述 AMP 方案编写的通信库。采用环形缓冲实现无锁收发，提供 Notification、Data、RPC 请求与响应四种消息，每帧定长 256 字节。no_std，可直接用于裸机环境，是两个内核之间唯一的数据通路。",
			metrics: [
				{ value: "no_std", label: "可直接用于裸机环境" },
				{ value: "4 种", label: "消息类型" },
				{ value: "无锁", label: "环形缓冲，不依赖 CAS" },
			],
			tags: ["Rust", "共享内存", "Ring Buffer", "AMP"],
			code: "https://github.com/Oveln/ov-channels",
		},
		{
			name: "Rust for Linux 驱动跨内核复用",
			role: "独立完成",
			meta: "用 Rust 重写 PL011 串口驱动",
			summary:
				"当时 Rust for Linux 尚未提供 uart_driver、uart_port、console 等结构体的封装，需要自行实现：以 vtable 模式将 C 侧函数指针封装为 Rust trait。最终同一份驱动可在 Linux 与 ArceOS 上运行，并梳理了串口子系统的注册关系。",
			metrics: [
				{ value: "2 个内核", label: "同一份驱动运行于两个内核" },
				{ value: "0 → 1", label: "补齐当时社区缺失的封装" },
				{ value: "Raspi + QEMU", label: "已在硬件与模拟器上验证" },
			],
			tags: ["Rust for Linux", "TTY / UART", "跨内核驱动框架", "unsafe 抽象"],
			code: "https://github.com/Oveln/R4L_DRV",
		},
		{
			name: "Oveln Blog · 内容管线 + AI 写作流",
			role: "作者与维护者",
			meta: "本站自身，持续运行",
			summary:
				"本站自身即是一例。以 Markdown 为唯一内容源，经 unified/remark/rehype 输出 HTML、RSS、纯文本与搜索索引，代码高亮与公式在 AST 层处理；版本管理采用「快照 + 增量补丁」记录每次修改；写作流程为 idea → 讨论 → 共识 → 成稿，讨论环节通过 SSE 实时输出。",
			metrics: [
				{ value: "4 种", label: "同一份 Markdown 的输出格式" },
				{ value: "快照 + Patch", label: "每次修改均可回退" },
				{ value: "SSE", label: "讨论过程实时输出" },
			],
			tags: ["SvelteKit", "unified / remark", "Shiki", "版本控制", "Agent Harness"],
			code: "https://github.com/Oveln/ov-blog",
		},
	];

	const stack: { group: string; items: string[] }[] = [
		{ group: "语言", items: ["Rust", "TypeScript", "Python", "C", "Kotlin", "Java", "Lua"] },
		{
			group: "系统与内核",
			items: [
				"RISC-V",
				"Linux Kernel",
				"Rust for Linux",
				"OpenSBI",
				"U-Boot",
				"ArceOS / StarryOS",
				"RTOS",
			],
		},
		{
			group: "AI 与 Agent",
			items: ["LLM 应用", "Agent 编排", "RAG / 知识库", "SSE 流式输出", "本地推理", "Ollama / ROCm"],
		},
		{
			group: "前后端与工程",
			items: [
				"SvelteKit / Svelte 5",
				"Tailwind CSS v4",
				"Bun / Node",
				"Docker",
				"vitest",
				"本地 / S3 存储",
			],
		},
	];

	const steps = [
		{ title: "需求沟通", desc: "明确要解决的问题、验收标准与预算范围。" },
		{ title: "原型验证", desc: "先实现最小可用版本，验证风险最高的部分，再决定是否继续投入。" },
		{ title: "分阶段交付", desc: "按阶段推进，每个阶段完成后均可独立运行验证。" },
		{ title: "移交与维护", desc: "文档、部署方式移交，并负责上线后的维护。" },
	];

	const principles = [
		{ title: "提前说明", desc: "预算、周期和技术风险提前说明。" },
		{ title: "测试验收", desc: "关键功能需有测试，验收以测试结果为准。" },
	];

	const contacts: Contact[] = [
		{ label: "oveln1024", hint: "微信，点击复制", icon: MessageSquare, copy: "oveln1024" },
		{ label: "oveln@outlook.com", href: "mailto:oveln@outlook.com", icon: Mail, hint: "邮件" },
		{ label: "github.com/Oveln", href: "https://github.com/Oveln", icon: CodeXml, hint: "GitHub" },
	];
</script>

<svelte:head>
	<title>郑昱可 Oveln · 定制软件与企业智能化</title>
	<meta
		name="description"
		content="郑昱可（Oveln），系统软件工程师，现在自己做智能服务方向的创业。给企业做定制软件，也做公司内部的智能化改造。主要写 Rust，做过 RISC-V 内核、嵌入式实时系统和 AI Agent 落地。"
	/>
	<meta property="og:title" content="郑昱可 Oveln · 定制软件与企业智能化" />
	<meta
		property="og:description"
		content="智能服务 / 定制软件 / 企业智能化改造 / 技术咨询"
	/>
	<meta property="og:type" content="profile" />
</svelte:head>

<main class="animate-fade-up min-h-[calc(100vh-56px)] px-4 py-6 sm:px-6 md:px-8 md:py-8">
	<div class="mx-auto max-w-5xl space-y-10 sm:space-y-14 md:space-y-16">
		<section class="relative overflow-hidden rounded-2xl border bg-card p-5 sm:p-6 md:p-10">
			<div
				class="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
			></div>
			<div
				class="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
			></div>

			<div class="relative">
				<div class="space-y-4 pt-2">
					<div class="flex flex-wrap items-center gap-2">
						<span
							class="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
						>
							<Sparkles class="h-3.5 w-3.5" />
							智能服务 / 定制软件 / 企业智能化改造
						</span>
						<span
							class="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
						>
							<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
							可以接新项目
						</span>
					</div>

					<div class="space-y-2">
						<h1
							class="bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text pb-1 font-mono text-2xl leading-[1.3] font-bold text-transparent sm:text-3xl md:text-4xl dark:from-gray-100 dark:to-gray-400"
						>
							郑昱可 <span class="text-xl sm:text-2xl md:text-3xl">/ Oveln</span>
						</h1>
						<p class="font-mono text-sm text-muted-foreground">
							个人开发者 · 系统软件工程师
						</p>
					</div>

					<p class="max-w-2xl leading-relaxed text-muted-foreground">
						技术背景为 Rust 与操作系统内核方向，为企业提供定制软件开发与企业内部智能化改造。
					</p>

					<div class="flex flex-wrap gap-3 pt-1">
						<a
							href="mailto:oveln@outlook.com"
							class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
						>
							<Mail class="h-4 w-4" />
							邮件联系
							<ArrowRight class="h-4 w-4" />
						</a>
						<a
							href="https://github.com/Oveln"
							target="_blank"
							rel="noopener noreferrer"
							class="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
						>
							<CodeXml class="h-4 w-4" />
							GitHub
							<ExternalLink class="h-3.5 w-3.5 opacity-60" />
						</a>
						<a
							href={resolve("/blogs")}
							class="inline-flex items-center gap-2 rounded-md border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
						>
							<ScrollText class="h-4 w-4" />
							技术博客
						</a>
					</div>
				</div>
			</div>

			<div class="relative mt-8 grid grid-cols-2 gap-x-3 gap-y-5 border-t pt-6 md:grid-cols-4 md:gap-x-4">
				{#each stats as stat (stat.label)}
					<div>
						<div class="font-mono text-lg font-bold sm:text-xl md:text-2xl">{stat.value}</div>
						<div class="mt-1 text-xs text-muted-foreground">{stat.label}</div>
					</div>
				{/each}
			</div>
		</section>

		<section class="space-y-6">
			<div class="flex items-center gap-2">
				<Briefcase class="h-5 w-5 text-muted-foreground" />
				<h2 class="font-mono text-xl font-semibold sm:text-2xl">能做什么</h2>
			</div>

			<div class="grid gap-5 md:grid-cols-3">
				{#each services as service (service.title)}
					{@const Icon = service.icon}
					<div
						class="flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6"
					>
						<div class="flex items-center gap-2">
							<Icon class="h-5 w-5" />
							<h3 class="font-mono font-semibold">{service.title}</h3>
						</div>
						<p class="mt-3 text-sm leading-relaxed text-muted-foreground">{service.desc}</p>
						<ul class="mt-4 space-y-2 border-t pt-4 text-sm">
							{#each service.items as item (item)}
								<li class="flex gap-2">
									<Check class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
									<span class="text-muted-foreground">{item}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</section>

		<section class="space-y-6">
			<div class="flex items-center gap-2">
				<Handshake class="h-5 w-5 text-muted-foreground" />
				<h2 class="font-mono text-xl font-semibold sm:text-2xl">合作方式</h2>
			</div>

			<div class="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
				{#each steps as step, index (step.title)}
					<div class="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
						<div class="font-mono text-xs font-semibold text-muted-foreground">
							0{index + 1}
						</div>
						<h3 class="mt-3 font-mono font-semibold">{step.title}</h3>
						<p class="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
					</div>
				{/each}
			</div>

			<div class="grid gap-4 rounded-xl bg-muted/50 p-5 sm:grid-cols-2 sm:gap-5 sm:p-6">
				{#each principles as principle (principle.title)}
					<div class="flex gap-3">
						<BadgeCheck class="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
						<div>
							<h3 class="font-mono text-sm font-semibold">{principle.title}</h3>
							<p class="mt-1 text-sm text-muted-foreground">{principle.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<section class="relative overflow-hidden rounded-2xl border bg-card p-5 sm:p-6 md:p-10">
			<div
				class="pointer-events-none absolute -top-24 left-1/3 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
			></div>
			<div class="relative space-y-6">
				<div class="space-y-3">
					<div class="flex items-center gap-2">
						<Target class="h-5 w-5 text-muted-foreground" />
						<h2 class="font-mono text-xl font-semibold sm:text-2xl">联系我</h2>
					</div>
					<p class="max-w-2xl text-muted-foreground">
						如有软件定制或内部流程智能化改造的需求，欢迎邮件联系。
					</p>
				</div>

				<div class="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
					<div class="grid gap-3 sm:grid-cols-2">
						{#each contacts as contact (contact.label)}
							{@const Icon = contact.icon}
							{#if contact.href}
								<a
									href={contact.href}
									target={contact.href.startsWith("mailto:") ? undefined : "_blank"}
									rel="noopener noreferrer"
									class="group flex items-center gap-3 rounded-lg border bg-background p-4 transition-colors hover:bg-accent"
								>
									<Icon class="h-5 w-5 shrink-0 text-muted-foreground" />
									<div class="min-w-0 flex-1">
										<div class="truncate font-mono text-sm font-medium">{contact.label}</div>
										<div class="text-xs text-muted-foreground">{contact.hint}</div>
									</div>
									<ArrowRight
										class="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
									/>
								</a>
							{:else}
								<button
									type="button"
									onclick={() => copyText(contact.copy ?? contact.label)}
									class="group flex w-full items-center gap-3 rounded-lg border bg-background p-4 text-left transition-colors hover:bg-accent"
								>
									<Icon class="h-5 w-5 shrink-0 text-muted-foreground" />
									<div class="min-w-0 flex-1">
										<div class="truncate font-mono text-sm font-medium">{contact.label}</div>
										<div class="text-xs text-muted-foreground">
											{copiedLabel === (contact.copy ?? contact.label) ? "已复制" : contact.hint}
										</div>
									</div>
									{#if copiedLabel === (contact.copy ?? contact.label)}
										<Check class="h-4 w-4 shrink-0 text-emerald-500" />
									{:else}
										<Copy class="h-4 w-4 shrink-0 text-muted-foreground" />
									{/if}
								</button>
							{/if}
						{/each}
					</div>

					<div class="flex flex-col items-center gap-3 rounded-lg border bg-background p-4">
						<img
							src="/wechat-qr.png"
							alt="微信二维码：oveln1024"
							width="754"
							height="754"
							class="h-40 w-40 rounded-md object-contain md:h-44 md:w-44"
						/>
						<p class="text-xs text-muted-foreground">微信扫码添加</p>
					</div>
				</div>
			</div>
		</section>
		<section class="space-y-6">
			<div class="flex items-center gap-2">
				<Cpu class="h-5 w-5 text-muted-foreground" />
				<h2 class="font-mono text-xl font-semibold sm:text-2xl">技术能力</h2>
			</div>

			<div class="grid gap-5 sm:grid-cols-2">
				{#each capabilities as capability (capability.title)}
					{@const Icon = capability.icon}
					<div
						class="rounded-xl border bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6"
					>
						<div class="flex items-center gap-2">
							<Icon class="h-5 w-5" />
							<h3 class="font-mono font-semibold">{capability.title}</h3>
						</div>
						<p class="mt-3 text-sm leading-relaxed text-muted-foreground">{capability.desc}</p>
						<div class="mt-4 flex flex-wrap gap-2 border-t pt-4">
							{#each capability.tags as tag (tag)}
								<span
									class="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs text-secondary-foreground"
								>
									{tag}
								</span>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>

		<section class="space-y-6">
			<div class="flex items-center gap-2">
				<Rocket class="h-5 w-5 text-muted-foreground" />
				<h2 class="font-mono text-xl font-semibold sm:text-2xl">代表项目</h2>
			</div>
			<div class="space-y-5">
				{#each projects as project (project.name)}
					<article
						class="rounded-xl border bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-6 md:p-7"
					>
						<div class="flex flex-wrap items-start justify-between gap-3">
							<div class="space-y-1">
								<h3 class="font-mono text-lg font-semibold">{project.name}</h3>
								<p class="text-xs text-muted-foreground">
									{project.role} · {project.meta}
								</p>
							</div>
							<div class="flex flex-wrap items-center gap-2">
								{#if project.link}
									<a
										href={project.link.href}
										target="_blank"
										rel="noopener noreferrer"
										class="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent"
									>
										{project.link.label}
										<ExternalLink class="h-3.5 w-3.5" />
									</a>
								{/if}
								{#if project.code}
									<a
										href={project.code}
										target="_blank"
										rel="noopener noreferrer"
										class="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent"
									>
										查看代码
										<ExternalLink class="h-3.5 w-3.5" />
									</a>
								{/if}
							</div>
						</div>

						<p class="mt-4 text-sm leading-relaxed text-muted-foreground">{project.summary}</p>

						<div class="mt-5 grid grid-cols-1 gap-2.5 border-y py-4 sm:grid-cols-3 sm:gap-4">
							{#each project.metrics as metric (metric.label)}
								<div class="flex items-baseline justify-between gap-3 sm:block">
									<div class="shrink-0 font-mono text-base font-bold">{metric.value}</div>
									<div class="text-right text-xs text-muted-foreground sm:mt-0.5 sm:text-left">
										{metric.label}
									</div>
								</div>
							{/each}
						</div>

						<div class="mt-4 flex flex-wrap gap-2">
							{#each project.tags as tag (tag)}
								<span
									class="rounded-md bg-secondary px-2 py-0.5 font-mono text-xs text-secondary-foreground"
								>
									{tag}
								</span>
							{/each}
						</div>
					</article>
				{/each}
			</div>
		</section>

		<section class="space-y-6">
			<div class="flex items-center gap-2">
				<Terminal class="h-5 w-5 text-muted-foreground" />
				<h2 class="font-mono text-xl font-semibold sm:text-2xl">技术栈</h2>
			</div>

			<div class="grid gap-5 sm:grid-cols-2">
				{#each stack as group (group.group)}
					<div class="rounded-xl border bg-card p-5 sm:p-6">
						<h3 class="font-mono text-sm font-semibold text-muted-foreground">{group.group}</h3>
						<div class="mt-4 flex flex-wrap gap-2">
							{#each group.items as item (item)}
								<span
									class="rounded-md border border-transparent bg-secondary px-2.5 py-0.5 font-mono text-xs font-semibold text-secondary-foreground transition-transform hover:scale-105"
								>
									{item}
								</span>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</section>

	</div>
</main>

<style>
	@media print {
		:global(nav),
		:global(footer) {
			display: none !important;
		}
	}
</style>
