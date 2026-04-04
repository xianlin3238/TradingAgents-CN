<template>
  <div class="indicator-chart" ref="chartRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, PropType } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface IndicatorData {
  date: string
  value: number
}

interface MACDData {
  date: string
  dif: number
  dea: number
  macd: number
}

interface RSIData {
  date: string
  rsi6: number
  rsi12: number
  rsi24: number
}

type IndicatorType = 'macd' | 'rsi'

interface Props {
  type: IndicatorType
  data: MACDData[] | RSIData[]
  title?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '技术指标',
  height: '300px'
})

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const chartOption = computed<EChartsOption>(() => {
  if (props.type === 'macd') {
    return getMACDOption(props.data as MACDData[])
  }
  return getRSIOption(props.data as RSIData[])
})

const getMACDOption = (data: MACDData[]): EChartsOption => {
  const dates = data.map(item => item.date)
  const dif = data.map(item => item.dif)
  const dea = data.map(item => item.dea)
  const macd = data.map(item => item.macd)

  return {
    title: {
      text: props.title || 'MACD指标',
      left: 'center',
      top: 10,
      textStyle: {
        color: '#F1F5F9',
        fontSize: 16,
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
        const item = data[dataIndex]

        return `
          <div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 8px;">${item.date}</div>
            <div>DIF: <span style="color: ${item.dif >= 0 ? '#10B981' : '#EF4444'};">${item.dif.toFixed(4)}</span></div>
            <div>DEA: <span style="color: ${item.dea >= 0 ? '#10B981' : '#EF4444'};">${item.dea.toFixed(4)}</span></div>
            <div>MACD: <span style="color: ${item.macd >= 0 ? '#10B981' : '#EF4444'};">${item.macd.toFixed(4)}</span></div>
          </div>
        `
      }
    },
    legend: {
      data: ['DIF', 'DEA', 'MACD'],
      top: 40,
      textStyle: {
        color: '#94A3B8'
      }
    },
    grid: {
      left: '10%',
      right: '8%',
      top: 70,
      bottom: 40
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: {
        color: '#94A3B8',
        interval: 30
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: { color: '#334155' }
      },
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94A3B8' }
    },
    series: [
      {
        name: 'DIF',
        type: 'line',
        data: dif,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#3B82F6'
        }
      },
      {
        name: 'DEA',
        type: 'line',
        data: dea,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#F59E0B'
        }
      },
      {
        name: 'MACD',
        type: 'bar',
        data: macd,
        itemStyle: {
          color: (params: any) => params.value >= 0 ? '#10B981' : '#EF4444',
          borderRadius: [2, 2, 0, 0]
        },
        barWidth: '40%'
      }
    ]
  }
}

const getRSIOption = (data: RSIData[]): EChartsOption => {
  const dates = data.map(item => item.date)
  const rsi6 = data.map(item => item.rsi6)
  const rsi12 = data.map(item => item.rsi12)
  const rsi24 = data.map(item => item.rsi24)

  return {
    title: {
      text: props.title || 'RSI指标',
      left: 'center',
      top: 10,
      textStyle: {
        color: '#F1F5F9',
        fontSize: 16,
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
        const item = data[dataIndex]

        return `
          <div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 8px;">${item.date}</div>
            <div>RSI(6): <span style="color: ${getRSIColor(item.rsi6)};">${item.rsi6.toFixed(2)}</span></div>
            <div>RSI(12): <span style="color: ${getRSIColor(item.rsi12)};">${item.rsi12.toFixed(2)}</span></div>
            <div>RSI(24): <span style="color: ${getRSIColor(item.rsi24)};">${item.rsi24.toFixed(2)}</span></div>
          </div>
        `
      }
    },
    legend: {
      data: ['RSI(6)', 'RSI(12)', 'RSI(24)'],
      top: 40,
      textStyle: {
        color: '#94A3B8'
      }
    },
    grid: {
      left: '10%',
      right: '8%',
      top: 70,
      bottom: 40
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: {
        color: '#94A3B8',
        interval: 30
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      splitLine: {
        lineStyle: { color: '#334155' }
      },
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94A3B8' }
    },
    series: [
      {
        name: 'RSI(6)',
        type: 'line',
        data: rsi6,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#3B82F6'
        }
      },
      {
        name: 'RSI(12)',
        type: 'line',
        data: rsi12,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#F59E0B'
        }
      },
      {
        name: 'RSI(24)',
        type: 'line',
        data: rsi24,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: '#EC4899'
        }
      }
    ],
    // 添加超买超卖区域标记
    markLine: {
      silent: true,
      lineStyle: {
        type: 'dashed',
        color: '#64748B'
      },
      data: [
        { yAxis: 70, label: { color: '#EF4444', formatter: '超买' } },
        { yAxis: 30, label: { color: '#10B981', formatter: '超卖' } }
      ]
    }
  }
}

const getRSIColor = (value: number): string => {
  if (value >= 70) return '#EF4444'  // 超买
  if (value <= 30) return '#10B981'  // 超卖
  return '#F1F5F9'
}

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
.indicator-chart {
  width: 100%;
  height: v-bind(height);
  background: var(--bg-elevated, #1E293B);
  border-radius: 12px;
  padding: 16px;
}
</style>