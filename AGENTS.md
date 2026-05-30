# Oveln Blog v2

## 命令

- `bun dev` — 开发服务器
- `bun run build` — 生产构建
- `bun run preview` — 预览生产构建
- `bun run check` — svelte-check 类型检查（必须 0 error 0 warning）
- `bun test` — 运行测试
- `bun run test:watch` — 监听模式运行测试
- `bun run setup` — 终端 TOTP setup 脚本

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
- **Editor**: SourceEditor（自建，非 Milkdown）
- **Auth**: jose (JWT + TOTP)
- **Version Control**: diff (npm) + VersionedStore (snapshot + patch)
- **Storage**: 抽象层（Local filesystem / S3）

## 代码风格

- Svelte 5 runes 模式（`$state`, `$derived`, `$effect` 等）
- TypeScript strict
- 组件放在 `$lib/components/`
- UI 组件放在 `$lib/components/ui/`
- 布局组件放在 `$lib/components/layout/`
- 不添加任何注释，除非被要求
- 组件文件名使用 PascalCase（如 `AppCard.svelte`, `NavMenu.svelte`）
- `$state()` 初始化不能引用其他响应式变量（`$props`、`$derived` 等），如需从 prop 初始化可编辑状态，加 `// svelte-ignore state_referenced_locally`

## 项目结构

```text
src/
├── lib/
│   ├── components/          # 业务组件
│   │   ├── AppCard.svelte   # 应用卡片
│   │   ├── PostCard.svelte  # 文章卡片
│   │   ├── Typing.svelte    # 打字动画
│   │   ├── ui/              # shadcn-svelte UI 组件
│   │   ├── layout/          # 布局组件 (NavMenu, Footer)
│   │   ├── editor/          # SourceEditor + EditorToolbar
│   │   └── version/         # VersionGraph (d3-force 版本图)
│   ├── auth/                # 认证模块
│   │   └── session.ts       # JWT 创建/验证 + TOTP + session cookie
│   ├── content/             # Content Pipeline 核心
│   │   ├── index.ts         # barrel 导出
│   │   ├── parser.ts        # Markdown → MDAST 解析
│   │   ├── pipeline.ts      # 统一调度 transforms + renderers
│   │   ├── schema.ts        # 类型导出 + 工具函数
│   │   ├── frontmatter.ts   # Frontmatter 序列化
│   │   ├── ast.ts           # AST 工具函数
│   │   ├── transforms/      # AST 级别的数据提取与变换
│   │   │   ├── toc.ts       # 目录提取 (h2/h3)
│   │   │   ├── excerpt.ts   # 摘要提取 (首段截断)
│   │   │   ├── reading-time.ts # 阅读时间 (中英混合)
│   │   │   └── code-highlight.ts # Shiki 代码高亮
│   │   └── renderers/       # 不同输出目标
│   │       ├── html.ts      # AST → HTML (rehype)
│   │       ├── rss.ts       # RSS 2.0 XML
│   │       ├── text.ts      # AST → 纯文本
│   │       └── search.ts    # 搜索索引条目
│   ├── server/              # 服务端逻辑
│   │   └── posts.ts         # 文章 CRUD + 发布状态管理
│   ├── storage/             # 存储抽象层
│   │   ├── interface.ts     # Storage 接口定义
│   │   ├── local.ts         # 本地文件系统实现
│   │   ├── s3.ts            # S3 实现
│   │   └── index.ts         # 工厂函数
│   ├── version/             # 版本控制系统
│   │   ├── types.ts         # VersionMeta 等类型
│   │   ├── patch.ts         # unified diff/patch
│   │   ├── store.ts         # VersionedStore (snapshot + patch)
│   │   └── index.ts         # 导出
│   └── utils.ts             # cn() 工具函数
├── routes/
│   ├── about/               # 关于页
│   ├── apps/                # 应用页（预留）
│   ├── blogs/               # 博客前台（列表 + 详情）
│   ├── dashboard/           # 后台管理
│   │   ├── login/           # 登录页
│   │   ├── settings/        # 设置页
│   │   ├── write/           # 写文章
│   │   ├── edit/[slug]/     # 编辑文章
│   │   └── versions/[slug]/ # 版本历史
│   ├── api/                 # API 路由
│   │   ├── auth/            # 认证 (login/logout/setup)
│   │   ├── posts/           # 文章 CRUD + 发布
│   │   └── versions/        # 版本查询 + 切换
│   ├── rss.xml/             # RSS feed
│   └── sitemap.xml/         # Sitemap
├── hooks.server.ts          # JWT 认证守卫
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

- 主题变量使用 oklch（感知均匀色彩空间）
- 字体: JetBrains Mono + Noto Sans SC (Google Fonts CDN)
- `mode-watcher` v1 API: 使用 `mode.current`（runes），非 `$mode`（store）
- `Input` 组件需 `value = $bindable("")` 才支持 `bind:value`
- `lucide-svelte` v1 没有 `Github` 图标，使用替代方案
- Markdown + Frontmatter 是唯一 canonical source
- Docker + adapter-node 部署
- `bun run check` 必须通过且无 warning
