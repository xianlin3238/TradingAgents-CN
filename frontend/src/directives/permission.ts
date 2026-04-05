/**
 * 权限指令
 * 用于元素级别的权限控制
 * 
 * 使用示例：
 * v-permission="'user:create'"        // 单个权限
 * v-permission="['user:create', 'user:edit']"  // 任一权限
 * v-permission:role="'admin'"         // 角色检查
 * v-permission:all="['perm1', 'perm2']"  // 需要全部权限
 */

import type { Directive, DirectiveBinding } from 'vue'
import { usePermission } from '@/composables/usePermission'

type PermissionValue = string | string[]
type PermissionMode = 'any' | 'all' | 'role'

/**
 * 检查权限
 */
function checkPermission(
  value: PermissionValue,
  mode: PermissionMode = 'any'
): boolean {
  const { hasAnyPermission, hasAllPermissions, hasAnyRole, isAdmin } = usePermission()
  
  // 管理员拥有所有权限
  if (isAdmin.value) return true
  
  const permissions = Array.isArray(value) ? value : [value]
  
  switch (mode) {
    case 'all':
      return hasAllPermissions(permissions)
    case 'role':
      return hasAnyRole(permissions)
    case 'any':
    default:
      return hasAnyPermission(permissions)
  }
}

/**
 * 权限指令
 */
export const vPermission: Directive<HTMLElement, PermissionValue> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
    const mode: PermissionMode = binding.arg as PermissionMode || 'any'
    const hasPermission = checkPermission(binding.value, mode)
    
    if (!hasPermission) {
      el.parentNode?.removeChild(el)
    }
  },
  
  updated(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
    const mode: PermissionMode = binding.arg as PermissionMode || 'any'
    const hasPermission = checkPermission(binding.value, mode)
    
    if (!hasPermission) {
      el.parentNode?.removeChild(el)
    }
  }
}

/**
 * 权限禁用指令
 * 没有权限时禁用元素而不是移除
 */
export const vPermissionDisabled: Directive<HTMLElement, PermissionValue> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
    const mode: PermissionMode = binding.arg as PermissionMode || 'any'
    const hasPermission = checkPermission(binding.value, mode)
    
    if (!hasPermission) {
      el.setAttribute('disabled', 'true')
      el.classList.add('is-disabled', 'el-button--disabled')
      el.style.pointerEvents = 'none'
      el.style.opacity = '0.5'
    }
  },
  
  updated(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
    const mode: PermissionMode = binding.arg as PermissionMode || 'any'
    const hasPermission = checkPermission(binding.value, mode)
    
    if (!hasPermission) {
      el.setAttribute('disabled', 'true')
      el.classList.add('is-disabled', 'el-button--disabled')
      el.style.pointerEvents = 'none'
      el.style.opacity = '0.5'
    } else {
      el.removeAttribute('disabled')
      el.classList.remove('is-disabled', 'el-button--disabled')
      el.style.pointerEvents = ''
      el.style.opacity = ''
    }
  }
}

/**
 * 角色指令
 */
export const vRole: Directive<HTMLElement, PermissionValue> = {
  mounted(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
    const hasRole = checkPermission(binding.value, 'role')
    
    if (!hasRole) {
      el.parentNode?.removeChild(el)
    }
  },
  
  updated(el: HTMLElement, binding: DirectiveBinding<PermissionValue>) {
    const hasRole = checkPermission(binding.value, 'role')
    
    if (!hasRole) {
      el.parentNode?.removeChild(el)
    }
  }
}

/**
 * 管理员指令
 * 仅管理员可见
 */
export const vAdmin: Directive<HTMLElement> = {
  mounted(el: HTMLElement) {
    const { isAdmin } = usePermission()
    
    if (!isAdmin.value) {
      el.parentNode?.removeChild(el)
    }
  }
}

/**
 * 登录指令
 * 仅登录用户可见
 */
export const vAuth: Directive<HTMLElement> = {
  mounted(el: HTMLElement) {
    const { isAuthenticated } = usePermission()
    
    if (!isAuthenticated.value) {
      el.parentNode?.removeChild(el)
    }
  },
  
  updated(el: HTMLElement) {
    const { isAuthenticated } = usePermission()
    
    if (!isAuthenticated.value) {
      el.parentNode?.removeChild(el)
    }
  }
}

/**
 * 注册所有权限指令
 */
export function setupPermissionDirectives(app: ReturnType<typeof import('vue').createApp>) {
  app.directive('permission', vPermission)
  app.directive('permission-disabled', vPermissionDisabled)
  app.directive('role', vRole)
  app.directive('admin', vAdmin)
  app.directive('auth', vAuth)
}

// 默认导出
export default {
  vPermission,
  vPermissionDisabled,
  vRole,
  vAdmin,
  vAuth,
  setupPermissionDirectives
}