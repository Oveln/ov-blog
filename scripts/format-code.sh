#!/bin/bash

# 代码风格格式化脚本
# 用于格式化项目中的所有代码文件

set -e

echo "🎨 开始格式化代码..."
echo ""

# 检查是否安装了依赖
if ! command -v bunx &> /dev/null; then
    echo "❌ 错误: 未找到 bunx 命令"
    echo "请先安装 Bun: https://bun.sh"
    exit 1
fi

# 1. 运行 Prettier 格式化
echo "📝 Step 1: 运行 Prettier 格式化..."
bunx prettier --write .
echo "✅ Prettier 格式化完成"
echo ""

# 2. 运行 ESLint 修复
echo "🔍 Step 2: 运行 ESLint 修复..."
bun run lint --fix || true
echo "✅ ESLint 修复完成"
echo ""

# 3. 显示摘要
echo "🎉 代码格式化完成！"
echo ""
echo "建议操作:"
echo "  1. 检查 git diff 确认更改"
echo "  2. 运行 'bun run build' 确保项目可以构建"
echo "  3. 提交更改: git add . && git commit -m 'chore: 应用代码风格'"
echo ""
