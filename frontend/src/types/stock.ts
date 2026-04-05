/**
 * 股票相关类型定义
 */

export interface Stock {
  code: string
  name: string
  market?: string
  industry?: string
  listDate?: string
  totalShares?: number
  floatShares?: number
  marketCap?: number
  pe?: number
  pb?: number
  roe?: number
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface StockPrice {
  code: string
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  amount: number
  change?: number
  changePercent?: number
  turnoverRate?: number
}

export interface StockInfo {
  code: string
  name: string
  market?: string
  industry?: string
  currentPrice?: number
  change?: number
  changePercent?: number
  volume?: number
  amount?: number
  marketCap?: number
  pe?: number
  pb?: number
  high52w?: number
  low52w?: number
}

export interface StockFilters {
  market?: string
  industry?: string
  keyword?: string
}

export interface StockListResponse {
  items: Stock[]
  total: number
  page: number
  page_size: number
}

export interface StockSearchParams {
  keyword: string
  limit?: number
}