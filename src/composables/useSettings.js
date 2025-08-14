import { ref, watch, computed } from 'vue'

// 默认设置
const defaultSettings = {
  // 外观设置
  theme: 'system', // 'light', 'dark', 'system'
  language: 'zh-CN', // 'zh-CN', 'en-US'
  
  // 通知设置
  notifications: {
    enabled: true,
    desktop: false,
    sound: false,
    duration: 5000
  },
  
  // 编辑器设置
  editor: {
    defaultEditor: 'cursor',
    rememberLastUsed: true,
    showUsageStats: true
  },
  
  // 安全设置
  security: {
    autoLock: false,
    lockTimeout: 300000, // 5分钟
    encryptStorage: false
  },
  
  // 备份设置
  backup: {
    autoBackup: true,
    backupInterval: 86400000, // 24小时
    maxBackups: 10
  },
  
  // 性能设置
  performance: {
    enableCache: true,
    cacheTimeout: 300000, // 5分钟
    maxCacheSize: 100
  },
  
  // 高级设置
  advanced: {
    debugMode: false,
    logLevel: 'info', // 'debug', 'info', 'warn', 'error'
    enableTelemetry: true
  }
}

// 当前设置
const settings = ref({ ...defaultSettings })

// 设置是否已加载
const isLoaded = ref(false)

// 从本地存储加载设置
const loadSettings = () => {
  try {
    const savedSettings = localStorage.getItem('app-settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      // 合并默认设置和保存的设置
      settings.value = mergeSettings(defaultSettings, parsed)
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
    settings.value = { ...defaultSettings }
  }
  isLoaded.value = true
}

// 保存设置到本地存储
const saveSettings = () => {
  try {
    localStorage.setItem('app-settings', JSON.stringify(settings.value))
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

// 深度合并设置对象
const mergeSettings = (defaults, saved) => {
  const result = { ...defaults }
  
  for (const key in saved) {
    if (saved[key] !== null && typeof saved[key] === 'object' && !Array.isArray(saved[key])) {
      result[key] = mergeSettings(defaults[key] || {}, saved[key])
    } else {
      result[key] = saved[key]
    }
  }
  
  return result
}

// 重置设置
const resetSettings = () => {
  settings.value = { ...defaultSettings }
  saveSettings()
}

// 重置特定分类的设置
const resetCategory = (category) => {
  if (defaultSettings[category]) {
    settings.value[category] = { ...defaultSettings[category] }
    saveSettings()
  }
}

// 获取设置值
const getSetting = (path) => {
  const keys = path.split('.')
  let value = settings.value
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      return undefined
    }
  }
  
  return value
}

// 设置值
const setSetting = (path, value) => {
  const keys = path.split('.')
  const lastKey = keys.pop()
  let target = settings.value
  
  for (const key of keys) {
    if (!target[key] || typeof target[key] !== 'object') {
      target[key] = {}
    }
    target = target[key]
  }
  
  target[lastKey] = value
  saveSettings()
}

// 批量更新设置
const updateSettings = (updates) => {
  for (const [path, value] of Object.entries(updates)) {
    setSetting(path, value)
  }
}

// 导出设置
const exportSettings = () => {
  const exportData = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    settings: settings.value
  }
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `augment-settings-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 导入设置
const importSettings = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        
        if (data.settings) {
          settings.value = mergeSettings(defaultSettings, data.settings)
          saveSettings()
          resolve(true)
        } else {
          reject(new Error('Invalid settings file format'))
        }
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// 设置验证
const validateSetting = (path, value) => {
  // 基本类型验证
  const defaultValue = getSetting(path)
  if (defaultValue !== undefined && typeof value !== typeof defaultValue) {
    return false
  }
  
  // 特定设置的验证规则
  const validationRules = {
    'theme': (val) => ['light', 'dark', 'system'].includes(val),
    'language': (val) => ['zh-CN', 'en-US'].includes(val),
    'notifications.duration': (val) => val >= 1000 && val <= 30000,
    'security.lockTimeout': (val) => val >= 60000 && val <= 3600000,
    'backup.backupInterval': (val) => val >= 3600000 && val <= 604800000,
    'backup.maxBackups': (val) => val >= 1 && val <= 100,
    'performance.cacheTimeout': (val) => val >= 60000 && val <= 3600000,
    'performance.maxCacheSize': (val) => val >= 10 && val <= 1000,
    'advanced.logLevel': (val) => ['debug', 'info', 'warn', 'error'].includes(val)
  }
  
  const rule = validationRules[path]
  return rule ? rule(value) : true
}

// 计算属性：设置分类
const settingsCategories = computed(() => [
  {
    key: 'appearance',
    name: '外观',
    icon: '🎨',
    settings: ['theme', 'language']
  },
  {
    key: 'notifications',
    name: '通知',
    icon: '🔔',
    settings: ['notifications']
  },
  {
    key: 'editor',
    name: '编辑器',
    icon: '⚡',
    settings: ['editor']
  },
  {
    key: 'security',
    name: '安全',
    icon: '🔒',
    settings: ['security']
  },
  {
    key: 'backup',
    name: '备份',
    icon: '💾',
    settings: ['backup']
  },
  {
    key: 'performance',
    name: '性能',
    icon: '🚀',
    settings: ['performance']
  },
  {
    key: 'advanced',
    name: '高级',
    icon: '⚙️',
    settings: ['advanced']
  }
])

// 监听设置变化
watch(settings, saveSettings, { deep: true })

// 导出设置功能
export function useSettings() {
  return {
    // 状态
    settings,
    isLoaded,
    settingsCategories,
    
    // 方法
    loadSettings,
    saveSettings,
    resetSettings,
    resetCategory,
    getSetting,
    setSetting,
    updateSettings,
    exportSettings,
    importSettings,
    validateSetting,
    
    // 默认设置
    defaultSettings
  }
}

// 自动加载设置
if (typeof window !== 'undefined') {
  const { loadSettings } = useSettings()
  loadSettings()
}
