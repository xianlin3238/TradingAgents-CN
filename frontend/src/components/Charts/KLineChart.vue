<template>
  <div class="kline-chart" ref="chartRef"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'

interface KLineData {
  date: string
  open: number
  close: number
  low: number
  high: number
  volume: number
}

interface Props {
  data: KLineData[]
  title?: string
  showVolume?: boolean
  showMA?: boolean
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'K线图',
  showVolume: true,
  showMA: true,
  height: '500px'
})

const chartRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

// 计算MA均线
const calculateMA = (dayCount: number, data: KLineData[]) => {
  const result = []
  for (let i = 0; i < data.length; i++) {
    if (i < dayCount - 1) {
      result.push('-')
      continue
    }
    let sum = 0
    for (let j = 0; j < dayCount; j++) {
      sum += data[i - j].close
    }
    result.push((sum / dayCount).toFixed(2))
  }
  return result
}

const chartOption = computed<EChartsOption>(() => {
  const dates = props.data.map(item => item.date)
  const ohlc = props.data.map(item => [item.open, item.close, item.low, item.high])
  const volumes = props.data.map(item => item.volume)

  const series: echarts.SeriesOption[] = [
    {
      name: 'K线',
      type: 'candlestick',
      data: ohlc,
      itemStyle: {
        color: '#10B981',        // 涨 - 绿色
        color0: '#EF4444',       // 跌 - 红色
        borderColor: '#10B981',
        borderColor0: '#EF4444'
      },
      emphasis: {
        itemStyle: {
          borderWidth: 2
        }
      }
    }
  ]

  // 添加MA均线
  if (props.showMA) {
    const maLines = [
      { name: 'MA5', day: 5, color: '#3B82F6' },
      { name: 'MA10', day: 10, color: '#F59E0B' },
      { name: 'MA20', day: 20, color: '#EC4899' },
      { name: 'MA60', day: 60, color: '#8B5CF6' }
    ]

    maLines.forEach(ma => {
      series.push({
        name: ma.name,
        type: 'line',
        data: calculateMA(ma.day, props.data),
        smooth: true,
        lineStyle: {
          width: 1,
          color: ma.color
        },
        symbol: 'none'
      })
    })
  }

  // 添加成交量
  if (props.showVolume) {
    series.push({
      name: '成交量',
      type: 'bar',
      xAxisIndex: 1,
      yAxisIndex: 1,
      data: volumes,
      itemStyle: {
        color: (params: any) => {
          const dataIndex = params.dataIndex
          const item = props.data[dataIndex]
          return item.close >= item.open ? '#10B981' : '#EF4444'
        }
      }
    })
  }

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
        const maValues = params
          .filter((p: any) => p.seriesName.startsWith('MA'))
          .map((p: any) => `${p.seriesName}: ${p.value}`)
          .join('<br/>')

        return `
          <div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 8px;">${item.date}</div>
            <div>开盘: <span style="color: #F1F5F9;">${item.open.toFixed(2)}</span></div>
            <div>收盘: <span style="color: ${item.close >= item.open ? '#10B981' : '#EF4444'};">${item.close.toFixed(2)}</span></div>
            <div>最高: <span style="color: #F1F5F9;">${item.high.toFixed(2)}</span></div>
            <div>最低: <span style="color: #F1F5F9;">${item.low.toFixed(2)}</span></div>
            <div>成交量: <span style="color: #F1F5F9;">${(item.volume / 10000).toFixed(2)}万</span></div>
            ${maValues ? `<br/>${maValues}` : ''}
          </div>
        `
      }
    },
    legend: {
      data: props.showMA ? ['K线', 'MA5', 'MA10', 'MA20', 'MA60', '成交量'] : ['K线', '成交量'],
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
        height: props.showVolume ? '50%' : '70%'
      },
      {
        left: '10%',
        right: '8%',
        top: props.showVolume ? '75%' : '85%',
        height: '15%'
      }
    ],
    xAxis: [
      {
        type: 'category',
        data: dates,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94A3B8' }
      },
      {
        type: 'category',
        gridIndex: 1,
        data: dates,
        boundaryGap: false,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { show: false }
      }
    ],
    yAxis: [
      {
        scale: true,
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
        axisLabel: { color: '#94A3B8' }
      },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94A3B8' },
        splitLine: { show: false }
      }
    ],
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: [0, 1],
        start: 70,
        end: 100
      },
      {
        show: true,
        xAxisIndex: [0, 1],
        type: 'slider',
        bottom: 10,
        start: 70,
        end: 100,
        borderColor: '#334155',
        fillerColor: 'rgba(59, 130, 246, 0.2)',
        handleStyle: {
          color: '#3B82F6'
        },
        textStyle: {
          color: '#94A3B8'
        }
      }
    ],
    series
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
.kline-chart {
  width: 100%;
  height: v-bind(height);
  background: var(--bg-elevated, #1E293B);
  border-radius: 12px;
  padding: 16px;
}
</style>