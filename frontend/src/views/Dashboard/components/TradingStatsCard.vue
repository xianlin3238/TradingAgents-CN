<template>
  <el-card class="trading-stats-card" shadow="hover">
    <template #header>
      <div class="card-header">
        <span class="header-title">
          <el-icon><TrendCharts /></el-icon>
          交易统计
        </span>
        <el-tag size="small" type="info">近30天</el-tag>
      </div>
    </template>

    <div v-if="loading" class="loading-state">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span>加载中...</span>
    </div>

    <div v-else-if="!hasData" class="empty-state">
      <el-icon><PieChart /></el-icon>
      <p>暂无交易数据</p>
      <el-button type="primary" size="small" @click="goToPaperTrading">
        开始模拟交易
      </el-button>
    </div>

    <div v-else class="stats-grid">
      <!-- 总交易次数 -->
      <div class="stat-item">
        <div class="stat-icon trades">
          <el-icon><List /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.totalTrades }}</div>
          <div class="stat-label">总交易</div>
        </div>
      </div>

      <!-- 胜率 -->
      <div class="stat-item">
        <div class="stat-icon win-rate" :class="winRateClass">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value" :class="winRateClass">{{ stats.winRate.toFixed(1) }}%</div>
          <div class="stat-label">胜率</div>
        </div>
      </div>

      <!-- 盈利/亏损交易 -->
      <div class="stat-item">
        <div class="stat-label-row">
          <span class="win-count">
            <el-icon><ArrowUp /></el-icon>
            {{ stats.winCount }} 盈
          </span>
          <span class="lose-count">
            <el-icon><ArrowDown /></el-icon>
            {{ stats.loseCount }} 亏
          </span>
        </div>
        <div class="win-bar">
          <div class="win-fill" :style="{ width: stats.winRate + '%' }"></div>
        </div>
      </div>

      <!-- 总盈亏 -->
      <div class="stat-item highlight">
        <div class="stat-icon pnl" :class="pnlClass">
          <el-icon><Coin /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value" :class="pnlClass">
            {{ stats.totalPnl >= 0 ? '+' : '' }}{{ formatMoney(stats.totalPnl) }}
          </div>
          <div class="stat-label">总盈亏 (CNY)</div>
        </div>
      </div>
    </div>

    <div v-if="hasData" class="stats-footer">
      <el-button text type="primary" @click="goToPaperTrading">
        查看详情 →
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { paperApi } from '@/api/paper'
import type { PaperOrderItem, PaperAccountSummary, CurrencyAmount } from '@/api/paper'
import {
  TrendCharts,
  Loading,
  PieChart,
  List,
  CircleCheck,
  ArrowUp,
  ArrowDown,
  Coin
} from '@element-plus/icons-vue'

const router = useRouter()

// 辅助函数：从 CurrencyAmount 或 number 提取 CNY 值
const getCnyValue = (value: CurrencyAmount | number | undefined): number => {
  if (!value) return 0
  if (typeof value === 'number') return value
  return value.CNY || 0
}

// 状态
const loading = ref(false)
const orders = ref<PaperOrderItem[]>([])
const accountData = ref<PaperAccountSummary | null>(null)

// 计算统计数据
const stats = computed(() => {
  const filledOrders = orders.value.filter(o => o.status === 'filled')
  const totalTrades = filledOrders.length

  // 买卖次数统计
  const buyOrders = filledOrders.filter(o => o.side === 'buy')
  const sellOrders = filledOrders.filter(o => o.side === 'sell')

  // 简化版胜率：基于卖出订单占比
  // TODO: 需要后端提供每笔交易的盈亏数据
  const winCount = sellOrders.length
  const loseCount = 0
  const winRate = totalTrades > 0 ? Math.min((winCount / totalTrades * 100), 100) : 0

  // 从账户获取总盈亏
  const totalPnl = getCnyValue(accountData.value?.realized_pnl)

  return {
    totalTrades,
    winCount,
    loseCount,
    winRate,
    totalPnl
  }
})

const hasData = computed(() => stats.value.totalTrades > 0)

