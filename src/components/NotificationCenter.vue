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
/* 现代化通知中心样式 */
.notification-center {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 10000;
  max-width: 420px;
  width: 100%;
  pointer-events: none;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 现代化通知卡片样式 */
.notification {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-left: 4px solid var(--notification-color);
  border-radius: 16px;
  padding: 20px;
  box-shadow:
    0 16px 32px rgba(0, 0, 0, 0.12),
    0 8px 16px rgba(0, 0, 0, 0.08),
    0 4px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  pointer-events: auto;
  transition: all 0.3s ease;
  overflow: hidden;
}

.notification::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--notification-color), transparent);
  opacity: 0.6;
}

.notification:hover {
  transform: translateX(-4px);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 12px 24px rgba(0, 0, 0, 0.1),
    0 6px 12px rgba(0, 0, 0, 0.06);
}

.notification-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.5;
  margin-bottom: 6px;
}

/* 现代化进度条样式 */
.notification-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0 8px 0;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--notification-color), rgba(var(--notification-color), 0.8));
  border-radius: 8px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.progress-text {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
  min-width: 40px;
  text-align: right;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* 现代化时间样式 */
.notification-time {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 8px;
  font-weight: 500;
  opacity: 0.8;
}

/* 现代化操作按钮样式 */
.notification-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.action-btn:hover {
  background: rgba(241, 245, 249, 0.95);
  border-color: rgba(203, 213, 225, 0.8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

/* 现代化关闭按钮样式 */
.notification-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.6);
  padding: 6px;
  cursor: pointer;
  color: #64748b;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  width: 24px;
  height: 24px;
}

.notification-close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  transform: scale(1.1);
}

/* 现代化控制区域样式 */
.notification-controls {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.clear-all-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 10px;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.clear-all-btn:hover {
  background: rgba(241, 245, 249, 0.95);
  border-color: rgba(203, 213, 225, 0.8);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 现代化动画效果 */
.notification-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(120%) scale(0.8) rotateY(15deg);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(120%) scale(0.8) rotateY(-15deg);
}

.notification-move {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 现代化响应式设计 */
@media (max-width: 768px) {
  .notification-center {
    top: 16px;
    right: 16px;
    left: 16px;
    max-width: none;
  }

  .notification {
    padding: 16px;
    border-radius: 12px;
  }

  .notification-message {
    font-size: 14px;
  }

  .notification-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
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
