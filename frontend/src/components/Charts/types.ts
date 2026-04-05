/**
 * 图表组件类型定义
 */

// K线数据点
export interface KLineDataPoint {
  time: string
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

// 时间分时数据点
export interface TimeShareDataPoint {
  time: string
  price: number
  volume?: number
  avgPrice?: number
}

// 资金流向数据点
export interface CapitalFlowDataPoint {
  time: string
  inflow: number
  outflow: number
  netInflow: number
}

// 指标数据点
export interface IndicatorDataPoint {
  time: string
  value: number
  signal?: number
  histogram?: number
}

// 通用图表数据点
export interface ChartDataPoint {
  time: string
  value: number
  [key: string]: any
}

// 指标数据
export interface IndicatorData {
  macd?: {
    dif: number[]
    dea: number[]
    macd: number[]
  }
  rsi?: {
    values: number[]
    period: number
  }
  kdj?: {
    k: number[]
    d: number[]
    j: number[]
  }
}