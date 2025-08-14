import { ref, computed, watch } from 'vue'

// 主题状态
const isDarkMode = ref(false)
const systemPrefersDark = ref(false)
const themeMode = ref('system') // 'light', 'dark', 'system'

// 主题配置
const themes = {
  light: {
    name: 'Light',
    icon: '☀️',
    colors: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      secondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      background: '#ffffff',
      surface: '#f8fafc',
      surfaceHover: '#f1f5f9',
      text: '#1f2937',
      textSecondary: '#6b7280',
      textMuted: '#9ca3af',
      border: '#e5e7eb',
      borderHover: '#d1d5db',
      shadow: 'rgba(0, 0, 0, 0.1)',
      overlay: 'rgba(0, 0, 0, 0.5)'
    }
  },
  dark: {
    name: 'Dark',
    icon: '🌙',
    colors: {
      primary: '#60a5fa',
      primaryHover: '#3b82f6',
      secondary: '#9ca3af',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      background: '#111827',
      surface: '#1f2937',
      surfaceHover: '#374151',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      textMuted: '#9ca3af',
      border: '#374151',
      borderHover: '#4b5563',
      shadow: 'rgba(0, 0, 0, 0.3)',
      overlay: 'rgba(0, 0, 0, 0.7)'
    }
  }
}

// 当前主题
const currentTheme = computed(() => {
  if (themeMode.value === 'system') {
    return systemPrefersDark.value ? themes.dark : themes.light
  }
  return themes[themeMode.value] || themes.light
})

// 初始化主题
const initTheme = () => {
  // 检测系统主题偏好
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemPrefersDark.value = mediaQuery.matches
  
  // 监听系统主题变化
  mediaQuery.addEventListener('change', (e) => {
    systemPrefersDark.value = e.matches
  })
  
  // 从本地存储加载主题设置
  const savedTheme = localStorage.getItem('theme-mode')
  if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
    themeMode.value = savedTheme
  }
  
  // 计算当前是否为深色模式
  updateDarkMode()
}

// 更新深色模式状态
const updateDarkMode = () => {
  if (themeMode.value === 'system') {
    isDarkMode.value = systemPrefersDark.value
  } else {
    isDarkMode.value = themeMode.value === 'dark'
  }
}

// 设置主题
const setTheme = (mode) => {
  if (['light', 'dark', 'system'].includes(mode)) {
    themeMode.value = mode
    localStorage.setItem('theme-mode', mode)
    updateDarkMode()
  }
}

// 切换主题
const toggleTheme = () => {
  const modes = ['light', 'dark', 'system']
  const currentIndex = modes.indexOf(themeMode.value)
  const nextIndex = (currentIndex + 1) % modes.length
  setTheme(modes[nextIndex])
}

// 应用主题到DOM
const applyTheme = () => {
  const root = document.documentElement
  const theme = currentTheme.value
  
  // 设置CSS变量
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value)
  })
  
  // 设置dark类
  if (isDarkMode.value) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// 监听主题变化
watch([themeMode, systemPrefersDark], () => {
  updateDarkMode()
  applyTheme()
}, { immediate: true })

// 获取主题选项
const getThemeOptions = () => {
  return [
    { value: 'light', label: '浅色主题', icon: '☀️' },
    { value: 'dark', label: '深色主题', icon: '🌙' },
    { value: 'system', label: '跟随系统', icon: '🖥️' }
  ]
}

// 主题工具函数
const getThemeColor = (colorName) => {
  return currentTheme.value.colors[colorName] || '#000000'
}

const isCurrentTheme = (mode) => {
  return themeMode.value === mode
}

// 导出主题相关功能
export function useTheme() {
  return {
    // 状态
    isDarkMode,
    themeMode,
    currentTheme,
    systemPrefersDark,
    
    // 方法
    initTheme,
    setTheme,
    toggleTheme,
    applyTheme,
    getThemeOptions,
    getThemeColor,
    isCurrentTheme,
    
    // 主题配置
    themes
  }
}

// 主题初始化（自动执行）
if (typeof window !== 'undefined') {
  const { initTheme, applyTheme } = useTheme()
  initTheme()
  applyTheme()
}
