/**
 * 响应式布局 composable
 * 提供统一的响应式断点判断
 */

import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useWindowSize } from '@vueuse/core'

// 断点定义 (与 Element Plus 一致)
export const BREAKPOINTS = {
  xs: 0,      // < 576px
  sm: 576,    // >= 576px
  md: 768,    // >= 768px
  lg: 992,    // >= 992px
  xl: 1200,   // >= 1200px
  xxl: 1400   // >= 1400px
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * 响应式断点 composable
 */
export function useResponsive() {
  const { width, height } = useWindowSize()
  
  // 当前断点
  const currentBreakpoint = computed<Breakpoint>(() => {
    if (width.value < BREAKPOINTS.sm) return 'xs'
    if (width.value < BREAKPOINTS.md) return 'sm'
    if (width.value < BREAKPOINTS.lg) return 'md'
    if (width.value < BREAKPOINTS.xl) return 'lg'
    if (width.value < BREAKPOINTS.xxl) return 'xl'
    return 'xxl'
  })
  
  // 设备类型判断
  const isMobile = computed(() => width.value < BREAKPOINTS.md)
  const isTablet = computed(() => width.value >= BREAKPOINTS.md && width.value < BREAKPOINTS.lg)
  const isDesktop = computed(() => width.value >= BREAKPOINTS.lg)
  const isLargeDesktop = computed(() => width.value >= BREAKPOINTS.xl)
  
  // 方向判断
  const isLandscape = computed(() => width.value > height.value)
  const isPortrait = computed(() => width.value <= height.value)
  
  // 断点判断方法
  const isBreakpoint = (bp: Breakpoint) => computed(() => currentBreakpoint.value === bp)
  const isAtLeast = (bp: Breakpoint) => computed(() => width.value >= BREAKPOINTS[bp])
  const isAtMost = (bp: Breakpoint) => computed(() => width.value < BREAKPOINTS[bp])
  
  return {
    width,
    height,
    currentBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isLandscape,
    isPortrait,
    isBreakpoint,
    isAtLeast,
    isAtMost,
    BREAKPOINTS
  }
}

/**
 * 触摸设备检测
 */
export function useTouchDevice() {
  const isTouchDevice = ref(false)
  const hasTouch = ref(false)
  
  const checkTouch = () => {
    hasTouch.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    isTouchDevice.value = hasTouch.value && window.matchMedia('(pointer: coarse)').matches
  }
  
  onMounted(() => {
    checkTouch()
    window.addEventListener('touchstart', checkTouch, { once: true })
  })
  
  onUnmounted(() => {
    window.removeEventListener('touchstart', checkTouch)
  })
  
  return {
    isTouchDevice,
    hasTouch
  }
}

/**
 * 安全区域 inset (适配 iPhone X 等有刘海的设备)
 */
export function useSafeArea() {
  const safeAreaInsets = ref({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  })
  
  const updateSafeArea = () => {
    const computedStyle = getComputedStyle(document.documentElement)
    safeAreaInsets.value = {
      top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
      right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
      bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0')
    }
  }
  
  onMounted(() => {
    updateSafeArea()
    window.addEventListener('resize', updateSafeArea)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', updateSafeArea)
  })
  
  return {
    safeAreaInsets
  }
}

/**
 * 获取适合当前设备的列数
 */
export function useGridColumns(options?: {
  xs?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
  xxl?: number
}) {
  const { currentBreakpoint } = useResponsive()
  
  const defaultColumns: Record<string, number> = {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
    xxl: 4,
    ...options
  }
  
  return computed(() => defaultColumns[currentBreakpoint.value] || defaultColumns.lg)
}

/**
 * 虚拟键盘检测 (移动端)
 */
export function useVirtualKeyboard() {
  const isKeyboardVisible = ref(false)
  const keyboardHeight = ref(0)
  
  const checkKeyboard = () => {
    // 使用 Visual API 检测
    if (window.visualViewport) {
      keyboardHeight.value = window.innerHeight - window.visualViewport.height
      isKeyboardVisible.value = keyboardHeight.value > 100
    }
  }
  
  onMounted(() => {
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', checkKeyboard)
      window.visualViewport.addEventListener('scroll', checkKeyboard)
    }
  })
  
  onUnmounted(() => {
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', checkKeyboard)
      window.visualViewport.removeEventListener('scroll', checkKeyboard)
    }
  })
  
  return {
    isKeyboardVisible,
    keyboardHeight
  }
}