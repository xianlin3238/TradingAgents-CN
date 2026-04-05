<template>
  <div v-if="showGuide" class="user-guide">
    <div class="guide-overlay" @click="handleOverlayClick"></div>
    
    <div v-if="currentStep" class="guide-step" :style="stepStyle">
      <div class="guide-content">
        <div class="guide-header">
          <span class="guide-title">{{ currentStep.title }}</span>
          <span class="guide-progress">{{ currentStepIndex + 1 }}/{{ steps.length }}</span>
        </div>
        <div class="guide-body">{{ currentStep.content }}</div>
        <div class="guide-footer">
          <el-button v-if="currentStepIndex > 0" @click="prevStep">上一步</el-button>
          <el-button v-else @click="skipGuide">跳过</el-button>
          <el-button type="primary" @click="nextStep">
            {{ currentStepIndex < steps.length - 1 ? '下一步' : '完成' }}
          </el-button>
        </div>
      </div>
      <div class="guide-arrow" :class="arrowClass"></div>
    </div>
    
    <div v-if="currentStep?.target" class="guide-highlight" :style="highlightStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface GuideStep {
  target?: string
  title: string
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const props = defineProps<{
  steps: GuideStep[]
  storageKey?: string
}>()

const emit = defineEmits<{
  (e: 'complete'): void
  (e: 'skip'): void
}>()

const showGuide = ref(false)
const currentStepIndex = ref(0)
const targetRect = ref<DOMRect | null>(null)

const currentStep = computed(() => props.steps[currentStepIndex.value])

const stepStyle = computed(() => {
  if (!currentStep.value?.target || !targetRect.value) {
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  }
  
  const rect = targetRect.value
  const position = currentStep.value.position || 'bottom'
  const gap = 12
  
  switch (position) {
    case 'top':
      return { top: `${rect.top - gap}px`, left: `${rect.left + rect.width / 2}px`, transform: 'translate(-50%, -100%)' }
    case 'bottom':
      return { top: `${rect.bottom + gap}px`, left: `${rect.left + rect.width / 2}px`, transform: 'translateX(-50%)' }
    case 'left':
      return { top: `${rect.top + rect.height / 2}px`, left: `${rect.left - gap}px`, transform: 'translate(-100%, -50%)' }
    case 'right':
      return { top: `${rect.top + rect.height / 2}px`, left: `${rect.right + gap}px`, transform: 'translateY(-50%)' }
    default:
      return {}
  }
})

const highlightStyle = computed(() => {
  if (!targetRect.value) return {}
  const rect = targetRect.value
  return { top: `${rect.top - 4}px`, left: `${rect.left - 4}px`, width: `${rect.width + 8}px`, height: `${rect.height + 8}px` }
})

const arrowClass = computed(() => {
  const position = currentStep.value?.position || 'bottom'
  return `arrow-${position === 'bottom' ? 'top' : position === 'top' ? 'bottom' : position}`
})

const updateTargetRect = () => {
  if (currentStep.value?.target) {
    const el = document.querySelector(currentStep.value.target)
    if (el) {
      targetRect.value = el.getBoundingClientRect()
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  } else {
    targetRect.value = null
  }
}

const nextStep = () => {
  if (currentStepIndex.value < props.steps.length - 1) {
    currentStepIndex.value++
    updateTargetRect()
  } else {
    completeGuide()
  }
}

const prevStep = () => {
  if (currentStepIndex.value > 0) {
    currentStepIndex.value--
    updateTargetRect()
  }
}

const skipGuide = () => {
  saveGuideState(true)
  showGuide.value = false
  emit('skip')
}

const completeGuide = () => {
  saveGuideState(true)
  showGuide.value = false
  emit('complete')
}

const handleOverlayClick = () => { /* 可选：点击遮罩跳过 */ }

const saveGuideState = (completed: boolean) => {
  if (props.storageKey) {
    localStorage.setItem(props.storageKey, JSON.stringify({ completed }))
  }
}

const checkGuideState = () => {
  if (props.storageKey) {
    const state = localStorage.getItem(props.storageKey)
    if (state) {
      return JSON.parse(state).completed
    }
  }
  return false
}

const startGuide = () => {
  if (!checkGuideState()) {
    showGuide.value = true
    currentStepIndex.value = 0
    setTimeout(updateTargetRect, 100)
  }
}

const resetGuide = () => {
  if (props.storageKey) localStorage.removeItem(props.storageKey)
  startGuide()
}

watch(currentStepIndex, updateTargetRect)

onMounted(() => {
  if (props.steps.length > 0) startGuide()
})

defineExpose({ startGuide, resetGuide })
</script>

<style scoped>
.user-guide {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  pointer-events: none;
}

.guide-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  pointer-events: auto;
}

.guide-step {
  position: absolute;
  pointer-events: auto;
  z-index: 10000;
}

.guide-content {
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 16px;
  max-width: 320px;
}

.guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.guide-title {
  font-weight: 600;
  font-size: 16px;
}

.guide-progress {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.guide-body {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin-bottom: 16px;
}

.guide-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.guide-arrow {
  position: absolute;
  border: 8px solid transparent;
}

.guide-arrow.arrow-top {
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: var(--el-bg-color);
}

.guide-arrow.arrow-bottom {
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: var(--el-bg-color);
}

.guide-arrow.arrow-left {
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: var(--el-bg-color);
}

.guide-arrow.arrow-right {
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: var(--el-bg-color);
}

.guide-highlight {
  position: absolute;
  border: 2px solid var(--el-color-primary);
  border-radius: 4px;
  pointer-events: none;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(64, 158, 255, 0); }
}
</style>