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
	pm2 start bun --name ov-blog -- start 

# 如果正在运行，则删除
stop:
	pm2 delete ov-blog || true

restart: stop start

update:
	git reset --hard
	git pull
	make restart

webhook:
	pm2 start webhook.ts --name ov-blog-webhook

stop-webhook:
	pm2 delete ov-blog-webhook || true

all: webhook start

stop-all: stop-webhook stop

restart-all: stop-all all

status:
	pm2 status

log:
	pm2 logs ov-blog

log-webhook:
	pm2 logs ov-blog-webhook