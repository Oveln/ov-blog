# Oveln Blog

Markdown-first 的个人博客与知识管理系统，基于 SvelteKit 构建。

## 核心理念

```text
Markdown 作为唯一内容源
AST 作为中间表示
Content Pipeline 作为处理核心
```

内容以 Markdown + Frontmatter 格式存储，经过 unified/remark/rehype 管线处理，输出 HTML、RSS、纯文本、搜索索引等多种格式。

## 技术栈

| 层 | 选型 |
|---|---|
| Runtime | Bun |
| Framework | SvelteKit (adapter-node) |
| Styling | Tailwind CSS v4 |
| UI | shadcn-svelte + bits-ui |
| Content Pipeline | unified + remark + rehype |
| Syntax Highlight | Shiki |
| Math | KaTeX |
| Testing | vitest |
| Deploy | Docker |

## 架构

```text
┌─────────────────────────────────────────────────┐
│                   UI Layer                       │
│  SvelteKit Routes + shadcn-svelte + Tailwind     │
├─────────────────────────────────────────────────┤
│                 Service Layer                    │
│  Post CRUD · App CRUD · Versioning · Index      │
├─────────────────────────────────────────────────┤
│             Content Pipeline (Core)              │
│                                                   │
│  Markdown ──→ MDAST ──→ Transforms ──→ Renderers │
│               │          │              │         │
│          remark-parse   TOC         HTML          │
│          remark-gfm    Excerpt     RSS            │
│          remark-math   ReadingTime PlainText      │
│                       CodeHighlight SearchIndex  │
├─────────────────────────────────────────────────┤
│               Storage Layer                      │
│        Local FS ─┐  ┌─ S3/R2                     │
│                  └──┘                             │
└─────────────────────────────────────────────────┘
```

## 项目结构

```text
src/
├── lib/
│   ├── components/          # 业务组件 + UI 组件
│   ├── content/             # Content Pipeline 核心
│   │   ├── parser.ts        # frontmatter 解析 + MDAST 生成
│   │   ├── pipeline.ts      # 统一调度入口
│   │   ├── transforms/      # AST 级别变换
│   │   └── renderers/       # 多格式输出
│   └── utils.ts
├── routes/                  # 页面路由
└── app.css                  # Tailwind 主题
```

## 开发

```sh
bun install
bun dev        # 开发服务器
bun test       # 运行测试
bun run build  # 生产构建
```
