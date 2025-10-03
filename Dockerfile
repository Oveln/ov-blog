# =============================================================================
# Base Stage - 基础镜像，包含系统依赖
# =============================================================================
FROM oven/bun:1-alpine AS base

# 安装系统依赖，这些很少变化，可以有效缓存
RUN apk add --no-cache \
    ca-certificates \
    wget \
    && rm -rf /var/cache/apk/*

# 创建非 root 用户，这些配置很少变化
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# =============================================================================
# Dependencies Stage - 安装依赖
# =============================================================================
FROM base AS deps

# 只复制包管理文件，这样当源代码变化时不会影响依赖缓存
COPY package.json bun.lock* bunfig.toml ./

# 安装所有依赖（包括开发依赖，用于构建）
RUN bun install --frozen-lockfile

# =============================================================================
# Builder Stage - 构建应用
# =============================================================================
FROM base AS builder

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules

# 复制 Prisma schema，需要在 generate 之前
COPY prisma ./prisma

# 生成 Prisma 客户端，这步骤在源代码复制之前，提高缓存效率
RUN bun run prisma generate

# 复制配置文件，这些文件变化频率相对较低
COPY  package.json .bunfig.toml bun.lock* next.config.mjs tsconfig.json postcss.config.js tailwind* components.json ./

# 复制源代码，这个放在最后因为变化最频繁
COPY src ./src
COPY public ./public

# 设置构建环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV BUILDING=true

# 构建应用
RUN bun run --bun build

# =============================================================================
# Production Dependencies Stage - 生产依赖
# =============================================================================
FROM base AS prod-deps

# 只复制包管理文件
COPY package.json bun.lock* bunfig.toml ./

# 只安装生产依赖
RUN bun install --frozen-lockfile --production

# =============================================================================
# Runtime Stage - 运行时镜像
# =============================================================================
FROM base AS runtime

# 设置生产环境变量
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 复制生产依赖
COPY --from=prod-deps /app/node_modules ./node_modules

# 复制 Prisma 相关文件（用于 migrate）
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# 复制构建产物 - Next.js standalone 输出
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# 创建必要的目录并设置权限
RUN mkdir -p .next && \
    chown -R nextjs:nodejs /app

# 切换到非 root 用户
USER nextjs

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# 启动命令 - 先运行数据库迁移，然后启动应用
CMD ["sh", "-c", "bunx prisma migrate deploy && bun --bun run start"]
