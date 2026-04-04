#!/usr/bin/env python3
"""TradingAgents Web UI - 修复版"""
import streamlit as st
from datetime import datetime, timedelta
import sys
sys.path.insert(0, '/home/hulin/Documents/Projects/TradingAgents-CN')

st.set_page_config(page_title="TradingAgents", page_icon="📈", layout="wide")

# 侧边栏
with st.sidebar:
    ticker = st.text_input("股票代码", "NVDA")
    trade_date = st.date_input("交易日期", datetime.now() - timedelta(days=1))
    max_debate = st.slider("辩论轮次", 0, 5, 1)
    analyze_btn = st.button("🚀 开始分析", type="primary")

st.title("📈 TradingAgents 交易分析")

if analyze_btn:
    with st.spinner(f"分析 {ticker} 中..."):
        try:
            from tradingagents.graph.trading_graph import TradingAgentsGraph
            from tradingagents.default_config import DEFAULT_CONFIG
            
            config = DEFAULT_CONFIG.copy()
            config["llm_provider"] = "deepseek"
            config["deep_think_llm"] = "deepseek-chat"
            config["quick_think_llm"] = "deepseek-chat"
            config["max_debate_rounds"] = max_debate
            config["online_tools"] = True
            
            ta = TradingAgentsGraph(debug=True, config=config)
            _, decision = ta.propagate(ticker, trade_date.strftime("%Y-%m-%d"))
            
            action = decision.get('action', '持有')
            st.success(f"✅ 分析完成！建议：{action}")
            st.json(decision)
            
        except Exception as e:
            st.error(f"❌ 错误: {e}")
            import traceback
            st.code(traceback.format_exc())