# Oveln Blog v2

## 命令

- `bun dev` — 开发服务器
- `bun run build` — 生产构建
- `bun run preview` — 预览生产构建
- `bun run check` — svelte-check 类型检查

## 架构

- **Runtime**: Bun
- **Framework**: SvelteKit (adapter-node)
- **Styling**: Tailwind CSS v4 (无 tailwind.config，配置在 `src/app.css`)
- **UI**: shadcn-svelte (new-york) + bits-ui
- **Icons**: lucide-svelte
- **Theme**: mode-watcher (dark/light)
- **Content Pipeline**: unified + remark + rehype
- **Editor**: Milkdown (仅 UI 层)
- **Auth**: jose
- **AI**: Vercel AI SDK

## 代码风格

- Svelte 5 runes 模式
- TypeScript strict
- 组件放在 `$lib/components/`
- UI 组件放在 `$lib/components/ui/`

## 重构计划

详见 `docs/REFACTOR_PLAN.md`
