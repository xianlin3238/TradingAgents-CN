<template>
  <div class="capital-flow-chart" ref="chartRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface CapitalFlowData {
  name: string
  inflow: number
  outflow: number
  netInflow: number
}

interface Props {
  data: CapitalFlowData[]
  title?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '资金流向',
  height: '400px'
})

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const chartOption = computed<EChartsOption>(() => {
  const names = props.data.map(item => item.name)
  const inflows = props.data.map(item => item.inflow)
  const outflows = props.data.map(item => Math.abs(item.outflow))
  const netInflows = props.data.map(item => item.netInflow)

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
        type: 'shadow'
      },
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: '#334155',
      textStyle: {
        color: '#F1F5F9'
      },
      formatter: (params: any) => {
        const dataIndex = params[0].dataIndex
        const item = props.data[dataIndex]

        return `
          <div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 8px;">${item.name}</div>
            <div>主力流入: <span style="color: #10B981;">${(item.inflow / 10000).toFixed(2)}万</span></div>
            <div>主力流出: <span style="color: #EF4444;">${(item.outflow / 10000).toFixed(2)}万</span></div>
            <div>净流入: <span style="color: ${item.netInflow >= 0 ? '#10B981' : '#EF4444'};">${(item.netInflow / 10000).toFixed(2)}万</span></div>
          </div>
        `
      }
    },
    legend: {
      data: ['流入', '流出', '净流入'],
      top: 40,
      textStyle: {
        color: '#94A3B8'
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      top: 80,
      bottom: 60
    },
    xAxis: {
      type: 'category',
      data: names,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: {
        color: '#94A3B8',
        interval: 0,
        rotate: names.length > 5 ? 30 : 0
      }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: {
        color: '#94A3B8',
        formatter: (value: number) => `${(value / 10000).toFixed(0)}万`
      },
      splitLine: {
        lineStyle: { color: '#334155' }
      }
    },
    series: [
      {
        name: '流入',
        type: 'bar',
        data: inflows,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#10B981' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.3)' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: '#10B981'
          }
        }
      },
      {
        name: '流出',
        type: 'bar',
        data: outflows,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#EF4444' },
            { offset: 1, color: 'rgba(239, 68, 68, 0.3)' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: '#EF4444'
          }
        }
      },
      {
        name: '净流入',
        type: 'line',
        data: netInflows,
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#3B82F6'
        },
        itemStyle: {
          color: '#3B82F6'
        },
        symbol: 'circle',
        symbolSize: 8,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
          ])
        }
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
.capital-flow-chart {
  width: 100%;
  height: v-bind(height);
  background: var(--bg-elevated, #1E293B);
  border-radius: 12px;
  padding: 16px;
}
</style>