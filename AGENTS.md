# Oveln Blog v2

## 命令

- `bun dev` — 开发服务器
- `bun run build` — 生产构建
- `bun run preview` — 预览生产构建
- `bun run check` — svelte-check 类型检查
- `bun test` — 运行测试
- `bun run test:watch` — 监听模式运行测试

## 架构

- **Runtime**: Bun
- **Framework**: SvelteKit (adapter-node)
- **Styling**: Tailwind CSS v4 (无 tailwind.config，配置在 `src/app.css`)
- **UI**: shadcn-svelte (new-york) + bits-ui
- **Icons**: lucide-svelte
- **Theme**: mode-watcher (dark/light)
- **Content Pipeline**: unified + remark + rehype
- **Syntax Highlight**: Shiki (github-dark/github-light 双主题)
- **Math**: remark-math + rehype-katex
- **Testing**: vitest
- **Editor**: Milkdown (仅 UI 层)
- **Auth**: jose
- **AI**: Vercel AI SDK

## 代码风格

- Svelte 5 runes 模式（`$state`, `$derived`, `$effect` 等）
- TypeScript strict
- 组件放在 `$lib/components/`
- UI 组件放在 `$lib/components/ui/`
- 布局组件放在 `$lib/components/layout/`
- 不添加任何注释，除非被要求
- 组件文件名使用 PascalCase（如 `AppCard.svelte`, `NavMenu.svelte`）

## 项目结构

```text
src/
├── lib/
│   ├── components/          # 业务组件
│   │   ├── ui/              # shadcn-svelte UI 组件
│   │   └── layout/          # 布局组件 (NavMenu, Footer)
│   ├── content/             # Content Pipeline 核心
│   │   ├── parser.ts        # Markdown → MDAST 解析 + frontmatter 提取
│   │   ├── pipeline.ts      # 统一调度 transforms + renderers
│   │   ├── schema.ts        # 类型导出 + 工具函数
│   │   ├── transforms/      # AST 级别的数据提取与变换
│   │   │   ├── toc.ts       # 目录提取 (h2/h3)
│   │   │   ├── excerpt.ts   # 摘要提取 (首段截断)
│   │   │   ├── reading-time.ts # 阅读时间 (中英混合)
│   │   │   ├── code-highlight.ts # Shiki 代码高亮
│   │   │   └── math.ts      # 数学公式插件
│   │   ├── renderers/       # 不同输出目标
│   │   │   ├── html.ts      # AST → HTML (rehype)
│   │   │   ├── rss.ts       # RSS 2.0 XML
│   │   │   ├── text.ts      # AST → 纯文本
│   │   │   └── search.ts    # 搜索索引条目
│   │   └── types/
│   │       └── post.ts      # PostFrontmatter / PostMeta / PostContent 等
│   └── utils.ts             # cn() 工具函数
├── routes/                  # SvelteKit 路由
├── app.css                  # Tailwind v4 主题变量 + 动画
├── app.html                 # HTML 模板 (字体, lang)
└── app.d.ts                 # 类型声明
```

## Content Pipeline 数据流

```text
Markdown + Frontmatter
    ↓ gray-matter
ParsedPost (meta + content)
    ↓ unified/remark-parse
MDAST
    ↓ transforms
┌───────────────────────────────┐
│ toc / excerpt / reading-time  │  ← AST 级别提取
│ code-highlight (Shiki)        │  ← AST 节点替换
└───────────────────────────────┘
    ↓ renderers
HTML / RSS / Plain Text / Search Entry
```

## 测试规范

- 测试框架: vitest
- 测试目录: `src/lib/**/__tests__/`
  - `unit/` — 单元测试，每个模块一个文件
  - `integration/` — 集成测试，跨模块协作验证
- 运行: `bun test`
- 测试内容需覆盖: 正常路径、边界情况（空输入、超长输入）、中英文混合

## 开发约束

- 主题变量使用 HSL（非 oklch），与旧站保持一致
- 字体: JetBrains Mono + Noto Sans SC (Google Fonts CDN)
- `mode-watcher` v1 API: 使用 `mode.current`（runes），非 `$mode`（store）
- `Input` 组件需 `value = $bindable("")` 才支持 `bind:value`
- `lucide-svelte` v1 没有 `Github` 图标，使用替代方案
- Milkdown 仅作为编辑器 UI 层，不是 renderer，不是数据源
- Markdown + Frontmatter 是唯一 canonical source
- Docker + adapter-node 部署

## 重构计划

详见 `docs/REFACTOR_PLAN.md`
