<template>
  <Teleport to="body">
    <div class="notification-center">
      <TransitionGroup name="notification" tag="div" class="notification-list">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="['notification', `notification-${notification.type}`]"
          :style="{
            '--notification-color': notification.color,
            '--notification-bg': notification.bgColor,
            '--notification-border': notification.borderColor
          }"
        >
          <!-- 通知图标 -->
          <div class="notification-icon">
            {{ notification.icon }}
          </div>
          
          <!-- 通知内容 -->
          <div class="notification-content">
            <div class="notification-message">{{ notification.message }}</div>
            
            <!-- 进度条 -->
            <div v-if="notification.progress !== undefined" class="notification-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  :style="{ width: `${notification.progress}%` }"
                ></div>
              </div>
              <span class="progress-text">{{ notification.progress }}%</span>
            </div>
            
            <!-- 时间戳 -->
            <div class="notification-time">
              {{ formatTime(notification.timestamp) }}
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div v-if="notification.actions && notification.actions.length > 0" class="notification-actions">
            <button
              v-for="(action, index) in notification.actions"
              :key="index"
              @click="action.action"
              :class="['action-btn', { 'primary': action.primary }]"
            >
              {{ action.label }}
            </button>
          </div>
          
          <!-- 关闭按钮 -->
          <button 
            v-if="!notification.persistent || notification.actions"
            @click="removeNotification(notification.id)"
            class="notification-close"
            title="关闭"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
      
      <!-- 清空按钮 -->
      <div v-if="notifications.length > 1" class="notification-controls">
        <button @click="clearAllNotifications" class="clear-all-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
          清空所有
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useNotification } from '../composables/useNotification.js'

// 通知功能
const { notifications, removeNotification, clearAllNotifications } = useNotification()

// 格式化时间
const formatTime = (timestamp) => {
  const now = new Date()
  const diff = now - timestamp
  
  if (diff < 60000) { // 小于1分钟
    return '刚刚'
  } else if (diff < 3600000) { // 小于1小时
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 小于1天
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return timestamp.toLocaleDateString()
  }
}
</script>

<style scoped>
.notification-center {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  max-width: 400px;
  width: 100%;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification {
  background: var(--notification-bg);
  border: 1px solid var(--notification-border);
  border-left: 4px solid var(--notification-color);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  backdrop-filter: blur(8px);
}

.notification-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text, #1f2937);
  line-height: 1.4;
  margin-bottom: 4px;
}

.notification-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 4px 0;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--notification-color);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--color-textMuted, #9ca3af);
  font-weight: 500;
  min-width: 35px;
  text-align: right;
}

.notification-time {
  font-size: 12px;
  color: var(--color-textMuted, #9ca3af);
  margin-top: 4px;
}

.notification-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.action-btn {
  padding: 4px 12px;
  border: 1px solid var(--notification-border);
  border-radius: 4px;
  background: white;
  color: var(--color-text, #1f2937);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--color-surface, #f8fafc);
}

.action-btn.primary {
  background: var(--notification-color);
  color: white;
  border-color: var(--notification-color);
}

.action-btn.primary:hover {
  opacity: 0.9;
}

.notification-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: var(--color-textMuted, #9ca3af);
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--color-text, #1f2937);
}

.notification-controls {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}

.clear-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--color-surface, #f8fafc);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 6px;
  color: var(--color-textSecondary, #6b7280);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-all-btn:hover {
  background: var(--color-surfaceHover, #f1f5f9);
  border-color: var(--color-borderHover, #d1d5db);
}

/* 动画 */
.notification-enter-active {
  transition: all 0.3s ease;
}

.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.notification-move {
  transition: transform 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notification-center {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .notification {
    padding: 12px;
  }
  
  .notification-message {
    font-size: 13px;
  }
}

/* 深色模式适配 */
:global(.dark) .notification {
  backdrop-filter: blur(12px);
}

:global(.dark) .action-btn {
  background: var(--color-surface);
  color: var(--color-text);
  border-color: var(--color-border);
}

:global(.dark) .action-btn:hover {
  background: var(--color-surfaceHover);
}
</style>
