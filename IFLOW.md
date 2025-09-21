# Oveln Blog 项目说明

## 项目概述

Oveln Blog 是一个使用 Next.js 15 构建的现代化个人博客平台。它支持 Markdown 文章编辑、版本控制、用户认证、评论系统等功能。

## 技术栈

- **前端**: Next.js 15, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **后端**: Next.js API Routes, Prisma ORM, PostgreSQL, NextAuth.js
- **其他**: Cherry Markdown 编辑器, KaTeX 数学公式支持, Giscus 评论系统

## 核心功能

- 🔐 GitHub OAuth 登录
- 📝 Cherry Markdown 编辑器
- ✨ 代码高亮 (rehype-pretty-code & Shiki)
- 🔢 数学公式支持 (KaTeX)
- 💬 评论系统 (Giscus)
- 🌓 深色模式
- 📱 响应式设计

## 项目结构

```
src/
├── app/                # Next.js 应用路由
│   ├── (site)/        # 公开页面
│   ├── (dashboard)/   # 管理后台
│   └── (auth)/        # 认证相关
├── components/        # React 组件
├── lib/              # 工具函数
├── context/          # React Context
└── types/            # TypeScript 类型定义
```

## 快速开始

### 环境要求

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL

### 本地开发

1. 克隆仓库
2. 安装依赖: `bun install`
3. 配置环境变量: `cp .env.example .env`
4. 启动开发服务器: `bun dev`

### Docker 部署

1. 构建并启动服务: `docker-compose up -d`
2. 执行数据库迁移: `docker-compose exec web npx prisma migrate deploy`
3. 查看日志: `docker-compose logs -f`

## 主要功能

### 内容管理
- Markdown 文章编辑
- 文章版本控制
- 草稿和发布管理

### 用户系统
- GitHub OAuth 登录
- 用户角色管理（管理员/普通用户）

### 展示功能
- 响应式设计
- 深色模式
- 代码高亮
- 数学公式
- 评论系统

### 管理功能
- 文章管理
- 应用管理
- 用户管理（管理员）

## 开发与构建

- 开发模式: `bun dev`
- 构建项目: `bun build`
- 启动生产环境: `bun start`
- 代码检查: `bun lint`

## 部署说明

项目支持 Docker 部署，配置文件在 `docker-compose.yml` 中。需要配置以下环境变量：
- GitHub OAuth 配置
- Giscus 评论系统配置
- 数据库连接信息