const winRateClass = computed(() => {
  const rate = stats.value.winRate
  if (rate >= 60) return 'excellent'
  if (rate >= 40) return 'good'
  return 'poor'
})

const pnlClass = computed(() => {
  const pnl = stats.value.totalPnl
  if (pnl > 0) return 'profit'
  if (pnl < 0) return 'loss'
  return 'neutral'
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 并行加载账户和订单数据
    const [accountRes, ordersRes] = await Promise.all([
      paperApi.getAccount(),
      paperApi.getOrders(100)
    ])

    if (accountRes.success && accountRes.data) {
      accountData.value = accountRes.data
    }

    if (ordersRes.success && ordersRes.data) {
      orders.value = ordersRes.data.items || []
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化金额
const formatMoney = (value: number) => {
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 跳转到模拟交易页面
const goToPaperTrading = () => {
  router.push('/paper')
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.trading-stats-card {
  height: 100%;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-title {
      display: flex;
      align-items: center;
      gap: $spacing-2;
      font-weight: $font-weight-semibold;
    }
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-8 0;
    color: $text-secondary;

    .el-icon {
      font-size: 48px;
      margin-bottom: $spacing-3;
    }

    p {
      margin-bottom: $spacing-4;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: $spacing-4;

    .stat-item {
      padding: $spacing-4;
      background: $bg-surface;
      border-radius: $radius-lg;
      border: 1px solid $border-light;
      transition: all $transition-fast;

      &:hover {
        border-color: $color-primary-500;
        box-shadow: $shadow-sm;
      }

      &.highlight {
        grid-column: span 2;
        background: linear-gradient(135deg, $color-primary-900 0%, $color-primary-950 100%);
        border-color: $color-primary-700;
      }
    }

    .stat-icon {
      width: 36px;
      height: 36px;
      border-radius: $radius-md;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: $font-size-lg;
      margin-bottom: $spacing-2;

      &.trades {
        background: $color-primary-800;
        color: $color-primary-400;
      }

      &.win-rate {
        background: rgba($color-warning, 0.15);
        color: $color-warning;

        &.excellent {
          background: rgba($color-success, 0.15);
          color: $color-success;
        }

        &.good {
          background: rgba($color-warning, 0.15);
          color: $color-warning;
        }

        &.poor {
          background: rgba($color-danger, 0.15);
          color: $color-danger;
        }
      }

      &.pnl {
        background: rgba(255, 255, 255, 0.1);
        color: $text-primary;

        &.profit {
          color: $color-up;
        }

        &.loss {
          color: $color-down;
        }
      }
    }

    .stat-content {
      .stat-value {
        font-size: $font-size-xl;
        font-weight: $font-weight-bold;
        color: $text-primary;
        line-height: 1.2;

        &.profit {
          color: $color-up;
        }

        &.loss {
          color: $color-down;
        }

        &.excellent {
          color: $color-success;
        }

        &.good {
          color: $color-warning;
        }

        &.poor {
          color: $color-error;
        }
      }

      .stat-label {
        font-size: $font-size-xs;
        color: $text-secondary;
        margin-top: $spacing-1;
      }
    }

    .stat-label-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: $spacing-2;
      font-size: $font-size-sm;

      .win-count {
        display: flex;
        align-items: center;
        gap: $spacing-1;
        color: $color-up;
      }

      .lose-count {
        display: flex;
        align-items: center;
        gap: $spacing-1;
        color: $color-down;
      }
    }

    .win-bar {
      height: 8px;
      background: $color-down;
      border-radius: $radius-full;
      overflow: hidden;

      .win-fill {
        height: 100%;
        background: $color-up;
        border-radius: $radius-full;
        transition: width $transition-normal;
      }
    }
  }

  .highlight {
    .stat-content {
      .stat-value {
        color: $text-primary;
        font-size: $font-size-2xl;
      }

      .stat-label {
        color: $text-secondary;
      }
    }
  }

  .stats-footer {
    margin-top: $spacing-4;
    padding-top: $spacing-3;
    border-top: 1px solid $border-light;
    text-align: center;
  }
}
</style>