<template>
  <div class="hotkey-settings">
    <div class="hotkey-header">
      <h3>快捷键设置</h3>
      <div class="hotkey-actions">
        <el-switch v-model="localEnabled" @change="handleEnabledChange" />
        <span class="enable-label">{{ localEnabled ? '已启用' : '已禁用' }}</span>
        <el-button size="small" @click="resetToDefaults">恢复默认</el-button>
      </div>
    </div>
    
    <el-divider />
    
    <div class="hotkey-list">
      <div class="hotkey-category" v-for="category in hotkeyCategories" :key="category.name">
        <h4 class="category-title">{{ category.name }}</h4>
        <div class="hotkey-items">
          <div 
            v-for="hotkey in category.items" 
            :key="hotkey.key + (hotkey.ctrl || '')"
            class="hotkey-item"
          >
            <div class="hotkey-info">
              <span class="hotkey-description">{{ hotkey.description }}</span>
              <span class="hotkey-global-hint" v-if="hotkey.global">
                <el-tag size="small" type="info">全局</el-tag>
              </span>
            </div>
            <div class="hotkey-keys">
              <kbd class="hotkey-key" v-for="(part, idx) in formatHotkeyParts(hotkey)" :key="idx">
                {{ part }}
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <el-divider />
    
    <div class="hotkey-tips">
      <h4>提示</h4>
      <ul>
        <li>全局快捷键在所有页面都可用</li>
        <li>在输入框中，大部分快捷键会被禁用（除 Esc 外）</li>
        <li>Mac 用户：⌘ = Command，⇧ = Shift，⌥ = Option</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { formatHotkey, type HotkeyConfig } from '@/composables/useHotkeys'

// 默认快捷键列表
const defaultHotkeys: HotkeyConfig[] = [
  // 页面导航
  { key: 'd', ctrl: true, description: '前往仪表盘', action: () => {}, global: true },
  { key: 'a', ctrl: true, description: '前往分析页', action: () => {}, global: true },
  { key: 's', ctrl: true, description: '前往股票列表', action: () => {}, global: true },
  { key: 'r', ctrl: true, description: '前往报告页', action: () => {}, global: true },
  { key: 'f', ctrl: true, description: '前往自选股', action: () => {}, global: true },
  { key: 'p', ctrl: true, description: '前往模拟交易', action: () => {}, global: true },
  { key: ',', ctrl: true, description: '前往设置', action: () => {}, global: true },
  
  // 通用操作
  { key: '/', description: '快速搜索', action: () => {}, global: true },
  { key: 'Escape', description: '关闭对话框/取消', action: () => {}, global: true },
  
  // 图表操作
  { key: 'z', ctrl: true, description: '重置图表缩放', action: () => {}, global: false },
  { key: 'f', shift: true, description: '全屏图表', action: () => {}, global: false },
]

const localEnabled = ref(true)

// 快捷键分类
const hotkeyCategories = computed(() => [
  {
    name: '页面导航',
    items: defaultHotkeys.filter(h => h.ctrl && ['d', 'a', 's', 'r', 'f', 'p', ','].includes(h.key))
  },
  {
    name: '通用操作',
    items: defaultHotkeys.filter(h => !h.ctrl && !h.shift)
  },
  {
    name: '图表操作',
    items: defaultHotkeys.filter(h => h.global === false)
  }
])

// 格式化快捷键为部分数组
function formatHotkeyParts(hotkey: HotkeyConfig): string[] {
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
    'Backspace': '⌫',
    'Delete': '⌦',
  }
  
  parts.push(keyMap[hotkey.key] || hotkey.key.toUpperCase())
  
  return parts
}

// 处理启用状态变更
function handleEnabledChange(enabled: boolean) {
  localStorage.setItem('hotkey-enabled', String(enabled))
  ElMessage.success(enabled ? '快捷键已启用' : '快捷键已禁用')
}

// 恢复默认设置
function resetToDefaults() {
  localStorage.removeItem('hotkey-config')
  localEnabled.value = true
  ElMessage.success('已恢复默认快捷键设置')
}

onMounted(() => {
  const saved = localStorage.getItem('hotkey-enabled')
  if (saved !== null) {
    localEnabled.value = saved === 'true'
  }
})
</script>

<style lang="scss" scoped>
.hotkey-settings {
  .hotkey-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }
    
    .hotkey-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .enable-label {
        font-size: 13px;
        color: var(--el-text-color-regular);
      }
    }
  }
  
  .hotkey-list {
    .hotkey-category {
      margin-bottom: 24px;
      
      .category-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-secondary);
        margin: 0 0 12px 0;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--el-border-color-lighter);
      }
      
      .hotkey-items {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    }
  }
  
  .hotkey-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: var(--el-fill-color-light);
    border-radius: 6px;
    transition: background 0.2s;
    
    &:hover {
      background: var(--el-fill-color);
    }
    
    .hotkey-info {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .hotkey-description {
        font-size: 14px;
        color: var(--el-text-color-primary);
      }
    }
    
    .hotkey-keys {
      display: flex;
      gap: 4px;
      
      .hotkey-key {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        height: 24px;
        padding: 0 6px;
        font-size: 12px;
        font-family: var(--el-font-family);
        color: var(--el-text-color-regular);
        background: var(--el-bg-color);
        border: 1px solid var(--el-border-color);
        border-radius: 4px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }
    }
  }
  
  .hotkey-tips {
    h4 {
      font-size: 14px;
      font-weight: 500;
      margin: 0 0 12px 0;
    }
    
    ul {
      margin: 0;
      padding-left: 20px;
      
      li {
        margin: 6px 0;
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}
</style>