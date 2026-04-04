<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">
          欢迎使用 TradingAgents-CN
          <span class="version-badge">v1.0.0-preview</span>
        </h1>
        <p class="welcome-subtitle">
          现代化的多智能体股票分析学习平台，辅助你掌握更全面的市场视角分析股票
        </p>
      </div>
      <div class="welcome-actions">
        <el-button type="primary" size="large" @click="quickAnalysis">
          <el-icon><TrendCharts /></el-icon>
          快速分析
        </el-button>
        <el-button size="large" @click="goToScreening">
          <el-icon><Search /></el-icon>
          股票筛选
        </el-button>
      </div>
    </div>


    <!-- 学习中心推荐卡片 -->
    <el-card class="learning-highlight-card">
      <div class="learning-highlight">
        <div class="learning-icon">
          <el-icon size="48"><Reading /></el-icon>
        </div>
        <div class="learning-content">
          <h2>📚 AI股票分析学习中心</h2>
          <p>从零开始学习AI、大语言模型和智能股票分析。了解多智能体系统如何协作分析股票，掌握提示词工程技巧，选择合适的大模型，理解AI的能力与局限性。</p>
          <div class="learning-features">
            <span class="feature-tag">🤖 AI基础知识</span>
            <span class="feature-tag">✍️ 提示词工程</span>
            <span class="feature-tag">🎯 模型选择</span>
            <span class="feature-tag">📊 分析原理</span>
            <span class="feature-tag">⚠️ 风险认知</span>
            <span class="feature-tag">🎓 实战教程</span>
          </div>
        </div>
        <div class="learning-action">
          <el-button type="primary" size="large" @click="goToLearning">
            <el-icon><Reading /></el-icon>
            开始学习
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 主要功能区域 -->
    <el-row :gutter="24" class="main-content">
      <!-- 左侧：快速操作 -->
      <el-col :span="16">
        <el-card class="quick-actions-card" header="快速操作">
          <div class="quick-actions">
            <div class="action-item" @click="goToSingleAnalysis">
              <div class="action-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="action-content">
                <h3>单股分析</h3>
                <p>深度分析单只股票的投资价值</p>
              </div>
              <el-icon class="action-arrow"><ArrowRight /></el-icon>
            </div>

            <div class="action-item" @click="goToBatchAnalysis">
              <div class="action-icon">
                <el-icon><Files /></el-icon>
              </div>
              <div class="action-content">
                <h3>批量分析</h3>
                <p>同时分析多只股票，提高效率</p>
              </div>
              <el-icon class="action-arrow"><ArrowRight /></el-icon>
            </div>

            <div class="action-item" @click="goToScreening">
              <div class="action-icon">
                <el-icon><Search /></el-icon>
              </div>
              <div class="action-content">
                <h3>股票筛选</h3>
                <p>通过多维度条件筛选优质股票</p>
              </div>
              <el-icon class="action-arrow"><ArrowRight /></el-icon>
            </div>

            <div class="action-item" @click="goToQueue">
              <div class="action-icon">
                <el-icon><List /></el-icon>
              </div>
              <div class="action-content">
                <h3>任务中心</h3>
                <p>查看和管理分析任务列表</p>
              </div>
              <el-icon class="action-arrow"><ArrowRight /></el-icon>
            </div>
          </div>
        </el-card>

        <!-- 最近分析 -->
        <el-card class="recent-analyses-card" header="最近分析" style="margin-top: 24px;">
          <el-table :data="recentAnalyses" style="width: 100%">
            <el-table-column prop="stock_code" label="股票代码" width="120" />
            <el-table-column prop="stock_name" label="股票名称" width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="start_time" label="创建时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.start_time) }}
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button type="text" size="small" @click="viewAnalysis(row)">
                  查看
                </el-button>
                <el-button
                  v-if="row.status === 'completed'"
                  type="text"
                  size="small"
                  @click="downloadReport(row)"
                >
                  下载
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="table-footer">
            <el-button type="text" @click="goToHistory">
              查看全部历史 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </el-card>

        <!-- 市场快讯 -->
        <el-card class="market-news-card" style="margin-top: 24px;">
          <template #header>
            <span>市场快讯</span>
          </template>
          <div v-if="marketNews.length > 0" class="news-list">
            <div
              v-for="news in marketNews"
              :key="news.id"
              class="news-item"
              @click="openNewsUrl(news.url)"
            >
              <div class="news-title">{{ news.title }}</div>
              <div class="news-time">{{ formatTime(news.time) }}</div>
            </div>
          </div>
          <div v-else class="empty-state">
            <el-icon class="empty-icon"><InfoFilled /></el-icon>
            <p>暂无市场快讯</p>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：自选股和快讯 -->
      <el-col :span="8">
        <!-- 我的自选股 -->
        <el-card class="favorites-card">
          <template #header>
            <div class="card-header">
              <span>我的自选股</span>
              <el-button type="text" size="small" @click="goToFavorites">
                查看全部 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>

          <div v-if="favoriteStocks.length === 0" class="empty-favorites">
            <el-empty description="暂无自选股" :image-size="60">
              <el-button type="primary" size="small" @click="goToFavorites">
                添加自选股
              </el-button>
            </el-empty>
          </div>

          <div v-else class="favorites-list">
            <div
              v-for="stock in favoriteStocks.slice(0, 5)"
              :key="stock.stock_code"
              class="favorite-item"
              @click="viewStockDetail(stock)"
            >
              <div class="stock-info">
                <div class="stock-code">{{ stock.stock_code }}</div>
                <div class="stock-name">{{ stock.stock_name }}</div>
              </div>
              <div class="stock-price">
                <div class="current-price">¥{{ stock.current_price }}</div>
                <div
                  class="change-percent"
                  :class="getPriceChangeClass(stock.change_percent)"
                >
                  {{ stock.change_percent > 0 ? '+' : '' }}{{ Number(stock.change_percent).toFixed(2) }}%
                </div>
              </div>
            </div>
          </div>

          <div v-if="favoriteStocks.length > 5" class="favorites-footer">
            <el-button type="text" size="small" @click="goToFavorites">
              查看全部 {{ favoriteStocks.length }} 只自选股
            </el-button>
          </div>
        </el-card>

        <!-- 模拟交易账户 -->
        <el-card class="paper-trading-card" style="margin-top: 24px;">
          <template #header>
            <div class="card-header">
              <span>模拟交易账户</span>
              <el-button type="text" size="small" @click="goToPaperTrading">
                查看详情 <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>

          <div v-if="paperAccount" class="paper-account-info">
            <!-- A股账户 -->
            <div class="account-section">
              <div class="account-section-title">🇨🇳 A股账户</div>
              <div class="account-item">
                <div class="account-label">现金</div>
                <div class="account-value">¥{{ formatMoney(paperAccount.cash?.CNY || paperAccount.cash) }}</div>
              </div>
              <div class="account-item">
                <div class="account-label">持仓市值</div>
                <div class="account-value">¥{{ formatMoney(paperAccount.positions_value?.CNY || paperAccount.positions_value) }}</div>
              </div>
              <div class="account-item">
                <div class="account-label">总资产</div>
                <div class="account-value primary">¥{{ formatMoney(paperAccount.equity?.CNY || paperAccount.equity) }}</div>
              </div>
            </div>

            <!-- 港股账户 -->
            <div class="account-section" v-if="paperAccount.cash?.HKD !== undefined">
              <div class="account-section-title">🇭🇰 港股账户</div>
              <div class="account-item">
                <div class="account-label">现金</div>
                <div class="account-value">HK${{ formatMoney(paperAccount.cash.HKD) }}</div>
              </div>
              <div class="account-item">
                <div class="account-label">持仓市值</div>
                <div class="account-value">HK${{ formatMoney(paperAccount.positions_value?.HKD || 0) }}</div>
              </div>
              <div class="account-item">
                <div class="account-label">总资产</div>
                <div class="account-value primary">HK${{ formatMoney(paperAccount.equity?.HKD || 0) }}</div>
              </div>
            </div>

            <!-- 美股账户 -->
            <div class="account-section" v-if="paperAccount.cash?.USD !== undefined">
              <div class="account-section-title">🇺🇸 美股账户</div>
              <div class="account-item">
                <div class="account-label">现金</div>
                <div class="account-value">${{ formatMoney(paperAccount.cash.USD) }}</div>
              </div>
              <div class="account-item">
                <div class="account-label">持仓市值</div>
                <div class="account-value">${{ formatMoney(paperAccount.positions_value?.USD || 0) }}</div>
              </div>
              <div class="account-item">
                <div class="account-label">总资产</div>
                <div class="account-value primary">${{ formatMoney(paperAccount.equity?.USD || 0) }}</div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <el-icon class="empty-icon"><InfoFilled /></el-icon>
            <p>暂无账户信息</p>
            <el-button type="primary" size="small" @click="goToPaperTrading">
              查看模拟交易
            </el-button>
          </div>
        </el-card>

        <!-- 交易统计 -->
        <TradingStatsCard style="margin-top: 24px;" />

        <!-- 多数据源同步 -->
        <MultiSourceSyncCard style="margin-top: 24px;" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  TrendCharts,
  Search,
  Document,
  Files,
  List,
  ArrowRight,
  InfoFilled,
  Reading
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { AnalysisTask, AnalysisStatus } from '@/types/analysis'
import MultiSourceSyncCard from '@/components/Dashboard/MultiSourceSyncCard.vue'
import TradingStatsCard from './components/TradingStatsCard.vue'
import { favoritesApi } from '@/api/favorites'
import { analysisApi } from '@/api/analysis'
import { newsApi } from '@/api/news'
import { paperApi, type PaperAccountSummary } from '@/api/paper'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const userStats = ref({
  totalAnalyses: 0,
  successfulAnalyses: 0,
  dailyQuota: 1000,
  dailyUsed: 0,
  concurrentLimit: 3
})

