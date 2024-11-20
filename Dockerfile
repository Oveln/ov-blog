FROM oven/bun:alpine as base


FROM base AS install
RUN mkdir ov-blog
WORKDIR /home/app/bun/ov-blog
COPY package.json .
COPY bun.lockb .
COPY bunfig.toml .
RUN bun i --frozen-lockfile --verbose
RUN pwd


FROM install AS copy
ENV NODE_ENV=production
WORKDIR /home/app/bun/ov-blog
COPY . .

RUN bun --version
RUN ls -la
RUN bun run prisma migrate deploy
RUN bun run prisma db push
FROM copy AS prebuild
RUN bun next build --debug

CMD ["bun", "start"]