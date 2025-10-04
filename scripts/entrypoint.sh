#!/bin/sh

# 启动数据库迁移和服务
bunx prisma migrate deploy

bun --bun run start
