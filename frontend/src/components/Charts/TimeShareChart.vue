<template>
  <div class="time-share-chart" ref="chartRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface TimeShareData {
  time: string
  price: number
  volume: number
  avgPrice?: number
}

interface Props {
  data: TimeShareData[]
  title?: string
  basePrice?: number  // 昨收价
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '分时图',
  basePrice: 0,
  height: '400px'
})

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const chartOption = computed<EChartsOption>(() => {
  const times = props.data.map(item => item.time)
  const prices = props.data.map(item => item.price)
  const volumes = props.data.map(item => item.volume)
  const avgPrices = props.data.map(item => item.avgPrice || item.price)

  // 计算涨跌幅区间
  const maxPrice = Math.max(...prices)
  const minPrice = Math.min(...prices)
  const priceRange = Math.max(maxPrice - props.basePrice, props.basePrice - minPrice)
  const yMin = props.basePrice - priceRange
  const yMax = props.basePrice + priceRange

  return {
    title: {
      text: props.title,
      left: 'center',
      top: 10,
      textStyle: {
        color: '#F1F5F9',
        fontSize: 18,
        fontWeight: 600
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: '#334155',
      textStyle: {
        color: '#F1F5F9'
      },
      formatter: (params: any) => {
        const dataIndex = params[0].dataIndex
        const item = props.data[dataIndex]
        const change = ((item.price - props.basePrice) / props.basePrice * 100).toFixed(2)
        const changeColor = item.price >= props.basePrice ? '#10B981' : '#EF4444'

        return `
          <div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 8px;">${item.time}</div>
            <div>价格: <span style="color: ${changeColor};">${item.price.toFixed(2)}</span></div>
            <div>涨跌: <span style="color: ${changeColor};">${change}%</span></div>
            <div>均价: <span style="color: #F1F5F9;">${item.avgPrice?.toFixed(2) || '-'}</span></div>
            <div>成交量: <span style="color: #F1F5F9;">${(item.volume / 100).toFixed(0)}手</span></div>
          </div>
        `
      }
    },
    legend: {
      data: ['价格', '均价', '成交量'],
      top: 40,
      textStyle: {
        color: '#94A3B8'
      }
    },
    grid: [
      {
        left: '10%',
        right: '8%',
        top: 80,
        height: '55%'
      },
      {
        left: '10%',
        right: '8%',
        top: '78%',
        height: '12%'
      }
    ],
    xAxis: [
      {
        type: 'category',
        data: times,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: {
          color: '#94A3B8',
          interval: 30
        }
      },
      {
        type: 'category',
        gridIndex: 1,
        data: times,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { show: false }
      }
    ],
    yAxis: [
      {
        type: 'value',
        min: yMin,
        max: yMax,
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(51, 65, 85, 0.3)', 'rgba(51, 65, 85, 0.1)']
          }
        },
        splitLine: {
          lineStyle: {
            color: '#334155'
          }
        },
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: {
          color: '#94A3B8',
          formatter: (value: number) => {
            const change = ((value - props.basePrice) / props.basePrice * 100).toFixed(1)
            return `${value.toFixed(2)}\n${change > 0 ? '+' : ''}${change}%`
          }
        }
      },
      {
        type: 'value',
        gridIndex: 1,
        splitNumber: 2,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94A3B8' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '价格',
        type: 'line',
        data: prices,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#3B82F6'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
          ])
        }
      },
      {
        name: '均价',
        type: 'line',
        data: avgPrices,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1,
          type: 'dashed',
          color: '#F59E0B'
        }
      },
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumes,
        itemStyle: {
          color: (params: any) => {
            const dataIndex = params.dataIndex
            const currentPrice = prices[dataIndex]
            const prevPrice = dataIndex > 0 ? prices[dataIndex - 1] : currentPrice
            return currentPrice >= prevPrice ? '#10B981' : '#EF4444'
          }
        },
        barWidth: '60%'
      }
    ]
  }
})

const initChart = () => {
  if (!chartRef.value) return

  chart = echarts.init(chartRef.value, 'dark')
  chart.setOption(chartOption.value)
}

const updateChart = () => {
  if (chart) {
    chart.setOption(chartOption.value, true)
  }
}

const resizeChart = () => {
  chart?.resize()
}

watch(() => props.data, updateChart, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  chart?.dispose()
})
</script>

<style scoped lang="scss">
.time-share-chart {
  width: 100%;
  height: v-bind(height);
  background: var(--bg-elevated, #1E293B);
  border-radius: 12px;
  padding: 16px;
}
</style>