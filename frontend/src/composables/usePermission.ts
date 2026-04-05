/**
 * 权限控制 composable
 */

import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 权限类型
export type Permission = string
export type Role = 'admin' | 'user' | 'guest' | string

// 权限缓存
const permissionCache = new Map<string, boolean>()

/**
 * 权限检查 composable
 */
export function usePermission() {
  const authStore = useAuthStore()
  
  // 当前用户权限列表
  const permissions = computed<Permission[]>(() => {
    return authStore.user?.permissions || []
  })
  
  // 当前用户角色
  const roles = computed<Role[]>(() => {
    return authStore.user?.roles || ['guest']
  })
  
  // 是否已登录
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  
  // 是否是管理员
  const isAdmin = computed(() => roles.value.includes('admin'))
  
  /**
   * 检查是否有指定权限
   */
  const hasPermission = (permission: Permission): boolean => {
    if (isAdmin.value) return true
    
    // 检查缓存
    const cacheKey = `${authStore.user?.id}-${permission}`
    if (permissionCache.has(cacheKey)) {
      return permissionCache.get(cacheKey)!
    }
    
    const result = permissions.value.includes(permission)
    permissionCache.set(cacheKey, result)
    return result
  }
  
  /**
   * 检查是否有任一权限
   */
  const hasAnyPermission = (perms: Permission[]): boolean => {
    if (isAdmin.value) return true
    return perms.some(p => hasPermission(p))
  }
  
  /**
   * 检查是否有全部权限
   */
  const hasAllPermissions = (perms: Permission[]): boolean => {
    if (isAdmin.value) return true
    return perms.every(p => hasPermission(p))
  }
  
  /**
   * 检查是否有指定角色
   */
  const hasRole = (role: Role): boolean => {
    return roles.value.includes(role)
  }
  
  /**
   * 检查是否有任一角色
   */
  const hasAnyRole = (checkRoles: Role[]): boolean => {
    return checkRoles.some(r => hasRole(r))
  }
  
  /**
   * 清除权限缓存
   */
  const clearCache = () => {
    permissionCache.clear()
  }
  
  return {
    permissions,
    roles,
    isAuthenticated,
    isAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    clearCache
  }
}

/**
 * 路由权限守卫
 */
export function useRoutePermission() {
  const { hasAnyPermission, hasAnyRole, isAuthenticated } = usePermission()
  const router = useRouter()
  const route = useRoute()
  
  // 检查路由权限
  const checkRoutePermission = () => {
    const meta = route.meta
    
    // 需要登录
    if (meta.requiresAuth && !isAuthenticated.value) {
      router.push({
        path: '/login',
        query: { redirect: route.fullPath }
      })
      return false
    }
    
    // 需要特定权限
    if (meta.permissions) {
      const requiredPermissions = meta.permissions as string[]
      if (!hasAnyPermission(requiredPermissions)) {
        router.push('/403')
        return false
      }
    }
    
    // 需要特定角色
    if (meta.roles) {
      const requiredRoles = meta.roles as string[]
      if (!hasAnyRole(requiredRoles)) {
        router.push('/403')
        return false
      }
    }
    
    return true
  }
  
  return {
    checkRoutePermission
  }
}

// 导入已移到文件顶部

/**
 * 权限守卫 - 用于导航守卫
 */
export function createPermissionGuard(router: ReturnType<typeof useRouter>) {
  router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore()
    const meta = to.meta
    
    // 不需要认证
    if (!meta.requiresAuth) {
      next()
      return
    }
    
    // 未登录
    if (!authStore.isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    // 检查权限
    if (meta.permissions) {
      const permissions = authStore.user?.permissions || []
      const hasPermission = (meta.permissions as string[]).some(
        p => permissions.includes(p) || authStore.user?.roles?.includes('admin')
      )
      
      if (!hasPermission) {
        next('/403')
        return
      }
    }
    
    // 检查角色
    if (meta.roles) {
      const roles = authStore.user?.roles || []
      const hasRole = (meta.roles as string[]).some(r => roles.includes(r))
      
      if (!hasRole) {
        next('/403')
        return
      }
    }
    
    next()
  })
}

/**
 * 按钮级别权限控制
 */
export function useButtonPermission() {
  const { hasPermission, isAdmin } = usePermission()
  
  /**
   * 根据权限过滤按钮配置
   */
  const filterButtonsByPermission = <T extends { permission?: string; adminOnly?: boolean }>(
    buttons: T[]
  ): T[] => {
    return buttons.filter(btn => {
      // 仅管理员可访问
      if (btn.adminOnly && !isAdmin.value) return false
      
      // 需要特定权限
      if (btn.permission && !hasPermission(btn.permission)) return false
      
      return true
    })
  }
  
  return {
    filterButtonsByPermission
  }
}