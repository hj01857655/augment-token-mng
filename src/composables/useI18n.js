import { ref, computed } from 'vue'

// 当前语言
const currentLocale = ref('zh-CN')

// 语言配置
const locales = {
  'zh-CN': {
    name: '简体中文',
    flag: '🇨🇳',
    messages: {
      // 通用
      common: {
        confirm: '确认',
        cancel: '取消',
        save: '保存',
        delete: '删除',
        edit: '编辑',
        copy: '复制',
        close: '关闭',
        loading: '加载中...',
        success: '成功',
        error: '错误',
        warning: '警告',
        info: '信息',
        search: '搜索',
        filter: '过滤',
        export: '导出',
        import: '导入',
        refresh: '刷新',
        settings: '设置',
        help: '帮助',
        about: '关于'
      },
      
      // 应用标题
      app: {
        title: 'Augment Token Manager',
        subtitle: '智能Token管理工具'
      },
      
      // Token相关
      token: {
        list: '已保存Token',
        add: '新建Token',
        generate: '生成Token',
        tenantUrl: '租户URL',
        accessToken: 'Access Token',
        portalUrl: 'Portal URL',
        emailNote: '邮箱备注',
        status: '状态',
        active: '正常',
        suspended: '已封禁',
        unknown: '未知',
        createdAt: '创建时间',
        copySuccess: '复制成功',
        copyFailed: '复制失败',
        deleteConfirm: '确定要删除这个Token吗？此操作无法撤销。',
        deleteSuccess: 'Token删除成功',
        deleteFailed: 'Token删除失败',
        saveSuccess: 'Token保存成功',
        saveFailed: 'Token保存失败'
      },
      
      // 编辑器
      editor: {
        oneClickLogin: '一键上号',
        selectEditor: '选择编辑器',
        cursor: 'Cursor',
        vscode: 'VS Code',
        webstorm: 'WebStorm',
        sublime: 'Sublime Text',
        atom: 'Atom',
        recommended: '推荐',
        installed: '已安装',
        opening: '正在打开',
        openFailed: '打开失败'
      },
      
      // 主题
      theme: {
        light: '浅色主题',
        dark: '深色主题',
        system: '跟随系统',
        selectTheme: '选择主题'
      },
      
      // 搜索和过滤
      search: {
        placeholder: '搜索Token (租户URL、邮箱备注...)',
        noResults: '没有找到匹配的Token',
        allStatus: '所有状态',
        sortBy: '排序方式',
        sortByCreated: '创建时间',
        sortByUrl: '租户URL',
        sortByStatus: '状态',
        ascending: '升序',
        descending: '降序'
      },
      
      // 批量操作
      batch: {
        selected: '已选择',
        items: '个',
        checkStatus: '批量检测',
        clearSelection: '取消选择',
        processing: '处理中...',
        completed: '完成',
        partialSuccess: '部分成功',
        failed: '失败'
      },
      
      // 快捷键
      shortcuts: {
        title: '快捷键',
        newToken: '新建Token',
        generateToken: '生成Token',
        tokenList: 'Token列表',
        bookmarks: '书签管理',
        closeModal: '关闭模态框'
      }
    }
  },
  
  'en-US': {
    name: 'English',
    flag: '🇺🇸',
    messages: {
      // Common
      common: {
        confirm: 'Confirm',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        copy: 'Copy',
        close: 'Close',
        loading: 'Loading...',
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        import: 'Import',
        refresh: 'Refresh',
        settings: 'Settings',
        help: 'Help',
        about: 'About'
      },
      
      // App
      app: {
        title: 'Augment Token Manager',
        subtitle: 'Smart Token Management Tool'
      },
      
      // Token
      token: {
        list: 'Saved Tokens',
        add: 'New Token',
        generate: 'Generate Token',
        tenantUrl: 'Tenant URL',
        accessToken: 'Access Token',
        portalUrl: 'Portal URL',
        emailNote: 'Email Note',
        status: 'Status',
        active: 'Active',
        suspended: 'Suspended',
        unknown: 'Unknown',
        createdAt: 'Created At',
        copySuccess: 'Copied successfully',
        copyFailed: 'Copy failed',
        deleteConfirm: 'Are you sure you want to delete this token? This action cannot be undone.',
        deleteSuccess: 'Token deleted successfully',
        deleteFailed: 'Failed to delete token',
        saveSuccess: 'Token saved successfully',
        saveFailed: 'Failed to save token'
      },
      
      // Editor
      editor: {
        oneClickLogin: 'One-Click Login',
        selectEditor: 'Select Editor',
        cursor: 'Cursor',
        vscode: 'VS Code',
        webstorm: 'WebStorm',
        sublime: 'Sublime Text',
        atom: 'Atom',
        recommended: 'Recommended',
        installed: 'Installed',
        opening: 'Opening',
        openFailed: 'Failed to open'
      },
      
      // Theme
      theme: {
        light: 'Light Theme',
        dark: 'Dark Theme',
        system: 'Follow System',
        selectTheme: 'Select Theme'
      },
      
      // Search
      search: {
        placeholder: 'Search tokens (tenant URL, email note...)',
        noResults: 'No matching tokens found',
        allStatus: 'All Status',
        sortBy: 'Sort By',
        sortByCreated: 'Created Time',
        sortByUrl: 'Tenant URL',
        sortByStatus: 'Status',
        ascending: 'Ascending',
        descending: 'Descending'
      },
      
      // Batch
      batch: {
        selected: 'Selected',
        items: 'items',
        checkStatus: 'Batch Check',
        clearSelection: 'Clear Selection',
        processing: 'Processing...',
        completed: 'Completed',
        partialSuccess: 'Partial Success',
        failed: 'Failed'
      },
      
      // Shortcuts
      shortcuts: {
        title: 'Keyboard Shortcuts',
        newToken: 'New Token',
        generateToken: 'Generate Token',
        tokenList: 'Token List',
        bookmarks: 'Bookmarks',
        closeModal: 'Close Modal'
      }
    }
  }
}

// 获取当前语言的消息
const messages = computed(() => {
  return locales[currentLocale.value]?.messages || locales['zh-CN'].messages
})

// 翻译函数
const t = (key, params = {}) => {
  const keys = key.split('.')
  let value = messages.value
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      console.warn(`Translation key not found: ${key}`)
      return key
    }
  }
  
  if (typeof value !== 'string') {
    console.warn(`Translation value is not a string: ${key}`)
    return key
  }
  
  // 简单的参数替换
  return value.replace(/\{(\w+)\}/g, (match, param) => {
    return params[param] !== undefined ? params[param] : match
  })
}

// 设置语言
const setLocale = (locale) => {
  if (locales[locale]) {
    currentLocale.value = locale
    localStorage.setItem('locale', locale)
  }
}

// 获取可用语言列表
const getAvailableLocales = () => {
  return Object.entries(locales).map(([code, config]) => ({
    code,
    name: config.name,
    flag: config.flag
  }))
}

// 初始化语言
const initI18n = () => {
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && locales[savedLocale]) {
    currentLocale.value = savedLocale
  } else {
    // 检测浏览器语言
    const browserLang = navigator.language || navigator.userLanguage
    if (locales[browserLang]) {
      currentLocale.value = browserLang
    }
  }
}

// 导出国际化功能
export function useI18n() {
  return {
    currentLocale,
    messages,
    t,
    setLocale,
    getAvailableLocales,
    initI18n
  }
}

// 自动初始化
if (typeof window !== 'undefined') {
  const { initI18n } = useI18n()
  initI18n()
}
