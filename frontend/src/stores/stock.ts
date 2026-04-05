/**
 * 股票状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { stockApi } from '@/api/stock'
import type { Stock, StockFilters } from '@/types/stock'

export const useStockStore = defineStore('stock', () => {
  // State
  const stocks = ref<Stock[]>([])
  const currentStock = ref<Stock | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0
  })
  const filters = ref<StockFilters>({})

  // Getters
  const hasStocks = computed(() => stocks.value.length > 0)
  
  const getStockBySymbol = computed(() => {
    return (symbol: string) => stocks.value.find(s => s.symbol === symbol)
  })

  // Actions
  const fetchStocks = async (params?: { page?: number; pageSize?: number }) => {
    loading.value = true
    error.value = null
    try {
      const page = params?.page ?? pagination.value.page
      const pageSize = params?.pageSize ?? pagination.value.pageSize
      
      const data = await stockApi.getStocks({
        page,
        page_size: pageSize,
        ...filters.value
      })
      
      stocks.value = data.items || []
      pagination.value.total = data.total || 0
      pagination.value.page = page
      pagination.value.pageSize = pageSize
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取股票列表失败'
    } finally {
      loading.value = false
    }
  }

  const fetchStock = async (symbol: string) => {
    loading.value = true
    error.value = null
    try {
      currentStock.value = await stockApi.getStock(symbol)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取股票详情失败'
    } finally {
      loading.value = false
    }
  }

  const searchStocks = async (query: string) => {
    if (!query.trim()) {
      return await fetchStocks()
    }
    
    loading.value = true
    error.value = null
    try {
      const data = await stockApi.searchStocks(query)
      stocks.value = data.items || []
      pagination.value.total = data.total || 0
    } catch (e) {
      error.value = e instanceof Error ? e.message : '搜索股票失败'
    } finally {
      loading.value = false
    }
  }

  const setFilters = async (newFilters: StockFilters) => {
    filters.value = { ...newFilters }
    pagination.value.page = 1
    await fetchStocks()
  }

  const clearFilters = async () => {
    filters.value = {}
    pagination.value.page = 1
    await fetchStocks()
  }

  const setPage = async (page: number) => {
    await fetchStocks({ page })
  }

  const setPageSize = async (pageSize: number) => {
    await fetchStocks({ pageSize, page: 1 })
  }

  const refresh = async () => {
    await fetchStocks()
  }

  const $reset = () => {
    stocks.value = []
    currentStock.value = null
    loading.value = false
    error.value = null
    pagination.value = { page: 1, pageSize: 20, total: 0 }
    filters.value = {}
  }

  return {
    // State
    stocks,
    currentStock,
    loading,
    error,
    pagination,
    filters,
    // Getters
    hasStocks,
    getStockBySymbol,
    // Actions
    fetchStocks,
    fetchStock,
    searchStocks,
    setFilters,
    clearFilters,
    setPage,
    setPageSize,
    refresh,
    $reset
  }
})