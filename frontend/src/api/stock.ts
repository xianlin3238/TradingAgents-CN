/**
 * 股票 API
 */

import { http } from '@/utils/http'
import type { 
  Stock, 
  StockPrice, 
  StockInfo,
  StockFilters,
  StockListResponse,
  StockSearchParams
} from '@/types/stock'

export const stockApi = {
  /**
   * 获取股票列表
   */
  async getStocks(params?: Partial<StockFilters> & { page?: number; page_size?: number }): Promise<StockListResponse> {
    return http.get('/stocks', { params })
  },

  /**
   * 获取单个股票信息
   */
  async getStock(code: string): Promise<Stock> {
    return http.get(`/stocks/${code}`)
  },

  /**
   * 搜索股票
   */
  async searchStocks(keyword: string, limit?: number): Promise<StockListResponse> {
    const params: StockSearchParams = { keyword }
    if (limit) params.limit = limit
    return http.get('/stocks/search', { params })
  },

  /**
   * 获取股票价格历史
   */
  async getStockPrices(code: string, params?: { 
    start_date?: string
    end_date?: string
    period?: string
  }): Promise<StockPrice[]> {
    return http.get(`/stocks/${code}/prices`, { params })
  },

  /**
   * 获取股票实时信息
   */
  async getStockInfo(code: string): Promise<StockInfo> {
    return http.get(`/stocks/${code}/info`)
  },

  /**
   * 获取行业列表
   */
  async getIndustries(): Promise<string[]> {
    return http.get('/stocks/industries')
  },

  /**
   * 获取市场列表
   */
  async getMarkets(): Promise<string[]> {
    return http.get('/stocks/markets')
  }
}