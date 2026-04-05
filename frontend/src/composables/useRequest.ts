/**
 * 请求工具函数
 * 防重复提交、错误处理
 */

import { ref, type Ref } from 'vue'

/**
 * 防重复提交
 */
export function useDebounceSubmit<T extends (...args: any[]) => Promise<any>>(
  submitFn: T,
  options: {
    delay?: number // 防抖延迟
    lockTime?: number // 锁定时间
    onError?: (error: Error) => void
  } = {}
) {
  const { delay = 300, lockTime = 1000, onError } = options
  
  const isSubmitting = ref(false)
  const lastSubmitTime = ref(0)
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  
  const submit = async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    const now = Date.now()
    
    // 检查是否在锁定时间内
    if (isSubmitting.value || (now - lastSubmitTime.value < lockTime)) {
      return null
    }
    
    // 清除之前的防抖定时器
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    return new Promise((resolve) => {
      debounceTimer = setTimeout(async () => {
        isSubmitting.value = true
        lastSubmitTime.value = Date.now()
        
        try {
          const result = await submitFn(...args)
          resolve(result as ReturnType<T>)
        } catch (error) {
          onError?.(error as Error)
          resolve(null)
        } finally {
          isSubmitting.value = false
        }
      }, delay)
    })
  }
  
  return {
    submit,
    isSubmitting
  }
}

/**
 * 节流提交
 */
export function useThrottleSubmit<T extends (...args: any[]) => Promise<any>>(
  submitFn: T,
  options: {
    interval?: number
    onError?: (error: Error) => void
  } = {}
) {
  const { interval = 1000, onError } = options
  
  const isSubmitting = ref(false)
  let lastCallTime = 0
  
  const submit = async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    const now = Date.now()
    
    if (isSubmitting.value || (now - lastCallTime < interval)) {
      return null
    }
    
    lastCallTime = now
    isSubmitting.value = true
    
    try {
      const result = await submitFn(...args)
      return result as ReturnType<T>
    } catch (error) {
      onError?.(error as Error)
      return null
    } finally {
      isSubmitting.value = false
    }
  }
  
  return {
    submit,
    isSubmitting
  }
}

/**
 * 互斥提交（同一时间只能有一个请求）
 */
export function useMutexSubmit<T extends (...args: any[]) => Promise<any>>(
  submitFn: T,
  options: {
    onError?: (error: Error) => void
  } = {}
) {
  const { onError } = options
  const isSubmitting = ref(false)
  
  const submit = async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    if (isSubmitting.value) {
      return null
    }
    
    isSubmitting.value = true
    
    try {
      const result = await submitFn(...args)
      return result as ReturnType<T>
    } catch (error) {
      onError?.(error as Error)
      return null
    } finally {
      isSubmitting.value = false
    }
  }
  
  return {
    submit,
    isSubmitting
  }
}

/**
 * 重试机制
 */
export function useRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number
    delay?: number
    exponentialBackoff?: boolean
    onRetry?: (attempt: number, error: Error) => void
  } = {}
) {
  const { maxRetries = 3, delay = 1000, exponentialBackoff = true, onRetry } = options
  
  const retryCount = ref(0)
  const isRetrying = ref(false)
  const lastError = ref<Error | null>(null)
  
  const execute = async (): Promise<T> => {
    retryCount.value = 0
    lastError.value = null
    
    while (retryCount.value <= maxRetries) {
      try {
        const result = await fn()
        return result
      } catch (error) {
        lastError.value = error as Error
        retryCount.value++
        
        if (retryCount.value > maxRetries) {
          throw error
        }
        
        onRetry?.(retryCount.value, error as Error)
        
        const waitTime = exponentialBackoff
          ? delay * Math.pow(2, retryCount.value - 1)
          : delay
        
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
    
    throw lastError.value
  }
  
  return {
    execute,
    retryCount,
    isRetrying,
    lastError
  }
}

/**
 * 请求状态管理
 */
export function useRequestState<T>(initialData?: T) {
  const data = ref<T | undefined>(initialData) as Ref<T | undefined>
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const success = ref(false)
  
  const reset = () => {
    loading.value = false
    error.value = null
    success.value = false
  }
  
  const setData = (newData: T) => {
    data.value = newData
    success.value = true
    error.value = null
  }
  
  const setError = (err: Error) => {
    error.value = err
    success.value = false
  }
  
  return {
    data,
    loading,
    error,
    success,
    reset,
    setData,
    setError
  }
}

/**
 * 批量请求
 */
export async function batchRequest<T, R>(
  items: T[],
  requestFn: (item: T) => Promise<R>,
  options: {
    concurrency?: number
    onProgress?: (completed: number, total: number) => void
    continueOnError?: boolean
  } = {}
): Promise<{ results: R[]; errors: Array<{ item: T; error: Error }> }> {
  const { concurrency = 5, onProgress, continueOnError = true } = options
  
  const results: R[] = []
  const errors: Array<{ item: T; error: Error }> = []
  let completed = 0
  
  const processItem = async (item: T) => {
    try {
      const result = await requestFn(item)
      results.push(result)
    } catch (error) {
      errors.push({ item, error: error as Error })
      if (!continueOnError) {
        throw error
      }
    } finally {
      completed++
      onProgress?.(completed, items.length)
    }
  }
  
  // 分批执行
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency)
    await Promise.all(batch.map(processItem))
  }
  
  return { results, errors }
}

/**
 * 轮询请求
 */
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  options: {
    interval?: number
    immediate?: boolean
    enabled?: Ref<boolean>
    onUpdate?: (data: T) => void
    onError?: (error: Error) => void
  } = {}
) {
  const { interval = 5000, immediate = true, enabled, onUpdate, onError } = options
  
  const data = ref<T | null>(null) as Ref<T | null>
  const error = ref<Error | null>(null)
  const isPolling = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null
  
  const start = () => {
    if (timer) return
    isPolling.value = true
    
    const poll = async () => {
      if (enabled && !enabled.value) return
      
      try {
        const result = await fetchFn()
        data.value = result
        error.value = null
        onUpdate?.(result)
      } catch (e) {
        error.value = e as Error
        onError?.(e as Error)
      }
    }
    
    if (immediate) poll()
    timer = setInterval(poll, interval)
  }
  
  const stop = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    isPolling.value = false
  }
  
  const refresh = async () => {
    try {
      const result = await fetchFn()
      data.value = result
      error.value = null
      onUpdate?.(result)
      return result
    } catch (e) {
      error.value = e as Error
      onError?.(e as Error)
      throw e
    }
  }
  
  return {
    data,
    error,
    isPolling,
    start,
    stop,
    refresh
  }
}