const systemStatus = ref({
  api: true,
  queue: true,
  database: true
})

const queueStats = ref({
  pending: 0,
  processing: 0,
  completed: 0,
  failed: 0
})

const recentAnalyses = ref<AnalysisTask[]>([])

// 自选股数据
const favoriteStocks = ref<any[]>([])

// 市场快讯数据
const marketNews = ref<any[]>([])
const syncingNews = ref(false)

// 模拟交易账户数据
const paperAccount = ref<PaperAccountSummary | null>(null)



// 方法
const quickAnalysis = () => {
  router.push('/analysis/single')
}

const goToSingleAnalysis = () => {
  router.push('/analysis/single')
}

const goToBatchAnalysis = () => {
  router.push('/analysis/batch')
}

const goToScreening = () => {
  router.push('/screening')
}

const goToQueue = () => {
  router.push('/queue')
}

const goToHistory = () => {
  router.push('/tasks?tab=completed')
}

const goToLearning = () => {
  router.push('/learning')
}

const viewAnalysis = (analysis: AnalysisTask) => {
  const status = (analysis as any)?.status
  if (status === 'completed') {
    router.push({ name: 'ReportDetail', params: { id: analysis.task_id } })
  } else {
    // 未完成任务跳转到任务中心的“进行中”标签页
    router.push('/tasks?tab=running')
  }
}

