/**
 * 全局快捷键 composable
 */

import { onMounted, onUnmounted, ref, computed } from 'vue'

// 快捷键配置类型
export interface HotkeyConfig {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  description: string
  action: () => void
  global?: boolean // 是否在所有页面生效
}

// 格式化快捷键显示
export function formatHotkey(hotkey: HotkeyConfig): string {
  const parts: string[] = []
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  
  if (hotkey.ctrl) {
    parts.push(isMac ? '⌘' : 'Ctrl')
  }
  if (hotkey.shift) {
    parts.push(isMac ? '⇧' : 'Shift')
  }
  if (hotkey.alt) {
    parts.push(isMac ? '⌥' : 'Alt')
  }
  
  // 特殊键映射
  const keyMap: Record<string, string> = {
    'Escape': 'Esc',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Enter': '↵',
  }
  
  parts.push(keyMap[hotkey.key] || hotkey.key.toUpperCase())
  
  return parts.join('+')
}

// 检查快捷键是否匹配
function matchesHotkey(event: KeyboardEvent, config: HotkeyConfig): boolean {
  const keyMatch = event.key.toLowerCase() === config.key.toLowerCase()
  const ctrlMatch = config.ctrl ? (event.ctrlKey || event.metaKey) : (!event.ctrlKey && !event.metaKey)
  const shiftMatch = config.shift ? event.shiftKey : !event.shiftKey
  const altMatch = config.alt ? event.altKey : !event.altKey
  
  return keyMatch && ctrlMatch && shiftMatch && altMatch
}

// 检查是否在输入元素中
function isInInputElement(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement
  const tagName = target.tagName.toLowerCase()
  
  // 在这些元素中，不触发快捷键
  if (['input', 'textarea', 'select'].includes(tagName)) {
    // 但 Escape 键例外
    return event.key !== 'Escape'
  }
  
  // contenteditable 元素
  if (target.isContentEditable) {
    return event.key !== 'Escape'
  }
  
  return false
}

// 全局快捷键状态
const globalHotkeys = ref<HotkeyConfig[]>([])
const isHotkeysEnabled = ref(true)

// 注册全局快捷键
export function registerHotkeys(hotkeys: HotkeyConfig[]) {
  hotkeys.forEach(h => {
    // 避免重复注册
    const exists = globalHotkeys.value.some(
      g => g.key === h.key && g.ctrl === h.ctrl && g.shift === h.shift && g.alt === h.alt
    )
    if (!exists) {
      globalHotkeys.value.push(h)
    }
  })
}

// 取消注册
export function unregisterHotkeys(hotkeys: HotkeyConfig[]) {
  hotkeys.forEach(h => {
    const idx = globalHotkeys.value.findIndex(
      g => g.key === h.key && g.ctrl === h.ctrl && g.shift === h.shift && g.alt === h.alt
    )
    if (idx >= 0) {
      globalHotkeys.value.splice(idx, 1)
    }
  })
}

// 处理键盘事件
function handleKeydown(event: KeyboardEvent) {
  // 检查是否启用
  if (!isHotkeysEnabled.value) return
  
  // 检查是否在输入元素中
  if (isInInputElement(event)) return
  
  // 查找匹配的快捷键
  for (const hotkey of globalHotkeys.value) {
    if (matchesHotkey(event, hotkey)) {
      event.preventDefault()
      hotkey.action()
      return
    }
  }
}

// 初始化全局监听
let listenerCount = 0

export function useHotkeys() {
  const route = useRoute()
  
  // 局部快捷键
  const localHotkeys = ref<HotkeyConfig[]>([])
  
  // 注册局部快捷键
  const register = (hotkeys: HotkeyConfig[]) => {
    localHotkeys.value = hotkeys
    registerHotkeys(hotkeys)
  }
  
  // 清理局部快捷键
  const cleanup = () => {
    unregisterHotkeys(localHotkeys.value)
    localHotkeys.value = []
  }
  
  onMounted(() => {
    // 初始化时检查启用状态
    const savedEnabled = localStorage.getItem('hotkey-enabled')
    if (savedEnabled !== null) {
      isHotkeysEnabled.value = savedEnabled === 'true'
    }
    
    // 添加全局监听器（只添加一次）
    if (listenerCount === 0) {
      window.addEventListener('keydown', handleKeydown)
    }
    listenerCount++
    void route // 路由引用（保留用于未来扩展）
  })
  
  onUnmounted(() => {
    listenerCount--
    if (listenerCount === 0) {
      window.removeEventListener('keydown', handleKeydown)
    }
    cleanup()
  })
  
  onUnmounted(() => {
    cleanup()
    listenerCount--
    if (listenerCount === 0) {
      window.removeEventListener('keydown', handleKeydown)
    }
  })
  
  // 启用/禁用快捷键
  const setEnabled = (enabled: boolean) => {
    isHotkeysEnabled.value = enabled
    localStorage.setItem('hotkey-enabled', String(enabled))
  }
  
  return {
    register,
    cleanup,
    setEnabled,
    isEnabled: computed(() => isHotkeysEnabled.value),
    hotkeys: computed(() => globalHotkeys.value)
  }
}

// 页面导航快捷键
export function useNavigationHotkeys() {
  const router = useRouter()
  
  const navigationHotkeys: HotkeyConfig[] = [
    { key: 'd', ctrl: true, description: '前往仪表盘', action: () => router.push('/dashboard'), global: true },
    { key: 'a', ctrl: true, description: '前往分析页', action: () => router.push('/analysis'), global: true },
    { key: 's', ctrl: true, description: '前往股票列表', action: () => router.push('/stocks'), global: true },
    { key: 'r', ctrl: true, description: '前往报告页', action: () => router.push('/reports'), global: true },
    { key: 'f', ctrl: true, description: '前往自选股', action: () => router.push('/favorites'), global: true },
    { key: 'p', ctrl: true, description: '前往模拟交易', action: () => router.push('/paper-trading'), global: true },
    { key: ',', ctrl: true, description: '前往设置', action: () => router.push('/settings'), global: true },
    { key: '/', description: '快速搜索', action: () => {
      // 触发搜索弹窗
      window.dispatchEvent(new CustomEvent('open-quick-search'))
    }, global: true },
    { key: 'Escape', description: '关闭对话框', action: () => {
      // 触发关闭事件
      window.dispatchEvent(new CustomEvent('close-dialog'))
    }, global: true }
  ]
  
  const { register, cleanup } = useHotkeys()
  
  onMounted(() => {
    register(navigationHotkeys)
  })
  
  onUnmounted(() => {
    cleanup()
  })
  
  return {
    navigationHotkeys
  }
}