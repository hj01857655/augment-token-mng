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
            <div class="list-header">
              <div class="header-title">
                <h3>Token列表 ({{ filteredTokens.length }}/{{ tokens.length }})</h3>

              </div>
              <div class="search-controls">
                <div class="search-box">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="search-icon">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="搜索Token (租户URL、邮箱备注...)"
                    class="search-input"
                  />
                  <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                  </button>
                </div>
                <div class="filter-controls">
                  <select v-model="statusFilter" class="status-filter">
                    <option value="">所有状态</option>
                    <option value="ACTIVE">正常</option>
                    <option value="SUSPENDED">已封禁</option>
                    <option value="UNKNOWN">未知</option>
                  </select>
                  <select v-model="sortBy" class="sort-select">
                    <option value="created_at">创建时间</option>
                    <option value="tenant_url">租户URL</option>
                    <option value="ban_status">状态</option>
                  </select>
                  <button @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'" class="sort-order-btn" :title="`排序: ${sortOrder === 'asc' ? '升序' : '降序'}`">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path v-if="sortOrder === 'asc'" d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
                      <path v-else d="M3 18h18v-2H3v2zM3 6v2h12V6H3zm0 7h6v-2H3v2z"/>
                    </svg>
                  </button>
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
.token-list-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  height: 85vh; /* 固定高度，更大 */
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin-top: -60px; /* 向上移动到红框位置 */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-header h2 {
  margin: 0;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
  height: calc(85vh - 80px); /* 固定高度 */
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: #374151;
  margin: 0 0 8px 0;
  font-size: 1.25rem;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
}

.loading-state {
  text-align: center;
  padding: 40px 20px;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #6b7280;
  margin: 0;
}

.token-list {
  /* 移除内部滚动，使用外层 modal-body 的滚动 */
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.token-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 4px;
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

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.list-header h3 {
  margin: 0;
  color: #374151;
  font-size: 1.125rem;
  font-weight: 600;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn.secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn.secondary:hover {
  background: #e5e7eb;
}

.btn.small {
  padding: 6px 12px;
  font-size: 12px;
}

/* 搜索和过滤控件样式 */
.search-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #9ca3af;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-search {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #9ca3af;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-search:hover {
  background: #f3f4f6;
  color: #374151;
}

.filter-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.status-filter,
.sort-select {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.status-filter:focus,
.sort-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.sort-order-btn {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 6px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sort-order-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
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
