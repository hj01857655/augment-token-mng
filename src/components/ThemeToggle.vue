<template>
  <div class="theme-toggle">
    <button 
      @click="showThemeMenu = !showThemeMenu"
      class="theme-button"
      :title="`当前主题: ${currentThemeOption.label}`"
    >
      <span class="theme-icon">{{ currentThemeOption.icon }}</span>
      <span class="theme-label">{{ currentThemeOption.label }}</span>
      <svg 
        width="12" 
        height="12" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        :class="['dropdown-icon', { 'rotated': showThemeMenu }]"
      >
        <path d="M7 10l5 5 5-5z"/>
      </svg>
    </button>
    
    <!-- 主题选择菜单 -->
    <Transition name="theme-menu">
      <div v-if="showThemeMenu" class="theme-menu" @click.stop>
        <div class="theme-menu-header">
          <h4>选择主题</h4>
        </div>
        <div class="theme-options">
          <button
            v-for="option in themeOptions"
            :key="option.value"
            @click="selectTheme(option.value)"
            :class="['theme-option', { 'active': isCurrentTheme(option.value) }]"
          >
            <span class="option-icon">{{ option.icon }}</span>
            <span class="option-label">{{ option.label }}</span>
            <svg 
              v-if="isCurrentTheme(option.value)"
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              class="check-icon"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </button>
        </div>
        <div class="theme-menu-footer">
          <div class="theme-preview">
            <div class="preview-colors">
              <div 
                v-for="(color, name) in previewColors" 
                :key="name"
                class="color-dot"
                :style="{ backgroundColor: color }"
                :title="name"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
    
    <!-- 点击外部关闭菜单 -->
    <div 
      v-if="showThemeMenu" 
      class="theme-overlay" 
      @click="showThemeMenu = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTheme } from '../composables/useTheme.js'

// 主题功能
const { 
  themeMode, 
  setTheme, 
  getThemeOptions, 
  isCurrentTheme, 
  currentTheme 
} = useTheme()

// 组件状态
const showThemeMenu = ref(false)

// 主题选项
const themeOptions = getThemeOptions()

// 当前主题选项
const currentThemeOption = computed(() => {
  return themeOptions.find(option => option.value === themeMode.value) || themeOptions[0]
})

// 预览颜色
const previewColors = computed(() => {
  const theme = currentTheme.value
  return {
    primary: theme.colors.primary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error
  }
})

// 选择主题
const selectTheme = (mode) => {
  setTheme(mode)
  showThemeMenu.value = false
}

// 键盘事件处理
const handleKeydown = (event) => {
  if (event.key === 'Escape' && showThemeMenu.value) {
    showThemeMenu.value = false
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.theme-toggle {
  position: relative;
  display: inline-block;
}

.theme-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-surface, #f8fafc);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 8px;
  color: var(--color-text, #1f2937);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  min-width: 120px;
}

.theme-button:hover {
  background: var(--color-surfaceHover, #f1f5f9);
  border-color: var(--color-borderHover, #d1d5db);
}

.theme-icon {
  font-size: 16px;
}

.theme-label {
  flex: 1;
  text-align: left;
}

.dropdown-icon {
  transition: transform 0.2s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.theme-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: var(--color-background, #ffffff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 12px;
  box-shadow: 0 10px 25px var(--color-shadow, rgba(0, 0, 0, 0.1));
  z-index: 1000;
  min-width: 200px;
  overflow: hidden;
}

.theme-menu-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  background: var(--color-surface, #f8fafc);
}

.theme-menu-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text, #1f2937);
}

.theme-options {
  padding: 8px 0;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  color: var(--color-text, #1f2937);
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-align: left;
}

.theme-option:hover {
  background: var(--color-surface, #f8fafc);
}

.theme-option.active {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.option-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.option-label {
  flex: 1;
  font-size: 14px;
}

.check-icon {
  opacity: 0.8;
}

.theme-menu-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--color-border, #e5e7eb);
  background: var(--color-surface, #f8fafc);
}

.preview-colors {
  display: flex;
  gap: 6px;
  align-items: center;
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--color-background, #ffffff);
  box-shadow: 0 1px 3px var(--color-shadow, rgba(0, 0, 0, 0.1));
}

.theme-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

/* 动画 */
.theme-menu-enter-active,
.theme-menu-leave-active {
  transition: all 0.2s ease;
}

.theme-menu-enter-from,
.theme-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.theme-menu-enter-to,
.theme-menu-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 深色模式适配 */
:global(.dark) .theme-button {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}

:global(.dark) .theme-menu {
  background: var(--color-background);
  border-color: var(--color-border);
}
</style>
