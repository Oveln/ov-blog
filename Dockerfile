# =============================================================================
# 1. Base Stage – 系统依赖 & 非 root 用户
# =============================================================================
FROM oven/bun:1-alpine AS base

RUN apk add --no-cache ca-certificates wget \
 && rm -rf /var/cache/apk/*

RUN addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001

WORKDIR /app

# =============================================================================
# 2. Dependencies Stage – 全量依赖（含 dev）
# =============================================================================
FROM base AS deps

RUN apk add --no-cache git
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile

# =============================================================================
# 3. Builder Stage – 生成 Prisma Client & 构建 Next.js
# =============================================================================
FROM deps AS builder

# 1. 先生成 Prisma Client（依赖 schema）
COPY prisma ./prisma
RUN bunx prisma generate

# 2. 拷贝其余代码
COPY package.json bun.lock bunfig.toml next.config.mjs tsconfig.json \
     postcss.config.js tailwind* components.json ./
COPY src ./src
COPY public ./public

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV BUILDING=true

RUN bun --bun run build    # 生成 .next/standalone 等目录

# 3. 记录版本
COPY scripts/meta-builder.sh ./scripts/meta-builder.sh
COPY .git ./

RUN ./scripts/meta-builder.sh

# =============================================================================
# 4. Production Dependencies Stage – 仅生产依赖
# =============================================================================
FROM base AS prod-deps
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile --production

# =============================================================================
# 5. Runtime Stage – 最终镜像
# =============================================================================
FROM prod-deps AS runtime

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 1. 运行时必备
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

COPY --from=builder /app/.build-meta ./.build-meta

# 2. 启动脚本
COPY scripts/entrypoint.sh ./scripts/entrypoint.sh
RUN chmod +x ./scripts/entrypoint.sh

USER nextjs

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["./scripts/entrypoint.sh"]
