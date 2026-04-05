#!/bin/bash
# TradingAgents-CN 启动脚本
set -e

cd "$(dirname "$0")"

echo "🚀 TradingAgents-CN 启动中..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 检查数据库服务
echo -e "${YELLOW}[1/4] 检查数据库服务...${NC}"
if ! systemctl is-active --quiet mongod; then
    echo -e "${RED}MongoDB 未运行，请执行: sudo systemctl start mongod${NC}"
    exit 1
fi
if ! systemctl is-active --quiet redis-server; then
    echo -e "${RED}Redis 未运行，请执行: sudo systemctl start redis-server${NC}"
    exit 1
fi
echo -e "${GREEN}✓ MongoDB 和 Redis 已就绪${NC}"

# 2. 激活虚拟环境
echo -e "${YELLOW}[2/4] 激活 Python 虚拟环境...${NC}"
source env/bin/activate
echo -e "${GREEN}✓ 虚拟环境已激活${NC}"

# 3. 启动后端 (后台运行)
echo -e "${YELLOW}[3/4] 启动 FastAPI 后端 (端口 8000)...${NC}"
nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > .backend.pid
sleep 2
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✓ 后端已启动 (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}✗ 后端启动失败，请检查日志: logs/backend.log${NC}"
    exit 1
fi

# 4. 启动前端
echo -e "${YELLOW}[4/4] 启动前端服务...${NC}"
cd frontend

# 检查是否有构建产物
if [ -d "dist" ]; then
    echo -e "${GREEN}使用已构建的 dist/ 目录${NC}"
    # 使用 Python 提供静态文件服务
    nohup python -m http.server 3000 --directory dist > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../.frontend.pid
    echo -e "${GREEN}✓ 前端已启动 (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${YELLOW}dist/ 不存在，使用开发模式...${NC}"
    nohup npm run dev > ../logs/frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../.frontend.pid
    echo -e "${GREEN}✓ 前端开发服务器已启动 (PID: $FRONTEND_PID)${NC}"
fi

cd ..
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ TradingAgents-CN 启动完成！${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "📍 访问地址:"
echo "   前端: http://localhost:3000"
echo "   后端: http://localhost:8000"
echo "   API文档: http://localhost:8000/docs"
echo ""
echo "📋 日志文件:"
echo "   后端: logs/backend.log"
echo "   前端: logs/frontend.log"
echo ""
echo "🛑 停止服务: ./stop.sh"