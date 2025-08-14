<template>
  <div class="token-list-modal">
    <div class="modal-overlay" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>账户管理</h2>
          <div class="header-actions">
            <button @click="$emit('add-token')" class="btn primary small">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              添加
            </button>
            <button @click="handleRefresh" class="btn secondary small">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
              刷新
            </button>
            <button @click="exportTokens" class="btn secondary small">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              导出
            </button>
            <button class="close-btn" @click="$emit('close')">×</button>
          </div>
        </div>
        
        <div class="modal-body">
          <!-- Empty State -->
          <div v-if="tokens.length === 0 && !isLoading" class="empty-state">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3>还没有保存的Token</h3>
            <p>关闭此窗口，在主页面生成你的第一个Token</p>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="loading-state">
            <div class="spinner"></div>
            <p>正在加载Token...</p>
          </div>

          <!-- Token List -->
          <div v-if="tokens.length > 0" class="token-list">
            <!-- 现代化列表头部 -->
            <div class="list-header-modern">
              <!-- 标题区域 -->
              <div class="header-title-section">
                <div class="title-with-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="title-icon">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <h3 class="list-title">账户管理</h3>
                </div>
                <div class="count-badge">
                  <span class="count-text">{{ filteredTokens.length }}</span>
                  <span class="count-separator">/</span>
                  <span class="total-count">{{ tokens.length }}</span>
                </div>
              </div>

              <!-- 搜索区域 -->
              <div class="search-section">
                <div class="search-box-modern">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" class="search-icon-modern">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="搜索账户 (租户URL、邮箱备注...)"
                    class="search-input-modern"
                  />
                  <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search-modern">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 筛选区域 -->
              <div class="filter-section">
                <div class="filter-group">
                  <label class="filter-label">状态筛选</label>
                  <select v-model="statusFilter" class="status-filter-modern">
                    <option value="">全部状态</option>
                    <option value="ACTIVE">✅ 正常</option>
                    <option value="SUSPENDED">🚫 已封禁</option>
                    <option value="UNKNOWN">❓ 未知</option>
                  </select>
                </div>
                <div class="filter-group">
                  <label class="filter-label">排序方式</label>
                  <div class="sort-controls">
                    <select v-model="sortBy" class="sort-select-modern">
                      <option value="created_at">📅 创建时间</option>
                      <option value="tenant_url">🌐 租户URL</option>
                      <option value="ban_status">🔒 账户状态</option>
                    </select>
                    <button @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'" class="sort-order-btn-modern" :title="`排序: ${sortOrder === 'asc' ? '升序' : '降序'}`">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path v-if="sortOrder === 'asc'" d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
                        <path v-else d="M3 18h18v-2H3v2zM3 6v2h12V6H3zm0 7h6v-2H3v2z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="token-grid">
              <TokenCard
                v-for="token in filteredTokens"
                :key="token.id"
                :ref="el => setTokenCardRef(el, token.id)"
                :token="token"
                @delete="$emit('delete', $event)"
                @copy-success="$emit('copy-success', $event)"
              @open-portal="$emit('open-portal', $event)"
              @edit="$emit('edit', $event)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'
import TokenCard from './TokenCard.vue'

// Props
const props = defineProps({
  tokens: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'delete', 'copy-success', 'add-token', 'refresh', 'open-portal', 'edit'])

// 搜索和过滤状态
const searchQuery = ref('')
const statusFilter = ref('')
const sortBy = ref('created_at')
const sortOrder = ref('desc')



// 过滤和排序后的tokens
const filteredTokens = computed(() => {
  let filtered = [...props.tokens]

  // 搜索过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(token => {
      return (
        token.tenant_url.toLowerCase().includes(query) ||
        (token.email_note && token.email_note.toLowerCase().includes(query)) ||
        (token.portal_url && token.portal_url.toLowerCase().includes(query)) ||
        token.access_token.toLowerCase().includes(query)
      )
    })
  }

  // 状态过滤
  if (statusFilter.value) {
    filtered = filtered.filter(token => {
      if (statusFilter.value === 'UNKNOWN') {
        return !token.ban_status
      }
      return token.ban_status === statusFilter.value
    })
  }

  // 排序
  filtered.sort((a, b) => {
    let aValue, bValue

    switch (sortBy.value) {
      case 'tenant_url':
        aValue = a.tenant_url.toLowerCase()
        bValue = b.tenant_url.toLowerCase()
        break
      case 'ban_status':
        aValue = a.ban_status || 'UNKNOWN'
        bValue = b.ban_status || 'UNKNOWN'
        break
      case 'created_at':
      default:
        aValue = new Date(a.created_at)
        bValue = new Date(b.created_at)
        break
    }

    if (sortOrder.value === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
    }
  })

  return filtered
})