const downloadReport = async (analysis: AnalysisTask) => {
  try {
    const reportId = analysis.task_id
    const res = await fetch(`/api/reports/${reportId}/download?format=markdown`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    if (!res.ok) {
      const msg = `下载失败：HTTP ${res.status}`
      console.error(msg)
      ElMessage.error('下载失败，报告可能尚未生成')
      return
    }
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const code = (analysis as any).stock_code || (analysis as any).stock_symbol || 'stock'
    const dateStr = (analysis as any).analysis_date || (analysis as any).start_time || ''
    // 🔥 统一文件名格式：{code}_分析报告_{date}.md
    a.download = `${code}_分析报告_${String(dateStr).slice(0,10)}.md`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    ElMessage.success('报告已开始下载')
  } catch (err) {
    console.error('下载报告出错:', err)
    ElMessage.error('下载失败，请稍后重试')
  }
}

const openNewsUrl = (url?: string) => {
  if (url) {
    window.open(url, '_blank')
  } else {
    ElMessage.info('该新闻暂无详情链接')
  }
}

const getStatusType = (status: string | AnalysisStatus): 'success' | 'info' | 'warning' | 'danger' => {
  const statusMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
    pending: 'info',
    processing: 'warning',
    running: 'warning',
    completed: 'success',
    failed: 'danger',
    cancelled: 'info'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string | AnalysisStatus) => {
  const statusMap: Record<string, string> = {
    pending: '等待中',
    processing: '处理中',
    running: '处理中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消'
  }
  return statusMap[status] || String(status)
}

import { formatDateTime } from '@/utils/datetime'

const formatTime = (time: string) => {
  return formatDateTime(time)
}

// 自选股相关方法
const goToFavorites = () => {
  router.push('/favorites')
}

const viewStockDetail = (stock: any) => {
  // 可以跳转到股票详情页或分析页
  router.push(`/analysis/single?stock_code=${stock.stock_code}`)
}

const getPriceChangeClass = (changePercent: number) => {
  if (changePercent > 0) return 'price-up'
  if (changePercent < 0) return 'price-down'
  return 'price-neutral'
}

const loadFavoriteStocks = async () => {
  try {
    const response = await favoritesApi.list()
    if (response.success && response.data) {
      favoriteStocks.value = response.data.map((item: any) => ({
        stock_code: item.stock_code,
        stock_name: item.stock_name,
        current_price: item.current_price || 0,
        change_percent: item.change_percent || 0
      }))
    }
  } catch (error) {
    console.error('加载自选股失败:', error)
  }
}

const loadRecentAnalyses = async () => {
  try {
    // 使用任务中心的用户任务接口，获取最近10条
    const res = await analysisApi.getTaskList({
      limit: 10,
      offset: 0,
      // 不限定状态，展示最近任务；如需仅展示已完成可设为 'completed'
      status: undefined
    })

    // 兼容不同返回结构（ApiResponse 或直接 data）
    const body: any = (res as any)?.data?.data || (res as any)?.data || res || {}
    const tasks = body.tasks || []

    recentAnalyses.value = tasks
    userStats.value.totalAnalyses = body.total ?? tasks.length
    userStats.value.successfulAnalyses = tasks.filter((item: any) => item.status === 'completed').length
  } catch (error) {
    console.error('加载最近分析失败:', error)
    recentAnalyses.value = []
  }
}

const loadMarketNews = async () => {
  try {
    // 先尝试获取最近 24 小时的新闻
    let response = await newsApi.getLatestNews(undefined, 10, 24)

    // 如果最近 24 小时没有新闻，则获取最新的 10 条（不限时间）
    if (response.success && response.data && response.data.news.length === 0) {
      console.log('最近 24 小时没有新闻，获取最新的 10 条新闻（不限时间）')
      response = await newsApi.getLatestNews(undefined, 10, 24 * 365) // 回溯 1 年
    }

    if (response.success && response.data) {
      marketNews.value = response.data.news.map((item: any) => ({
        id: item.id || item.title,
        title: item.title,
        time: item.publish_time,
        url: item.url,
        source: item.source
      }))
    }
  } catch (error) {
    console.error('加载市场快讯失败:', error)
    // 如果加载失败，显示提示信息
    marketNews.value = []
  }
}

// 加载模拟交易账户信息
const loadPaperAccount = async () => {
  try {
    const response = await paperApi.getAccount()
    if (response.success && response.data) {
      paperAccount.value = response.data.account
    }
  } catch (error) {
    console.error('加载模拟交易账户失败:', error)
    paperAccount.value = null
  }
}

// 跳转到模拟交易页面
const goToPaperTrading = () => {
  router.push('/paper')
}

// 格式化金额
const formatMoney = (value: number) => {
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 获取盈亏样式类
const getPnlClass = (pnl: number) => {
  if (pnl > 0) return 'price-up'
  if (pnl < 0) return 'price-down'
  return 'price-neutral'
}

const syncMarketNews = async () => {
  try {
    syncingNews.value = true
    ElMessage.info('正在同步市场新闻，请稍候...')

    // 调用同步API（后台任务）
    const response = await newsApi.syncMarketNews(24, 50)

    if (response.success) {
      ElMessage.success('新闻同步任务已启动，请稍后刷新查看')

      // 等待3秒后自动刷新新闻列表
      setTimeout(async () => {
        await loadMarketNews()
        if (marketNews.value.length > 0) {
          ElMessage.success(`成功加载 ${marketNews.value.length} 条市场新闻`)
        }
      }, 3000)
    }
  } catch (error) {
    console.error('同步市场快讯失败:', error)
    ElMessage.error('同步市场新闻失败，请稍后重试')
  } finally {
    syncingNews.value = false
  }
}

// 生命周期
onMounted(async () => {
  // 加载自选股数据
  await loadFavoriteStocks()
  // 加载最近分析
  await loadRecentAnalyses()
  // 加载市场快讯
  await loadMarketNews()
  // 加载模拟交易账户
  await loadPaperAccount()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.dashboard {
  // 欢迎区域 - 金融级渐变背景
  .welcome-section {
    background: linear-gradient(135deg, $color-primary-600 0%, $color-primary-800 100%);
    border-radius: $card-radius;
    padding: $spacing-8;
    color: $text-primary-inverse;
    margin-bottom: $spacing-6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: $shadow-lg;
    position: relative;
    overflow: hidden;

    // 背景装饰
 &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
      border-radius: 50%;
    }

    .welcome-content {
      position: relative;
      z-index: 1;

      .welcome-title {
        font-size: $font-size-3xl;
        font-weight: $font-weight-bold;
        margin: 0 0 $spacing-3 0;
        display: flex;
        align-items: center;
        gap: $spacing-4;

        .version-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: $spacing-1 $spacing-3;
          border-radius: $radius-full;
          font-size: $font-size-sm;
          font-weight: $font-weight-normal;
        }
      }

      .welcome-subtitle {
        font-size: $font-size-lg;
        opacity: 0.9;
        margin: 0;
        line-height: $line-height-relaxed;
      }
    }

    .welcome-actions {
      display: flex;
      gap: $spacing-4;
      position: relative;
      z-index: 1;
    }
  }

  // 学习中心推荐卡片
  .learning-highlight-card {
    margin-bottom: $spacing-6;
    border: 2px solid $color-primary-500;
    box-shadow: $shadow-card-hover;
    transition: box-shadow $transition-normal;

    &:hover {
      box-shadow: $shadow-lg;
    }

    .learning-highlight {
      display: flex;
      align-items: center;
      gap: $spacing-6;
      padding: $spacing-2;

      .learning-icon {
        flex-shrink: 0;
        width: 80px;
        height: 80px;
        border-radius: $card-radius;
        background: linear-gradient(135deg, $color-primary-500 0%, $color-primary-700 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: $text-primary-inverse;
        box-shadow: $shadow-md;
      }

      .learning-content {
        flex: 1;

        h2 {
          font-size: $font-size-xl;
          font-weight: $font-weight-semibold;
          margin: 0 0 $spacing-3 0;
          color: $text-primary;
        }

        p {
          font-size: $font-size-base;
          color: $text-secondary;
          line-height: $line-height-relaxed;
          margin: 0 0 $spacing-4 0;
        }

        .learning-features {
          display: flex;
          flex-wrap: wrap;
          gap: $spacing-2;

          .feature-tag {
            padding: $spacing-1 $spacing-3;
            background: $color-primary-900;
            color: $color-primary-400;
            border-radius: $radius-full;
            font-size: $font-size-sm;
            font-weight: $font-weight-medium;
          }
        }
      }

      .learning-action {
        flex-shrink: 0;
      }
    }
  }

  // 快速操作卡片
  .quick-actions-card {
    .quick-actions {
      display: grid;
      gap: $spacing-4;

      .action-item {
        display: flex;
        align-items: center;
        gap: $spacing-4;
        padding: $spacing-5;
        border: 1px solid $border-default;
        border-radius: $radius-lg;
        cursor: pointer;
        transition: all $transition-fast;

        &:hover {
          border-color: $color-primary-500;
          background-color: $bg-elevated;
          box-shadow: $shadow-md;
        }

        .action-icon {
          width: 40px;
          height: 40px;
          border-radius: $radius-md;
          background: $color-primary-900;
          display: flex;
          align-items: center;
          justify-content: center;
          color: $color-primary-400;
          font-size: $font-size-xl;
        }

        .action-content {
          flex: 1;

          h3 {
            margin: 0 0 $spacing-1 0;
            font-size: $font-size-lg;
            font-weight: $font-weight-semibold;
            color: $text-primary;
          }

          p {
            margin: 0;
            font-size: $font-size-base;
            color: $text-secondary;
          }
        }

        .action-arrow {
          color: $text-disabled;
          transition: transform $transition-fast;
        }

        &:hover .action-arrow {
          transform: translateX(4px);
        }
      }
    }
  }

  .recent-analyses-card {
    .table-footer {
      text-align: center;
      margin-top: 16px;
    }
  }

  .system-status-card {
    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;

      &:not(:last-child) {
        border-bottom: 1px solid var(--el-border-color-lighter);
      }

      .status-label {
        color: var(--el-text-color-regular);
      }

      .status-value {
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }
  }

  .market-news-card {
    .news-list {
      .news-item {
        padding: 12px 0;
        cursor: pointer;
        border-bottom: 1px solid var(--el-border-color-lighter);

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background-color: var(--el-fill-color-lighter);
          margin: 0 -16px;
          padding: 12px 16px;
          border-radius: 4px;
        }

        .news-title {
          font-size: 14px;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
          line-height: 1.4;
        }

        .news-time {
          font-size: 12px;
          color: var(--el-text-color-placeholder);
        }
      }
    }

    .news-footer {
      text-align: center;
      margin-top: 16px;
    }
  }

  .tips-card {
    .tip-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      font-size: 14px;
      color: var(--el-text-color-regular);

      .tip-icon {
        color: var(--el-color-primary);
      }
    }
  }

  // 自选股卡片
  .favorites-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .empty-favorites {
      text-align: center;
      padding: $spacing-5 0;
      color: $text-secondary;
    }

    .favorites-list {
      .favorite-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: $spacing-3 0;
        border-bottom: 1px solid $border-light;
        cursor: pointer;
        transition: all $transition-fast;

        &:hover {
          background-color: $bg-surface;
          margin: 0 (-$spacing-4);
          padding: $spacing-3 $spacing-4;
          border-radius: $radius-md;
        }

        &:last-child {
          border-bottom: none;
        }

        .stock-info {
          .stock-code {
            font-weight: $font-weight-semibold;
            font-size: $font-size-base;
            color: $text-primary;
          }

          .stock-name {
            font-size: $font-size-xs;
            color: $text-secondary;
            margin-top: $spacing-1;
          }
        }

        .stock-price {
          text-align: right;

          .current-price {
            font-weight: $font-weight-semibold;
            font-size: $font-size-base;
            color: $text-primary;
          }

          .change-percent {
            font-size: $font-size-xs;
            margin-top: $spacing-1;

            &.price-up {
              color: $color-up;
            }

            &.price-down {
              color: $color-down;
            }

            &.price-neutral {
              color: $text-secondary;
            }
          }
        }
      }
    }

    .favorites-footer {
      text-align: center;
      padding-top: $spacing-3;
      border-top: 1px solid $border-light;
      margin-top: $spacing-3;
    }
  }

  .paper-trading-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .paper-account-info {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .account-section {
        border: 1px solid var(--el-border-color-lighter);
        border-radius: 8px;
        padding: 12px;
        background-color: var(--el-fill-color-blank);

        .account-section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--el-border-color-lighter);
        }
      }

      .account-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;

        .account-label {
          font-size: 13px;
          color: var(--el-text-color-regular);
        }

        .account-value {
          font-size: 15px;
          font-weight: 600;
          color: var(--el-text-color-primary);

          &.primary {
            color: var(--el-color-primary);
            font-size: 16px;
          }

          &.price-up {
            color: #f56c6c;
          }

          &.price-down {
            color: #67c23a;
          }

          &.price-neutral {
            color: var(--el-text-color-regular);
          }
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 20px 0;

      .empty-icon {
        font-size: 48px;
        color: var(--el-text-color-placeholder);
        margin-bottom: 12px;
      }

      p {
        color: var(--el-text-color-secondary);
        margin-bottom: 16px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .dashboard {
    .welcome-section {
      flex-direction: column;
      text-align: center;
      gap: 24px;

      .welcome-actions {
        justify-content: center;
      }
    }

    .learning-highlight-card {
      .learning-highlight {
        flex-direction: column;
        text-align: center;

        .learning-content {
          .learning-features {
            justify-content: center;
          }
        }
      }
    }

    .main-content {
      .el-col {
        margin-bottom: 24px;
      }
    }
  }
}
</style>
