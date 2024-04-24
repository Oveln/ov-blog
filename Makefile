data.db: prisma/schema.prisma
	bunx prisma migrate dev --name migrate-$(shell date +'%Y-%m-%d-%H-%M-%S')

db: data.db

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
	git pull
	make restart

status:
	pm2 status ov-blog

log:
	pm2 log ov-blog