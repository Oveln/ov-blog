# Oveln Blog

一个使用 Next.js 15 构建的现代化个人博客平台。

## 特性

### 技术栈

- **前端**
    - Next.js 15
    - React 18
    - TypeScript
    - Tailwind CSS
    - shadcn/ui

- **后端**
    - Next.js API Routes
    - Prisma ORM
    - PostgreSQL
    - NextAuth.js

### 核心功能

- 🔐 GitHub OAuth 登录
- 📝 Cherry Markdown 编辑器
- ✨ 代码高亮 (rehype-pretty-code & Shiki)
- 🔢 数学公式支持 (KaTeX)
- 💬 评论系统 (Giscus)
- 🌓 深色模式
- 📱 响应式设计

## 快速开始

### 环境要求

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL

### 本地开发

1. 克隆仓库

    ```bash
    git clone https://github.com/Oveln/ov-blog.git
    cd ov-blog
    ```

2. 安装依赖

    ```bash
    bun install
    ```

3. 配置环境变量

    ```bash
    cp .env.example .env
    ```

    编辑 `.env` 文件，填入必要的环境变量。

4. 启动开发服务器
    ```bash
    bun dev
    ```

### Docker 部署

1. 构建并启动服务

    ```bash
    docker-compose up -d
    ```

2. 执行数据库迁移

    ```bash
    docker-compose exec web npx prisma migrate deploy
    ```

3. 查看日志
    ```bash
    docker-compose logs -f
    ```

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

## 部署

### 使用 Docker Compose

创建 `docker-compose.yml` 文件：

```yaml
version: "3.9"

services:
    db:
        image: postgres
        restart: always
        environment:
            POSTGRES_PASSWORD: YOUR_DB_PASSWORD
        networks:
            - backend

    web:
        image: oveln/ov-blog
        restart: always
        ports:
            - 3000:3000
        environment:
            # GitHub OAuth 配置
            AUTH_GITHUB_ID: your_github_oauth_id
            AUTH_GITHUB_SECRET: your_github_oauth_secret
            AUTH_SECRET: your_auth_secret
            AUTH_URL: http://your.domain.com/
            AUTH_TRUST_HOST: "true"

            # Giscus 评论系统配置
            WEBHOOK_SECRET: your_webhook_secret
            NEXT_PUBLIC_REPO_NAME: "Your/Repo"
            NEXT_PUBLIC_REPOID: "your_repo_id"
            NEXT_PUBLIC_CATEGORY: "Announcements"
            NEXT_PUBLIC_CATEGORYID: "your_category_id"

            # R2 存储配置
            R2_ACCOUNT_ID: your_r2_account_id
            R2_ACCESS_KEY_ID: your_r2_access_key_id
            R2_SECRET_ACCESS_KEY: your_r2_secret_access_key

            # 数据库配置
            DATABASE_URL: "postgresql://user:password@db:5432/blog?schema=public"
        networks:
            - backend

networks:
    backend:
```

### 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

请确保在启动服务前正确配置所有环境变量。

## 贡献指南

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

- 作者：Oveln
- 邮箱：oveln@outlook.com
- 博客：[oveln.icu](https://oveln.icu)

## 致谢

感谢以下开源项目：

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Cherry Markdown](https://github.com/Tencent/cherry-markdown)
- [Prisma](https://www.prisma.io/)
