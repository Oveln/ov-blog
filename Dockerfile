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
RUN bun run prisma generate
RUN BUILDTIME=true bun next build
FROM build AS release

CMD ["sh", "-c", "bun run prisma migrate deploy && bun start"]