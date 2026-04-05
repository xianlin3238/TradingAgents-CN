/**
 * 分析状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { analysisApi } from '@/api/analysis'
import type { 
  AnalysisTask, 
  AnalysisBatch, 
  AnalysisHistoryQuery,
  AnalysisStatus,
  SingleAnalysisRequest,
  BatchAnalysisRequest
} from '@/types/analysis'

// Re-export types for convenience
export type Analysis = AnalysisTask
export type AnalysisFilters = AnalysisHistoryQuery

export const useAnalysisStore = defineStore('analysis', () => {
  // State
  const tasks = ref<AnalysisTask[]>([])
  const batches = ref<AnalysisBatch[]>([])
  const currentTask = ref<AnalysisTask | null>(null)
  const currentBatch = ref<AnalysisBatch | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0
  })
  const filters = ref<Partial<AnalysisHistoryQuery>>({})

  // Getters
  const hasTasks = computed(() => tasks.value.length > 0)
  const hasBatches = computed(() => batches.value.length > 0)
  
  const getTaskById = computed(() => {
    return (id: string) => tasks.value.find(t => t.id === id)
  })

  const getTasksByStatus = computed(() => {
    return (status: AnalysisStatus) => tasks.value.filter(t => t.status === status)
  })

  // Actions
  const fetchHistory = async (params?: { page?: number; pageSize?: number }) => {
    loading.value = true
    error.value = null
    try {
      const page = params?.page ?? pagination.value.page
      const pageSize = params?.pageSize ?? pagination.value.pageSize
      
      const query: AnalysisHistoryQuery = {
        page,
        page_size: pageSize,
        ...filters.value as AnalysisHistoryQuery
      }
      
      const data = await analysisApi.getHistory(query)
      
      tasks.value = data.tasks || []
      batches.value = data.batches || []
      pagination.value.total = data.total || 0
      pagination.value.page = page
      pagination.value.pageSize = pageSize
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取分析历史失败'
    } finally {
      loading.value = false
    }
  }

  const fetchTask = async (taskId: string) => {
    loading.value = true
    error.value = null
    try {
      currentTask.value = await analysisApi.getTask(taskId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取任务详情失败'
    } finally {
      loading.value = false
    }
  }

  const fetchBatch = async (batchId: string) => {
    loading.value = true
    error.value = null
    try {
      currentBatch.value = await analysisApi.getBatch(batchId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : '获取批次详情失败'
    } finally {
      loading.value = false
    }
  }

  const createSingleAnalysis = async (request: SingleAnalysisRequest) => {
    loading.value = true
    error.value = null
    try {
      const result = await analysisApi.createSingle(request)
      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : '创建分析失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  const createBatchAnalysis = async (request: BatchAnalysisRequest) => {
    loading.value = true
    error.value = null
    try {
      const result = await analysisApi.createBatch(request)
      return result
    } catch (e) {
      error.value = e instanceof Error ? e.message : '创建批量分析失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  const cancelTask = async (taskId: string) => {
    loading.value = true
    error.value = null
    try {
      // TODO: 后端取消任务API待实现
      // await analysisApi.cancelTask(taskId)
      const index = tasks.value.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks.value[index].status = 'cancelled' as AnalysisStatus
      }
      if (currentTask.value?.id === taskId) {
        currentTask.value.status = 'cancelled' as AnalysisStatus
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '取消任务失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  const cancelBatch = async (batchId: string) => {
    loading.value = true
    error.value = null
    try {
      // TODO: 后端取消批次API待实现
      // await analysisApi.cancelBatch(batchId)
      const index = batches.value.findIndex(b => b.id === batchId)
      if (index !== -1) {
        batches.value[index].status = 'cancelled'
      }
      if (currentBatch.value?.id === batchId && currentBatch.value) {
        currentBatch.value.status = 'cancelled'
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '取消批次失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  const setFilters = async (newFilters: Partial<AnalysisHistoryQuery>) => {
    filters.value = { ...newFilters }
    pagination.value.page = 1
    await fetchHistory()
  }

  const clearFilters = async () => {
    filters.value = {}
    pagination.value.page = 1
    await fetchHistory()
  }

  const setPage = async (page: number) => {
    await fetchHistory({ page })
  }

  const setPageSize = async (pageSize: number) => {
    await fetchHistory({ pageSize, page: 1 })
  }

  const refresh = async () => {
    await fetchHistory()
  }

  const $reset = () => {
    tasks.value = []
    batches.value = []
    currentTask.value = null
    currentBatch.value = null
    loading.value = false
    error.value = null
    pagination.value = { page: 1, pageSize: 20, total: 0 }
    filters.value = {}
  }

  return {
    // State
    tasks,
    batches,
    currentTask,
    currentBatch,
    loading,
    error,
    pagination,
    filters,
    // Getters
    hasTasks,
    hasBatches,
    getTaskById,
    getTasksByStatus,
    // Actions
    fetchHistory,
    fetchTask,
    fetchBatch,
    createSingleAnalysis,
    createBatchAnalysis,
    cancelTask,
    cancelBatch,
    setFilters,
    clearFilters,
    setPage,
    setPageSize,
    refresh,
    $reset
  }
})