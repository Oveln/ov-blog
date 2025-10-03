FROM oven/bun:alpine as base


FROM base AS install
RUN mkdir ov-blog
WORKDIR /home/app/bun/ov-blog
COPY package.json .
COPY bun.lock .
COPY bunfig.toml .
RUN bun i --frozen-lockfile
RUN pwd


FROM install AS build
ENV NODE_ENV=production
ENV BUILDING=true
# 在构建前设置ENV,使其可以构建
ENV DATABASE_URL="postgresql://postgres:password@localhost:5432/blog_dev?schema=public"
WORKDIR /home/app/bun/ov-blog
#取消ENV
ENV BUILDING=
ENV DATABASE_URL=""
COPY . .

RUN bun --version
RUN ls -la
RUN bun run prisma generate
RUN bun run --bun build
FROM build AS release

CMD ["sh", "-c", "bun run prisma migrate deploy && bun run --bun start"]