// Token card refs for accessing child methods
const tokenCardRefs = ref({})

// 设置ref的函数
const setTokenCardRef = (el, tokenId) => {
  if (el) {
    tokenCardRefs.value[tokenId] = el
  }
}

// 刷新所有Portal信息
const refreshAllPortalInfo = async () => {
  await nextTick() // 确保DOM已更新

  const portalTokens = Object.entries(tokenCardRefs.value).filter(([tokenId, cardRef]) => {
    const token = props.tokens.find(t => t.id === tokenId)
    return token && token.portal_url && cardRef && typeof cardRef.refreshPortalInfo === 'function'
  })

  if (portalTokens.length === 0) {
    return { success: true, message: '没有需要刷新的 Portal 信息' }
  }

  try {
    // 并行刷新所有Portal信息
    const refreshPromises = portalTokens.map(async ([tokenId, cardRef]) => {
      try {
        await cardRef.refreshPortalInfo()
        return { tokenId, success: true }
      } catch (error) {
        console.error(`Failed to refresh portal info for token ${tokenId}:`, error)
        return { tokenId, success: false, error: error.message }
      }
    })

    const results = await Promise.allSettled(refreshPromises)

    // 统计成功和失败的数量
    let successCount = 0
    let failureCount = 0

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.success) {
        successCount++
      } else {
        failureCount++
      }
    })

    if (failureCount === 0) {
      return {
        success: true,
        message: `Portal 信息刷新完成 (${successCount}/${portalTokens.length})`
      }
    } else if (successCount === 0) {
      return {
        success: false,
        message: `Portal 信息刷新失败 (${failureCount}/${portalTokens.length})`
      }
    } else {
      return {
        success: true,
        message: `Portal 信息部分刷新成功 (${successCount}/${portalTokens.length})`
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `刷新 Portal 信息时发生错误: ${error.message}`
    }
  }
}



