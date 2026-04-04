#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TradingAgents Web UI - 基于 Streamlit 的可视化交易分析界面
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from datetime import datetime, timedelta
import json
import os

# 设置页面配置
st.set_page_config(
    page_title="TradingAgents 交易分析系统",
    page_icon="📈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 自定义 CSS 样式
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 1rem;
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1rem;
        border-radius: 10px;
        color: white;
        text-align: center;
    }
    .buy-signal {
        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        padding: 1.5rem;
        border-radius: 15px;
        color: white;
        text-align: center;
        font-size: 1.5rem;
        font-weight: bold;
    }
    .sell-signal {
        background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
        padding: 1.5rem;
        border-radius: 15px;
        color: white;
        text-align: center;
        font-size: 1.5rem;
        font-weight: bold;
    }
    .hold-signal {
        background: linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%);
        padding: 1.5rem;
        border-radius: 15px;
        color: white;
        text-align: center;
        font-size: 1.5rem;
        font-weight: bold;
    }
    .stAlert {
        border-radius: 10px;
    }
</style>
""", unsafe_allow_html=True)

# 侧边栏配置
with st.sidebar:
    st.header("⚙️ 配置面板")
    
    # 股票输入
    ticker = st.text_input("股票代码", value="NVDA", placeholder="如：NVDA, AAPL, TSLA")
    
    # 日期选择
    trade_date = st.date_input("交易日期", value=datetime.now() - timedelta(days=1))
    
    # 分析配置
    st.subheader("📊 分析参数")
    llm_provider = st.selectbox(
        "LLM 提供商",
        ["deepseek", "dashscope", "openai", "google"],
        index=0
    )
    max_debate_rounds = st.slider("最大辩论轮次", 0, 5, 1)
    use_online_tools = st.checkbox("启用在线工具", value=True)
    
    # 高级选项
    with st.expander("🔧 高级选项"):
        deep_think_model = st.text_input("深度思考模型", value="deepseek-chat")
        quick_think_model = st.text_input("快速思考模型", value="deepseek-chat")
        max_tokens = st.slider("最大 Token 数", 1000, 8000, 4000)
        temperature = st.slider("Temperature", 0.0, 1.0, 0.7)
    
    # 启动分析按钮
    analyze_btn = st.button("🚀 开始分析", type="primary", use_container_width=True)
    
    st.divider()
    
    # 快速操作
    st.subheader("⚡ 快速选择")
    col1, col2, col3 = st.columns(3)
    with col1:
        if st.button("NVDA", use_container_width=True):
            st.session_state.ticker = "NVDA"
    with col2:
        if st.button("AAPL", use_container_width=True):
            st.session_state.ticker = "AAPL"
    with col3:
        if st.button("TSLA", use_container_width=True):
            st.session_state.ticker = "TSLA"

# 主标题
st.markdown('<p class="main-header">📈 TradingAgents 交易分析系统</p>', unsafe_allow_html=True)
st.markdown("---")

# 初始化 session state
if 'analysis_result' not in st.session_state:
    st.session_state.analysis_result = None
if 'loading' not in st.session_state:
    st.session_state.loading = False

# 主内容区域
if analyze_btn:
    st.session_state.loading = True
    st.session_state.ticker = ticker
    
    with st.spinner(f"🔍 正在分析 {ticker}... 这可能需要几分钟..."):
        try:
            # 导入并运行分析
            import sys
            sys.path.insert(0, '/home/hulin/Documents/Projects/TradingAgents-CN')
            
            from tradingagents.graph.trading_graph import TradingAgentsGraph
            from tradingagents.default_config import DEFAULT_CONFIG
            
            # 创建配置
            config = DEFAULT_CONFIG.copy()
            config["llm_provider"] = llm_provider
            config["deep_think_llm"] = deep_think_model
            config["quick_think_llm"] = quick_think_model
            config["max_debate_rounds"] = max_debate_rounds
            config["online_tools"] = use_online_tools
            config["max_tokens"] = max_tokens
            config["temperature"] = temperature
            
            # 初始化分析图
            ta = TradingAgentsGraph(debug=False, config=config)
            
            # 执行分析
            date_str = trade_date.strftime("%Y-%m-%d")
            _, decision = ta.propagate(ticker, date_str)
            
            st.session_state.analysis_result = {
                'ticker': ticker,
                'date': date_str,
                'decision': decision,
                'config': config
            }
            
        except Exception as e:
            st.error(f"❌ 分析失败：{str(e)}")
            st.exception(e)
        finally:
            st.session_state.loading = False

# 显示分析结果
if st.session_state.analysis_result:
    result = st.session_state.analysis_result
    decision = result['decision']
    
    # 交易信号面板
    st.subheader("🎯 交易信号")
    
    # 解析决策
    action = decision.get('action', '持有')
    target_price = decision.get('target_price', 0)
    confidence = decision.get('confidence', 0)
    risk_score = decision.get('risk_score', 0)
    reasoning = decision.get('reasoning', '')
    
    # 显示信号
    if action == '买入':
        signal_class = "buy-signal"
        signal_icon = "🟢"
    elif action == '卖出':
        signal_class = "sell-signal"
        signal_icon = "🔴"
    else:
        signal_class = "hold-signal"
        signal_icon = "🟡"
    
    st.markdown(f'<div class="{signal_class}">{signal_icon} {action}</div>', unsafe_allow_html=True)
    
    # 关键指标
    st.markdown("---")
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(
            label="目标价格",
            value=f"${target_price:.2f}" if target_price else "N/A",
            delta=None
        )
    
    with col2:
        st.metric(
            label="置信度",
            value=f"{confidence*100:.1f}%",
            delta=None
        )
    
    with col3:
        st.metric(
            label="风险评分",
            value=f"{risk_score*100:.1f}%",
            delta="-" if risk_score < 0.5 else "+"
        )
    
    with col4:
        st.metric(
            label="分析日期",
            value=result['date'],
            delta=None
        )
    
    # 分析理由
    st.markdown("---")
    st.subheader("📝 分析理由")
    st.info(reasoning)
    
    # K 线图区域
    st.markdown("---")
    st.subheader("📊 K 线图与技术指标")
    
    # 尝试获取历史数据并绘图
    try:
        import yfinance as yf
        
        # 获取历史数据
        stock = yf.Ticker(result['ticker'])
        hist = stock.history(period="6mo")
        
        if not hist.empty:
            # 创建子图
            fig = make_subplots(
                rows=2, cols=1,
                shared_xaxes=True,
                vertical_spacing=0.03,
                row_heights=[0.7, 0.3],
                subplot_titles=('价格走势', '成交量')
            )
            
            # K 线图
            fig.add_trace(
                go.Candlestick(
                    x=hist.index,
                    open=hist['Open'],
                    high=hist['High'],
                    low=hist['Low'],
                    close=hist['Close'],
                    name='价格',
                    increasing_line_color='#26a69a',
                    decreasing_line_color='#ef5350'
                ),
                row=1, col=1
            )
            
            # 成交量
            colors = ['#26a69a' if close >= open else '#ef5350' 
                     for close, open in zip(hist['Close'], hist['Open'])]
            
            fig.add_trace(
                go.Bar(
                    x=hist.index,
                    y=hist['Volume'],
                    name='成交量',
                    marker_color=colors,
                    opacity=0.5
                ),
                row=2, col=1
            )
            
            # 更新布局
            fig.update_layout(
                height=600,
                showlegend=False,
                xaxis_rangeslider_visible=False,
                template='plotly_dark',
                hovermode='x unified'
            )
            
            fig.update_xaxes(title_text="日期", row=2, col=1)
            fig.update_yaxes(title_text="价格 (USD)", row=1, col=1)
            fig.update_yaxes(title_text="成交量", row=2, col=1)
            
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.warning("⚠️ 无法获取历史数据，请检查网络连接或股票代码")
            
    except Exception as e:
        st.warning(f"⚠️ K 线图加载失败：{str(e)}")
        st.info("💡 提示：确保已安装 yfinance 库 (pip install yfinance)")
    
    # 情绪分析面板
    st.markdown("---")
    st.subheader("😊 市场情绪分析")
    
    # 模拟情绪指标（实际应从分析结果中获取）
    col1, col2, col3 = st.columns(3)
    
    with col1:
        # 贪婪恐惧指数
        greed_fear = 65  # 示例值
        st.metric("贪婪恐惧指数", f"{greed_fear}/100", 
                  delta="贪婪" if greed_fear > 50 else "恐惧")
        st.progress(greed_fear / 100)
    
    with col2:
        # 市场热度
        market_heat = 72  # 示例值
        st.metric("市场热度", f"{market_heat}/100",
                  delta="🔥 火热" if market_heat > 70 else "😐 温和")
        st.progress(market_heat / 100)
    
    with col3:
        # 机构情绪
        institutional = 58  # 示例值
        st.metric("机构情绪", f"{institutional}/100",
                  delta="📈 乐观" if institutional > 50 else "📉 悲观")
        st.progress(institutional / 100)
    
    # 原始决策数据
    with st.expander("📋 查看原始决策数据"):
        st.json(decision)
    
    # 配置信息
    with st.expander("⚙️ 查看分析配置"):
        st.json(result['config'])

else:
    # 欢迎页面
    st.markdown("""
    ### 👋 欢迎使用 TradingAgents 交易分析系统
    
    这是一个基于多 Agent 协作的智能交易分析系统，能够：
    
    - 📊 **全面市场分析** - 整合多个数据源的股票数据
    - 🤖 **多 Agent 辩论** - 多个专业 Agent 从不同角度分析
    - 📈 **技术面分析** - K 线、指标、趋势判断
    - 😊 **情绪分析** - 市场情绪、新闻舆情
    - 🎯 **交易信号** - 买入/卖出/持有建议
    
    #### 快速开始
    
    1. 在左侧输入股票代码（如：NVDA, AAPL, TSLA）
    2. 选择交易日期
    3. 点击 **🚀 开始分析** 按钮
    4. 等待分析完成，查看结果
    
    #### 支持的股票
    
    - 🇺🇸 **美股** - NVDA, AAPL, TSLA, MSFT, GOOGL 等
    - 🇨🇳 **A 股** - 600000, 000001, 300750 等
    
    ---
    
    💡 **提示**: 首次分析可能需要几分钟，系统会获取历史数据并运行多个 Agent 进行辩论分析。
    """)
    
    # 显示示例股票
    st.subheader("🔥 热门股票")
    col1, col2, col3, col4, col5 = st.columns(5)
    
    stocks = [
        ("NVDA", "英伟达", "🎮 AI 芯片"),
        ("AAPL", "苹果", "📱 消费电子"),
        ("TSLA", "特斯拉", "🚗 电动汽车"),
        ("MSFT", "微软", "💻 软件"),
        ("GOOGL", "谷歌", "🔍 互联网")
    ]
    
    for i, (ticker, name, desc) in enumerate(stocks):
        with [col1, col2, col3, col4, col5][i]:
            st.markdown(f"**{ticker}**")
            st.markdown(f"*{name}*")
            st.caption(desc)

# 页脚
st.markdown("---")
st.markdown(
    """
    <div style='text-align: center; color: #666;'>
        TradingAgents Web UI v1.0 | Powered by Streamlit & DeepSeek
    </div>
    """,
    unsafe_allow_html=True
)
