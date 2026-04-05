/**
 * HTTP 请求封装
 * 提供简洁的请求方法
 */

import request, { ApiClient } from '@/api/request'

// 导出 request 实例和 ApiClient
export { request, ApiClient }

// 提供简化的 http 对象
export const http = {
  get: ApiClient.get,
  post: ApiClient.post,
  put: ApiClient.put,
  delete: ApiClient.delete,
  patch: ApiClient.patch
}

export default request