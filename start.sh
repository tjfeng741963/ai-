#!/bin/bash

echo "===================================="
echo "   剧本 AI 评级系统 - 启动中..."
echo "===================================="

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 启动后端代理
echo "[1/2] 启动后端代理服务器..."
cd "$SCRIPT_DIR/proxy"
npm run dev &

# 等待 2 秒
sleep 2

# 启动前端
echo "[2/2] 启动前端开发服务器..."
cd "$SCRIPT_DIR/frontend"
npm run dev &

echo "===================================="
echo "   启动完成！"
echo "   前端: http://localhost:3002"
echo "   后端: http://localhost:3003"
echo "===================================="

# 保持脚本运行
wait
