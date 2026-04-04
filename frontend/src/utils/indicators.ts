/**
 * 技术指标计算工具
 * 基于 K 线数据计算 MACD、RSI、KDJ 等指标
 */

export interface KlineBar {
  time: string
  open?: number
  high?: number
  low?: number
  close?: number
  volume?: number
  amount?: number
}

export interface MACDData {
  time: string
  dif: number
  dea: number
  macd: number
}

export interface RSIData {
  time: string
  rsi: number
}

export interface KDJData {
  time: string
  k: number
  d: number
  j: number
}

export interface BollData {
  time: string
  upper: number
  middle: number
  lower: number
}

/**
 * 计算 EMA（指数移动平均）
 */
function ema(data: number[], period: number): number[] {
  const result: number[] = []
  const multiplier = 2 / (period + 1)
  
  if (data.length === 0) return result
  
  result[0] = data[0]
  for (let i = 1; i < data.length; i++) {
    result[i] = (data[i] - result[i - 1]) * multiplier + result[i - 1]
  }
  
  return result
}

/**
 * 计算 MACD 指标
 * @param closes 收盘价数组
 * @param shortPeriod 短期周期（默认12）
 * @param longPeriod 长期周期（默认26）
 * @param signalPeriod 信号线周期（默认9）
 */
export function calcMACD(
  closes: number[],
  shortPeriod = 12,
  longPeriod = 26,
  signalPeriod = 9
): { dif: number[]; dea: number[]; macd: number[] } {
  if (closes.length < longPeriod) {
    return { dif: [], dea: [], macd: [] }
  }

  const emaShort = ema(closes, shortPeriod)
  const emaLong = ema(closes, longPeriod)
  
  const dif = emaShort.map((val, i) => val - emaLong[i])
  const dea = ema(dif, signalPeriod)
  const macd = dif.map((val, i) => 2 * (val - dea[i]))
  
  return { dif, dea, macd }
}

/**
 * 计算 RSI 指标
 * @param closes 收盘价数组
 * @param period 周期（默认14）
 */
export function calcRSI(closes: number[], period = 14): number[] {
  if (closes.length < period + 1) return []
  
  const result: number[] = []
  let gains = 0
  let losses = 0
  
  // 计算初始平均涨跌
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1]
    if (change > 0) gains += change
    else losses -= change
  }
  
  let avgGain = gains / period
  let avgLoss = losses / period
  
  // 第一个 RSI 值
  result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss))
  
  // 后续 RSI 值
  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1]
    
    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period
      avgLoss = (avgLoss * (period - 1)) / period
    } else {
      avgGain = (avgGain * (period - 1)) / period
      avgLoss = (avgLoss * (period - 1) - change) / period
    }
    
    result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss))
  }
  
  return result
}

/**
 * 计算 KDJ 指标
 * @param highs 最高价数组
 * @param lows 最低价数组
 * @param closes 收盘价数组
 * @param n 周期（默认9）
 * @param m1 K 值平滑周期（默认3）
 * @param m2 D 值平滑周期（默认3）
 */
export function calcKDJ(
  highs: number[],
  lows: number[],
  closes: number[],
  n = 9,
  m1 = 3,
  m2 = 3
): { k: number[]; d: number[]; j: number[] } {
  const length = closes.length
  if (length < n) return { k: [], d: [], j: [] }
  
  const rsvs: number[] = []
  
  for (let i = n - 1; i < length; i++) {
    const highN = Math.max(...highs.slice(i - n + 1, i + 1))
    const lowN = Math.min(...lows.slice(i - n + 1, i + 1))
    const rsv = highN === lowN ? 50 : ((closes[i] - lowN) / (highN - lowN)) * 100
    rsvs.push(rsv)
  }
  
  const k: number[] = []
  const d: number[] = []
  const j: number[] = []
  
  // 初始 K 和 D 值
  k[0] = 50
  d[0] = 50
  
  for (let i = 0; i < rsvs.length; i++) {
    k[i + 1] = (k[i] * (m1 - 1) + rsvs[i]) / m1
    d[i + 1] = (d[i] * (m2 - 1) + k[i + 1]) / m2
    j[i + 1] = 3 * k[i + 1] - 2 * d[i + 1]
  }
  
  // 移除初始值，只返回计算结果
  return {
    k: k.slice(1),
    d: d.slice(1),
    j: j.slice(1)
  }
}

/**
 * 计算布林带
 * @param closes 收盘价数组
 * @param period 周期（默认20）
 * @param stdDev 标准差倍数（默认2）
 */
export function calcBoll(
  closes: number[],
  period = 20,
  stdDev = 2
): { upper: number[]; middle: number[]; lower: number[] } {
  if (closes.length < period) {
    return { upper: [], middle: [], lower: [] }
  }
  
  const middle: number[] = []
  const upper: number[] = []
  const lower: number[] = []
  
  for (let i = period - 1; i < closes.length; i++) {
    const slice = closes.slice(i - period + 1, i + 1)
    const avg = slice.reduce((a, b) => a + b, 0) / period
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / period
    const std = Math.sqrt(variance)
    
    middle.push(avg)
    upper.push(avg + stdDev * std)
    lower.push(avg - stdDev * std)
  }
  
  return { upper, middle, lower }
}

/**
 * 从 K 线数据计算 MACD 并返回图表数据格式
 */
export function getMACDChartData(klines: KlineBar[]): MACDData[] {
  const closes = klines.map(k => k.close ?? 0).filter(v => v > 0)
  const { dif, dea, macd } = calcMACD(closes)
  
  const result: MACDData[] = []
  const startIndex = klines.length - dif.length
  
  for (let i = 0; i < dif.length; i++) {
    const kline = klines[startIndex + i]
    if (kline) {
      result.push({
        time: kline.time,
        dif: Math.round(dif[i] * 1000) / 1000,
        dea: Math.round(dea[i] * 1000) / 1000,
        macd: Math.round(macd[i] * 1000) / 1000
      })
    }
  }
  
  return result
}

/**
 * 从 K 线数据计算 RSI 并返回图表数据格式
 */
export function getRSIChartData(klines: KlineBar[], period = 14): RSIData[] {
  const closes = klines.map(k => k.close ?? 0).filter(v => v > 0)
  const rsi = calcRSI(closes, period)
  
  const result: RSIData[] = []
  const startIndex = klines.length - rsi.length
  
  for (let i = 0; i < rsi.length; i++) {
    const kline = klines[startIndex + i]
    if (kline) {
      result.push({
        time: kline.time,
        rsi: Math.round(rsi[i] * 100) / 100
      })
    }
  }
  
  return result
}

/**
 * 从 K 线数据计算 KDJ 并返回图表数据格式
 */
export function getKDJChartData(klines: KlineBar[]): KDJData[] {
  const highs = klines.map(k => k.high ?? 0).filter(v => v > 0)
  const lows = klines.map(k => k.low ?? 0).filter(v => v > 0)
  const closes = klines.map(k => k.close ?? 0).filter(v => v > 0)
  
  const { k, d, j } = calcKDJ(highs, lows, closes)
  
  const result: KDJData[] = []
  const startIndex = klines.length - k.length
  
  for (let i = 0; i < k.length; i++) {
    const kline = klines[startIndex + i]
    if (kline) {
      result.push({
        time: kline.time,
        k: Math.round(k[i] * 100) / 100,
        d: Math.round(d[i] * 100) / 100,
        j: Math.round(j[i] * 100) / 100
      })
    }
  }
  
  return result
}