// 导出Token数据
const exportTokens = () => {
  try {
    const exportData = filteredTokens.value.map(token => ({
      tenant_url: token.tenant_url,
      access_token: token.access_token,
      portal_url: token.portal_url || '',
      email_note: token.email_note || '',
      ban_status: token.ban_status || '',
      created_at: token.created_at,
      portal_info: token.portal_info ? {
        credits_balance: token.portal_info.credits_balance,
        expiry_date: token.portal_info.expiry_date,
        is_active: token.portal_info.is_active
      } : null
    }))

    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `augment-tokens-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    emit('copy-success', `已导出 ${exportData.length} 个Token到文件`, 'success')
  } catch (error) {
    emit('copy-success', `导出失败: ${error.message}`, 'error')
  }
}

// 处理刷新事件
const handleRefresh = async () => {
  // 显示开始刷新的通知
  emit('copy-success', '正在刷新 Portal 信息...', 'info')

  try {
    // 先刷新token列表
    emit('refresh')
    await nextTick() // 等待DOM更新

    // 刷新Portal信息
    const result = await refreshAllPortalInfo()

    // 显示刷新结果通知
    emit('copy-success', result.message, result.success ? 'success' : 'error')
  } catch (error) {
    // 显示错误通知
    emit('copy-success', `刷新失败: ${error.message}`, 'error')
  }
}

// 暴露方法给父组件
defineExpose({
  refreshAllPortalInfo
})
</script>

<style scoped>
/* 现代化模态框样式 */
.token-list-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 1200px;
  height: 90vh;
  overflow: hidden;
  box-shadow:
    0 32px 64px rgba(0, 0, 0, 0.12),
    0 16px 32px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 现代化头部样式 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(229, 231, 235, 0.8);
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-header h2 {
  margin: 0;
  color: #1e293b;
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(229, 231, 235, 0.6);
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  transition: all 0.3s ease;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.close-btn:hover {
  background: rgba(248, 250, 252, 0.95);
  color: #475569;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 现代化主体样式 */
.modal-body {
  padding: 32px;
  flex: 1;
  overflow-y: auto;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);

  /* 自定义滚动条 */
  scrollbar-width: thin;
  scrollbar-color: rgba(59, 130, 246, 0.3) transparent;
}

.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 4px;
  transition: background 0.3s ease;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
}

/* 现代化空状态样式 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%);
  border-radius: 16px;
  margin: 20px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.5);
}

.empty-icon {
  color: #94a3b8;
  margin-bottom: 24px;
  opacity: 0.8;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.empty-state h3 {
  color: #1e293b;
  margin: 0 0 12px 0;
  font-size: 1.5rem;
  font-weight: 600;
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.empty-state p {
  color: #64748b;
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
}

/* 现代化加载状态样式 */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.8) 100%);
  border-radius: 16px;
  margin: 20px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.5);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(59, 130, 246, 0.1);
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 24px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #64748b;
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

/* 现代化列表和网格布局 */
.token-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.token-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 8px;
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式处理 */
@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-width: calc(100vw - 20px);
  }

  .modal-header {
    padding: 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .token-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .list-header h3 {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-content {
    max-height: 95vh;
  }

  .modal-header h2 {
    font-size: 1.25rem;
  }

  .empty-state {
    padding: 20px 10px;
  }

  .empty-state h3 {
    font-size: 1.125rem;
  }

  .btn.small {
    padding: 4px 8px;
    font-size: 11px;
  }
}

/* 现代化列表头部样式 */
.list-header-modern {
  margin-bottom: 28px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 4px 16px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

/* 标题区域 */
.header-title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.4);
}

.title-with-icon {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  color: #3b82f6;
  filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3));
}

.list-title {
  margin: 0;
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.count-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 20px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.count-text {
  font-size: 1.1rem;
  font-weight: 700;
}

.count-separator {
  opacity: 0.7;
  margin: 0 2px;
}

.total-count {
  opacity: 0.9;
}

/* 现代化按钮样式 */
.btn {
  padding: 10px 18px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease;
}

.btn:hover::before {
  left: 100%;
}

.btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.btn.secondary {
  background: rgba(248, 250, 252, 0.8);
  color: #475569;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.btn.secondary:hover {
  background: rgba(241, 245, 249, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn.small {
  padding: 8px 14px;
  font-size: 12px;
  border-radius: 8px;
}

/* 搜索区域样式 */
.search-section {
  padding: 16px 24px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.4);
}

.search-box-modern {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 500px;
}

.search-icon-modern {
  position: absolute;
  left: 16px;
  color: #64748b;
  z-index: 1;
  transition: all 0.3s ease;
}

.search-input-modern {
  width: 100%;
  padding: 16px 50px 16px 48px;
  border: 2px solid rgba(226, 232, 240, 0.6);
  border-radius: 16px;
  font-size: 15px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 2px rgba(0, 0, 0, 0.02);
}

.search-input-modern:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow:
    0 0 0 4px rgba(59, 130, 246, 0.12),
    0 8px 24px rgba(59, 130, 246, 0.15),
    inset 0 1px 2px rgba(0, 0, 0, 0.02);
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
}

.search-input-modern:focus ~ .search-icon-modern {
  color: #3b82f6;
  transform: scale(1.1);
}

.search-input-modern::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

/* 清除按钮样式 */
.clear-search-modern {
  position: absolute;
  right: 12px;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.6);
  padding: 8px;
  cursor: pointer;
  color: #64748b;
  border-radius: 10px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-search-modern:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  transform: scale(1.1);
}

/* 筛选区域样式 */
.filter-section {
  padding: 16px 24px 20px;
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 160px;
}

.filter-label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.status-filter-modern,
.sort-select-modern {
  padding: 12px 16px;
  border: 2px solid rgba(226, 232, 240, 0.6);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  color: #374151;
}

.status-filter-modern:focus,
.sort-select-modern:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow:
    0 0 0 4px rgba(59, 130, 246, 0.12),
    0 4px 16px rgba(59, 130, 246, 0.15);
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
}

.sort-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.sort-order-btn-modern {
  background: rgba(248, 250, 252, 0.9);
  border: 2px solid rgba(226, 232, 240, 0.6);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  min-width: 44px;
  min-height: 44px;
  color: #64748b;
}

.sort-order-btn-modern:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

@media (max-width: 768px) {
  .search-controls {
    gap: 8px;
  }

  .filter-controls {
    flex-wrap: wrap;
    gap: 6px;
  }

  .status-filter,
  .sort-select {
    flex: 1;
    min-width: 100px;
  }
}

/* 批量操作样式 */
.header-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.selected-count {
  font-size: 13px;
  color: #3b82f6;
  font-weight: 500;
  padding: 4px 8px;
  background: #eff6ff;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .header-title {
    flex-direction: column;
    align-items: flex-start;
  }

  .batch-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
