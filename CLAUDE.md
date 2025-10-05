# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 开发命令

- `bun dev` - 启动开发服务器（使用 turbo）
- `bun build` - 构建生产版本（使用 turbo）
- `bun start` - 启动生产服务器
- `bun lint` - 运行 ESLint 代码检查

### 数据库命令
- `bunx prisma migrate dev` - 运行数据库迁移（开发环境）
- `bunx prisma generate` - 生成 Prisma 客户端
- `bunx prisma studio` - 打开 Prisma Studio 数据库浏览器

### Docker 部署
- `docker-compose up -d` - 启动所有服务
- `docker-compose logs -f` - 查看日志
- `docker-compose down` - 停止所有服务

## 架构概览

这是一个基于 Next.js 15 的博客应用，使用 App Router 架构，具有以下关键架构模式：

### 技术栈
- **前端**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **后端**: Next.js API Routes, tRPC 类型安全 API, Prisma ORM
- **数据库**: PostgreSQL
- **认证**: NextAuth.js 配合 GitHub OAuth
- **部署**: Docker 容器化部署

### 目录结构
```
src/
├── app/                # Next.js App Router
│   ├── (site)/        # 公开页面（博客、首页）
│   ├── (dashboard)/   # 受保护的管理后台
│   ├── (auth)/        # 认证相关页面
│   └── api/           # API 路由（包括 tRPC）
├── components/        # 可复用 React 组件
├── lib/              # 工具函数、认证、数据库、tRPC 客户端
├── server/           # tRPC 服务器配置和路由
├── context/          # React 上下文
└── types/            # TypeScript 类型定义
```

### 核心架构模式

1. **App Router 结构**: 使用路由组 `(site)`、`(dashboard)`、`(auth)` 分离关注点，同时保持共享布局

2. **tRPC 集成**:
   - 服务端: `src/server/trpc/` - 定义不同权限级别的程序（公开、需认证、管理员）
   - 客户端: `src/lib/trpc.ts` - tRPC React 客户端配置
   - 使用 superjson 进行数据转换

3. **认证流程**:
   - NextAuth.js 配合 GitHub OAuth 提供商
   - 基于会话的认证，中间件保护仪表板路由
   - 用户角色: GUEST（访客）, USER（用户）, ADMIN（管理员）（存储在 Prisma User 模型中）

4. **数据库模式**:
   - 用户模型包含基于角色的权限
   - 文章模型用于博客文章
   - 标准的 NextAuth.js 认证表（Account、Session 等）

5. **中间件保护**: `src/middleware.ts` 通过检查认证会话令牌来保护仪表板路由

6. **内容管理**:
   - Cherry Markdown 编辑器用于富文本内容编辑
   - 支持代码高亮（rehype-pretty-code, Shiki）
   - 数学公式支持（KaTeX）
   - 与 R2 存储集成的文件上传功能

### 环境变量配置

#### 必需的环境变量

**认证相关 (NextAuth.js)**:
- `AUTH_GITHUB_ID` - GitHub OAuth App ID
- `AUTH_GITHUB_SECRET` - GitHub OAuth App Secret
- `AUTH_SECRET` - 使用 `openssl rand -base64 33` 生成的密钥
- `AUTH_URL` - 认证服务 URL，格式如 `https://example.com/api/auth`
- `AUTH_TRUST_HOST` - 是否信任所有主机，反向代理中需设置为 `true`

**数据库**:
- `DATABASE_URL` - PostgreSQL 数据库连接字符串，格式如 `postgresql://username:password@host:port/database`

**评论系统 (Giscus)**:
- `NEXT_PUBLIC_REPO` - GitHub 仓库，格式如 `username/repository`
- `NEXT_PUBLIC_REPOID` - 仓库 ID，从 https://giscus.app 获取
- `NEXT_PUBLIC_CATEGORY` - 评论分类名称
- `NEXT_PUBLIC_CATEGORYID` - 评论分类 ID

**R2 存储配置**:
- `R2_ACCOUNT_ID` - Cloudflare R2 账户 ID
- `R2_ACCESS_KEY_ID` - R2 访问密钥 ID
- `R2_SECRET_ACCESS_KEY` - R2 密钥访问令牌

**Webhook 密钥**:
- `WEBHOOK_SECRET` - 自定义的 webhook 密钥（如果使用 webhook 功能）

#### 环境变量配置示例

```bash
# Github OAuth App 配置
AUTH_GITHUB_ID=your_github_oauth_app_id
AUTH_GITHUB_SECRET=your_github_oauth_app_secret
AUTH_SECRET=generated_secret_here
AUTH_URL=https://yourdomain.com/api/auth
AUTH_TRUST_HOST=true

# 数据库连接
DATABASE_URL=postgresql://username:password@host:5432/blog

# Giscus 评论系统
NEXT_PUBLIC_REPO=your_username/your_repo
NEXT_PUBLIC_REPOID=your_repo_id
NEXT_PUBLIC_CATEGORY=General
NEXT_PUBLIC_CATEGORYID=your_category_id

# R2 存储
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key

# Webhook（可选）
WEBHOOK_SECRET=your_webhook_secret
```

### 部署方式
- 使用多阶段构建的 Docker 容器化
- 生产环境使用 Bun 作为运行时
- 使用 Bun 作为包管理器和运行时

### 重要文件说明
- `src/middleware.ts` - 保护仪表板路由的中间件
- `src/lib/trpc.ts` - tRPC 客户端配置
- `src/server/trpc/trpc.ts` - tRPC 服务端核心配置
- `prisma/schema.prisma` - 数据库模式定义
- `src/lib/env.ts` - 环境变量处理工具