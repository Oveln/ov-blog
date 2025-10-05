data.db: prisma/schema.prisma
	bunx prisma migrate dev --name migrate-$(shell date +'%Y-%m-%d-%H-%M-%S')

db: prisma/data.db

.env.local:
	@echo "请先创建.env.local文件"
	@exit 1

env: .env.local

build: env db
	bun i
	bun next build

start: build
	bun start