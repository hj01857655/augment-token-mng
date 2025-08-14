<template>
  <div class="language-toggle">
    <button 
      @click="showLanguageMenu = !showLanguageMenu"
      class="language-button"
      :title="`当前语言: ${currentLanguage.name}`"
    >
      <span class="language-flag">{{ currentLanguage.flag }}</span>
      <span class="language-name">{{ currentLanguage.name }}</span>
      <svg 
        width="12" 
        height="12" 
        viewBox="0 0 24 24" 
        fill="currentColor"
        :class="['dropdown-icon', { 'rotated': showLanguageMenu }]"
      >
        <path d="M7 10l5 5 5-5z"/>
      </svg>
    </button>
    
    <!-- 语言选择菜单 -->
    <Transition name="language-menu">
      <div v-if="showLanguageMenu" class="language-menu" @click.stop>
        <div class="language-menu-header">
          <h4>{{ t('common.settings') }} - {{ t('common.language', 'Language') }}</h4>
        </div>
        <div class="language-options">
          <button
            v-for="locale in availableLocales"
            :key="locale.code"
            @click="selectLanguage(locale.code)"
            :class="['language-option', { 'active': currentLocale === locale.code }]"
          >
            <span class="option-flag">{{ locale.flag }}</span>
            <span class="option-name">{{ locale.name }}</span>
            <svg 
              v-if="currentLocale === locale.code"
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
        <div class="language-menu-footer">
          <div class="language-info">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="info-icon">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            <span class="info-text">语言设置会自动保存</span>
          </div>
        </div>
      </div>
    </Transition>
    
    <!-- 点击外部关闭菜单 -->
    <div 
      v-if="showLanguageMenu" 
      class="language-overlay" 
      @click="showLanguageMenu = false"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '../composables/useI18n.js'

// 国际化功能
const { currentLocale, setLocale, getAvailableLocales, t } = useI18n()

// 组件状态
const showLanguageMenu = ref(false)

// 可用语言
const availableLocales = getAvailableLocales()

// 当前语言信息
const currentLanguage = computed(() => {
  return availableLocales.find(locale => locale.code === currentLocale.value) || availableLocales[0]
})

// 选择语言
const selectLanguage = (code) => {
  setLocale(code)
  showLanguageMenu.value = false
  
  // 发出语言变更事件
  window.dispatchEvent(new CustomEvent('language-changed', { detail: code }))
}

// 键盘事件处理
const handleKeydown = (event) => {
  if (event.key === 'Escape' && showLanguageMenu.value) {
    showLanguageMenu.value = false
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
.language-toggle {
  position: relative;
  display: inline-block;
}

.language-button {
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
  min-width: 100px;
}

.language-button:hover {
  background: var(--color-surfaceHover, #f1f5f9);
  border-color: var(--color-borderHover, #d1d5db);
}

.language-flag {
  font-size: 16px;
}

.language-name {
  flex: 1;
  text-align: left;
  font-size: 13px;
}

.dropdown-icon {
  transition: transform 0.2s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.language-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: var(--color-background, #ffffff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 12px;
  box-shadow: 0 10px 25px var(--color-shadow, rgba(0, 0, 0, 0.1));
  z-index: 1000;
  min-width: 180px;
  overflow: hidden;
}

.language-menu-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
  background: var(--color-surface, #f8fafc);
}

.language-menu-header h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text, #1f2937);
}

.language-options {
  padding: 8px 0;
}

.language-option {
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

.language-option:hover {
  background: var(--color-surface, #f8fafc);
}

.language-option.active {
  background: var(--color-primary, #3b82f6);
  color: white;
}

.option-flag {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.option-name {
  flex: 1;
  font-size: 14px;
}

.check-icon {
  opacity: 0.8;
}

.language-menu-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--color-border, #e5e7eb);
  background: var(--color-surface, #f8fafc);
}

.language-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-icon {
  color: var(--color-textMuted, #9ca3af);
}

.info-text {
  font-size: 12px;
  color: var(--color-textMuted, #9ca3af);
}

.language-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

/* 动画 */
.language-menu-enter-active,
.language-menu-leave-active {
  transition: all 0.2s ease;
}

.language-menu-enter-from,
.language-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.language-menu-enter-to,
.language-menu-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* 深色模式适配 */
:global(.dark) .language-button {
  background: var(--color-surface);
  border-color: var(--color-border);
  color: var(--color-text);
}

:global(.dark) .language-menu {
  background: var(--color-background);
  border-color: var(--color-border);
}
</style>
