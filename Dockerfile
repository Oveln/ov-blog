FROM oven/bun:alpine as base


FROM base AS install
RUN mkdir ov-blog
WORKDIR /home/app/bun/ov-blog
COPY package.json .
COPY bun.lockb .
COPY bunfig.toml .
RUN bun i --frozen-lockfile
RUN pwd


FROM install AS build
ENV NODE_ENV=production
WORKDIR /home/app/bun/ov-blog
COPY . .

RUN bun --version
RUN ls -la
RUN bun run prisma db push
RUN bun run prisma generate
RUN bun next build
FROM build AS release
# 如果没有数据库文件就创建
CMD ["sh", "-c", "if [ ! -f /home/app/bun/ov-blog/prisma/data.db ]; then bun run prisma db push; fi && bun start"]