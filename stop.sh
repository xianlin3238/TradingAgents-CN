#!/bin/bash
# TradingAgents-CN 停止脚本

cd "$(dirname "$0")"

echo "🛑 停止 TradingAgents-CN..."

# 停止后端
if [ -f .backend.pid ]; then
    PID=$(cat .backend.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "✓ 后端已停止 (PID: $PID)"
    fi
    rm -f .backend.pid
fi

# 停止前端
if [ -f .frontend.pid ]; then
    PID=$(cat .frontend.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "✓ 前端已停止 (PID: $PID)"
    fi
    rm -f .frontend.pid
fi

# 额外清理
pkill -f "uvicorn app.main:app" 2>/dev/null || true
pkill -f "http.server 3000" 2>/dev/null || true
pkill -f "vite.*3000" 2>/dev/null || true

echo "✅ 所有服务已停止"