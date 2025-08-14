import { ref, nextTick } from 'vue'

// 通知列表
const notifications = ref([])
let notificationId = 0

// 通知类型配置
const notificationTypes = {
  success: {
    icon: '✅',
    color: '#10b981',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0'
  },
  error: {
    icon: '❌',
    color: '#ef4444',
    bgColor: '#fef2f2',
    borderColor: '#fecaca'
  },
  warning: {
    icon: '⚠️',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    borderColor: '#fed7aa'
  },
  info: {
    icon: 'ℹ️',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe'
  }
}

// 创建通知
const createNotification = (message, type = 'info', options = {}) => {
  const id = ++notificationId
  const notification = {
    id,
    message,
    type,
    timestamp: new Date(),
    duration: options.duration || 5000,
    persistent: options.persistent || false,
    actions: options.actions || [],
    ...notificationTypes[type]
  }
  
  notifications.value.push(notification)
  
  // 自动移除非持久化通知
  if (!notification.persistent && notification.duration > 0) {
    setTimeout(() => {
      removeNotification(id)
    }, notification.duration)
  }
  
  return id
}

// 移除通知
const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// 清空所有通知
const clearAllNotifications = () => {
  notifications.value = []
}

// 更新通知
const updateNotification = (id, updates) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    Object.assign(notification, updates)
  }
}

// 快捷方法
const success = (message, options) => createNotification(message, 'success', options)
const error = (message, options) => createNotification(message, 'error', options)
const warning = (message, options) => createNotification(message, 'warning', options)
const info = (message, options) => createNotification(message, 'info', options)

// 进度通知
const createProgressNotification = (message, options = {}) => {
  const id = createNotification(message, 'info', {
    persistent: true,
    progress: 0,
    ...options
  })
  
  return {
    id,
    updateProgress: (progress, message) => {
      updateNotification(id, { 
        progress: Math.max(0, Math.min(100, progress)),
        message: message || notifications.value.find(n => n.id === id)?.message
      })
    },
    complete: (message, type = 'success') => {
      updateNotification(id, {
        message: message || '操作完成',
        type,
        progress: 100,
        persistent: false,
        ...notificationTypes[type]
      })
      setTimeout(() => removeNotification(id), 3000)
    },
    fail: (message) => {
      updateNotification(id, {
        message: message || '操作失败',
        type: 'error',
        persistent: false,
        ...notificationTypes.error
      })
      setTimeout(() => removeNotification(id), 5000)
    }
  }
}

// 确认通知
const confirm = (message, options = {}) => {
  return new Promise((resolve) => {
    const id = createNotification(message, 'warning', {
      persistent: true,
      actions: [
        {
          label: options.confirmText || '确认',
          action: () => {
            removeNotification(id)
            resolve(true)
          },
          primary: true
        },
        {
          label: options.cancelText || '取消',
          action: () => {
            removeNotification(id)
            resolve(false)
          }
        }
      ],
      ...options
    })
  })
}

// 桌面通知
const requestDesktopPermission = async () => {
  if (!('Notification' in window)) {
    return false
  }
  
  if (Notification.permission === 'granted') {
    return true
  }
  
  if (Notification.permission === 'denied') {
    return false
  }
  
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

const showDesktopNotification = async (title, options = {}) => {
  const hasPermission = await requestDesktopPermission()
  if (!hasPermission) {
    return null
  }
  
  const notification = new Notification(title, {
    icon: options.icon || '/favicon.ico',
    body: options.body || '',
    tag: options.tag || 'augment-token-manager',
    requireInteraction: options.requireInteraction || false,
    ...options
  })
  
  if (options.onClick) {
    notification.onclick = options.onClick
  }
  
  if (options.duration) {
    setTimeout(() => notification.close(), options.duration)
  }
  
  return notification
}

// 批量操作通知
const createBatchNotification = (operation, total) => {
  let completed = 0
  let failed = 0
  
  const progressNotif = createProgressNotification(
    `${operation} (0/${total})`,
    { duration: 0 }
  )
  
  return {
    updateProgress: (success = true) => {
      if (success) {
        completed++
      } else {
        failed++
      }
      
      const progress = ((completed + failed) / total) * 100
      const message = `${operation} (${completed + failed}/${total})`
      
      progressNotif.updateProgress(progress, message)
      
      if (completed + failed === total) {
        if (failed === 0) {
          progressNotif.complete(`${operation}完成 (${completed}/${total})`)
        } else if (completed === 0) {
          progressNotif.fail(`${operation}失败 (${failed}/${total})`)
        } else {
          progressNotif.complete(
            `${operation}部分成功 (成功:${completed}, 失败:${failed})`,
            'warning'
          )
        }
      }
    }
  }
}

// 导出通知功能
export function useNotification() {
  return {
    // 状态
    notifications,
    
    // 基本方法
    createNotification,
    removeNotification,
    clearAllNotifications,
    updateNotification,
    
    // 快捷方法
    success,
    error,
    warning,
    info,
    
    // 高级功能
    createProgressNotification,
    confirm,
    showDesktopNotification,
    requestDesktopPermission,
    createBatchNotification,
    
    // 配置
    notificationTypes
  }
}
