# syntax=docker/dockerfile:1.4
FROM docker.io/oven/bun:1-alpine AS base

RUN apk add --no-cache ca-certificates wget \
 && rm -rf /var/cache/apk/*
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
WORKDIR /app

# =============================================================================
# 2. Dependencies Stage – 全量依赖（含 dev）
# =============================================================================
FROM base AS deps
RUN apk add --no-cache git
COPY package.json bun.lock bunfig.toml ./


RUN --mount=type=cache,target=/root/.bun,id=bun-cache \
    bun install --frozen-lockfile
RUN --mount=type=cache,target=/root/.bun,id=bun-cache \
    ls ~/.bun

# ----------------------------------------------------------
# 2) Prisma 客户端生成层
# ----------------------------------------------------------

FROM deps AS prisma
COPY prisma ./prisma
RUN --mount=type=cache,target=/root/.bun,id=bun-cache \
    bunx prisma generate

# ----------------------------------------------------------
# 3) 构建层
# ----------------------------------------------------------
FROM prisma AS builder

# 3-a 构建脚本/配置（不常变）
COPY package.json bun.lock bunfig.toml next.config.mjs tsconfig.json \
     postcss.config.js tailwind* components.json ./

# 3-b 源码（常变）—— 放在最后，前面所有层都可缓存
COPY src ./src
COPY public ./public

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    BUILDING=true

RUN bun --bun run build

COPY scripts/meta-builder.sh ./scripts/
COPY .git ./.git
RUN ./scripts/meta-builder.sh

# =============================================================================
# 4. Production Dependencies Stage – 仅生产依赖
# =============================================================================
FROM base AS prod-deps
COPY package.json bun.lock bunfig.toml ./
RUN --mount=type=cache,target=/root/.bun,id=bun-cache \
    ls ~/.bun
RUN --mount=type=cache,target=/root/.bun,id=bun-cache \
    bun install --frozen-lockfile --production

# =============================================================================
# 5. Runtime Stage – 最终镜像
# =============================================================================
FROM prod-deps AS runtime
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# 5-a 复制构建产物
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/.build-meta ./.build-meta

# 5-b 启动脚本
COPY scripts/entrypoint.sh ./scripts/
RUN chmod +x ./scripts/entrypoint.sh
USER nextjs

CMD ["./scripts/entrypoint.sh"]
