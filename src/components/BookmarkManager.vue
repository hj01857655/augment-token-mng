<template>
  <div class="bookmark-manager-modal">
    <div class="modal-overlay" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>书签管理</h2>
          <div class="header-actions">
            <button @click="openDataFolder" class="btn-icon info" title="打开数据存储文件夹">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
              </svg>
            </button>
            <button @click="showDataInfo = true" class="btn-icon info" title="数据存储信息">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </button>
            <button @click="showAddForm()" class="btn-icon add" title="添加书签">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </button>
            <button class="close-btn" @click="$emit('close')">×</button>
          </div>
        </div>
        
        <div class="modal-body">

          <div class="bookmarks-grid">
            <div
              v-for="bookmark in allBookmarks"
              :key="bookmark.id"
              class="bookmark-card"
            >
              <div class="bookmark-actions">
                <button @click="editBookmark(bookmark)" class="btn-icon edit" title="编辑">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </button>
                <button @click="deleteBookmark(bookmark.id)" class="btn-icon delete" title="删除">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
              <div class="bookmark-content">
                <div class="bookmark-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
                  </svg>
                </div>
                <div class="bookmark-name">{{ bookmark.name }}</div>
                <div v-if="bookmark.description" class="bookmark-desc">{{ bookmark.description }}</div>
                <div class="bookmark-buttons">
                  <button
                    @click="handleBookmarkAction(bookmark)"
                    class="bookmark-open-btn"
                    title="打开书签"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                    </svg>
                    打开
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="allBookmarks.length === 0" class="empty-state">
            <p>还没有添加书签</p>
            <p>点击"添加书签"来添加你常用的网站</p>
          </div>
        </div>

        <!-- Add/Edit Form Modal -->
        <div v-if="showForm" class="form-overlay" @click="hideForm">
          <div class="form-content" @click.stop>
            <div class="form-header">
              <h3>{{ editingBookmark ? '编辑书签' : '添加书签' }}</h3>
              <button class="close-btn" @click="hideForm">×</button>
            </div>
            
            <div class="form-body">
              <div class="form-group">
                <label>名称 *</label>
                <input 
                  v-model="formData.name" 
                  type="text" 
                  placeholder="输入书签名称"
                  required
                >
              </div>
              
              <div class="form-group">
                <label>网址 *</label>
                <input 
                  v-model="formData.url" 
                  type="url" 
                  placeholder="https://example.com"
                  required
                >
              </div>
              
              <div class="form-group">
                <label>描述</label>
                <textarea 
                  v-model="formData.description" 
                  placeholder="可选的描述信息"
                  rows="2"
                ></textarea>
              </div>
              
              <div class="form-actions">
                <button @click="hideForm" class="btn secondary">取消</button>
                <button @click="saveBookmark" class="btn primary" :disabled="!canSave">
                  {{ editingBookmark ? '更新' : '添加' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Messages -->
        <div
          v-if="statusMessage"
          :class="['status', statusType]"
        >
          {{ statusMessage }}
        </div>
      </div>
    </div>

    <!-- 书签打开方式选择对话框 -->
    <div v-if="showBookmarkDialog" class="portal-dialog-overlay" @click="showBookmarkDialog = false">
      <div class="portal-dialog" @click.stop>
        <h3>选择打开方式</h3>
        <div class="dialog-buttons">
          <button @click="copyBookmarkUrl" class="dialog-btn copy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
            复制到剪贴板
          </button>
          <button @click="openBookmarkExternal" class="dialog-btn external">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
            </svg>
            在浏览器中打开
          </button>

          <button @click="showBookmarkDialog = false" class="dialog-btn cancel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- 数据存储信息对话框 -->
    <div v-if="showDataInfo" class="data-info-modal">
      <div class="modal-overlay" @click="showDataInfo = false">
        <div class="modal-content small" @click.stop>
          <div class="modal-header">
            <h3>数据存储信息</h3>
            <button class="close-btn" @click="showDataInfo = false">×</button>
          </div>
          <div class="modal-body">
            <div class="storage-info">
              <div class="info-section">
                <h4>📁 存储位置</h4>
                <div class="storage-paths">
                  <div class="path-item">
                    <strong>Windows:</strong>
                    <code>%APPDATA%\com.augment.token-manager\bookmarks.json</code>
                  </div>
                  <div class="path-item">
                    <strong>macOS:</strong>
                    <code>~/Library/Application Support/com.augment.token-manager/bookmarks.json</code>
                  </div>
                  <div class="path-item">
                    <strong>Linux:</strong>
                    <code>~/.local/share/com.augment.token-manager/bookmarks.json</code>
                  </div>
                </div>
              </div>

              <div class="info-section">
                <h4>📊 统计信息</h4>
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-label">书签总数:</span>
                    <span class="stat-value">{{ allBookmarks.length }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">临时书签:</span>
                    <span class="stat-value">{{ tempBookmarksCount }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">服务书签:</span>
                    <span class="stat-value">{{ serviceBookmarksCount }}</span>
                  </div>
                </div>
              </div>

              <div class="info-section">
                <h4>🔧 操作</h4>
                <div class="action-buttons">
                  <button @click="openDataFolder" class="btn secondary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
                    </svg>
                    打开数据文件夹
                  </button>
                  <button @click="exportBookmarks" class="btn secondary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                    导出书签
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { invoke } from '@tauri-apps/api/core'

// Emits
const emit = defineEmits(['close'])

// Reactive data
const allBookmarks = ref([])
const showForm = ref(false)
const editingBookmark = ref(null)
const showDataInfo = ref(false)
const statusMessage = ref('')
const statusType = ref('info')

// Bookmark dialog
const showBookmarkDialog = ref(false)
const currentBookmark = ref(null)

const formData = ref({
  name: '',
  url: '',
  description: ''
})

// Computed properties
const canSave = computed(() => {
  return formData.value.name.trim() && formData.value.url.trim()
})

const tempBookmarksCount = computed(() => {
  return allBookmarks.value.filter(bookmark => bookmark.category === 'temp').length
})

const serviceBookmarksCount = computed(() => {
  return allBookmarks.value.filter(bookmark => bookmark.category === 'service').length
})

// Methods
const showStatus = (message, type = 'info') => {
  statusMessage.value = message
  statusType.value = type
  
  setTimeout(() => {
    statusMessage.value = ''
  }, 3000)
}

const loadBookmarks = async () => {
  try {
    const result = await invoke('get_all_bookmarks')
    allBookmarks.value = result || []
  } catch (error) {
    showStatus(`加载书签失败: ${error}`, 'error')
  }
}

const showAddForm = () => {
  editingBookmark.value = null
  formData.value = {
    name: '',
    url: '',
    description: ''
  }
  showForm.value = true
}

const editBookmark = (bookmark) => {
  editingBookmark.value = bookmark
  formData.value = {
    name: bookmark.name,
    url: bookmark.url,
    description: bookmark.description || ''
  }
  showForm.value = true
}

const hideForm = () => {
  showForm.value = false
  editingBookmark.value = null
  formData.value = {
    name: '',
    url: '',
    description: ''
  }
}

const saveBookmark = async () => {
  if (!canSave.value) return

  try {
    const bookmarkData = {
      name: formData.value.name.trim(),
      url: formData.value.url.trim(),
      description: formData.value.description.trim(),
      category: 'bookmark' // 统一使用bookmark类别
    }

    if (editingBookmark.value) {
      await invoke('update_bookmark', {
        id: editingBookmark.value.id,
        ...bookmarkData
      })
      showStatus('书签更新成功!', 'success')
    } else {
      await invoke('add_bookmark', bookmarkData)
      showStatus('书签添加成功!', 'success')
    }

    await loadBookmarks()
    hideForm()
  } catch (error) {
    showStatus(`保存书签失败: ${error}`, 'error')
  }
}

const deleteBookmark = async (id) => {
  if (!confirm('确定要删除这个书签吗？')) return

  try {
    await invoke('delete_bookmark', { id })
    await loadBookmarks()
    showStatus('书签删除成功!', 'success')
  } catch (error) {
    showStatus(`删除书签失败: ${error}`, 'error')
  }
}

// 书签对话框相关方法
const handleBookmarkAction = (bookmark) => {
  currentBookmark.value = bookmark
  showBookmarkDialog.value = true
}

const copyBookmarkUrl = async () => {
  showBookmarkDialog.value = false
  if (!currentBookmark.value) return

  try {
    await navigator.clipboard.writeText(currentBookmark.value.url)
    showStatus('URL已复制到剪贴板!', 'success')
  } catch (error) {
    showStatus('复制URL失败', 'error')
  }
}

const openBookmarkExternal = async () => {
  showBookmarkDialog.value = false
  if (!currentBookmark.value) return

  try {
    await invoke('open_url', { url: currentBookmark.value.url })
    showStatus('正在浏览器中打开...', 'info')
  } catch (error) {
    showStatus(`打开网址失败: ${error}`, 'error')
  }
}



const openDataFolder = async () => {
  try {
    await invoke('open_data_folder')
    // 静默执行，不显示状态提示
  } catch (error) {
    showStatus(`打开文件夹失败: ${error}`, 'error')
  }
}

// 导出书签
const exportBookmarks = () => {
  try {
    const exportData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      bookmarks: allBookmarks.value.map(bookmark => ({
        name: bookmark.name,
        url: bookmark.url,
        description: bookmark.description,
        category: bookmark.category,
        created_at: bookmark.created_at,
        updated_at: bookmark.updated_at
      }))
    }

    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `augment-bookmarks-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showStatus(`已导出 ${allBookmarks.value.length} 个书签到文件`, 'success')
    showDataInfo.value = false
  } catch (error) {
    showStatus(`导出失败: ${error.message}`, 'error')
  }
}

// Initialize
onMounted(() => {
  loadBookmarks()
})
</script>

<style scoped>
/* 外层容器样式 */
.bookmark-manager-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

/* 隐藏表单弹窗的滚动条 */
.form-overlay * {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.form-overlay *::-webkit-scrollbar {
  display: none;
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
  height: 85vh;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.btn-icon.info {
  background: #f8f9fa;
  color: #007bff;
}

.btn-icon.info:hover {
  background: #e9ecef;
  color: #0056b3;
}

.btn-icon.add {
  background: #f8f9fa;
  color: #28a745;
}

.btn-icon.add:hover {
  background: #e9ecef;
  color: #1e7e34;
}

.modal-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}



.bookmarks-grid {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.bookmark-card {
  position: relative;
  aspect-ratio: 1;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  background: white;
  transition: all 0.2s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.bookmark-card:hover {
  border-color: #007bff;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
  transform: translateY(-2px);
}

.bookmark-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 2;
}

.bookmark-card:hover .bookmark-actions {
  opacity: 1;
}

.bookmark-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
  text-align: center;
}

.bookmark-icon {
  margin-bottom: 8px;
  color: #007bff;
  opacity: 0.8;
}

.bookmark-name {
  font-weight: 600;
  color: #333;
  font-size: 13px;
  line-height: 1.3;
  margin-bottom: 4px;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bookmark-desc {
  color: #666;
  font-size: 11px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bookmark-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-top: 8px;
}

.bookmark-open-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #007bff;
  color: white;
  min-width: 60px;
}

.bookmark-open-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.btn-small {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.btn-small.primary {
  background: #007bff;
  color: white;
}

.btn-small.primary:hover {
  background: #0056b3;
}

.btn-small.secondary {
  background: #6c757d;
  color: white;
}

.btn-small.secondary:hover {
  background: #545b62;
}

.btn-icon {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
}

.btn-icon.edit {
  background: rgba(255, 255, 255, 0.9);
  color: #6c757d;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-icon.edit:hover {
  background: rgba(233, 236, 239, 0.95);
  color: #495057;
  transform: scale(1.1);
}

.btn-icon.delete {
  background: rgba(255, 255, 255, 0.9);
  color: #dc3545;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-icon.delete:hover {
  background: rgba(245, 198, 203, 0.95);
  color: #721c24;
  transform: scale(1.1);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.empty-state p {
  margin: 8px 0;
  line-height: 1.5;
}

.empty-state p:first-child {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

/* Form Modal Styles */
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.form-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.form-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.form-body {
  padding: 20px;
  flex: 1;
  min-height: 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.form-actions .btn {
  flex: 1;
  justify-content: center;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn.primary {
  background: #007bff;
  color: white;
}

.btn.primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn.secondary {
  background: #6c757d;
  color: white;
}

.btn.secondary:hover {
  background: #545b62;
}

.btn.small {
  padding: 8px 12px;
  font-size: 13px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status {
  padding: 12px 20px;
  margin: 0 20px 20px;
  border-radius: 4px;
  font-size: 14px;
}

.status.info {
  background: #d1ecf1;
  color: #0c5460;
  border: 1px solid #bee5eb;
}

.status.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-content {
    margin: 10px;
    max-width: calc(100vw - 20px);
    height: calc(100vh - 20px);
  }

  .form-content {
    width: 95%;
  }

  .bookmarks-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    padding: 16px;
  }

  .bookmark-card {
    border-radius: 8px;
  }

  .bookmark-content {
    padding: 12px 8px;
  }

  .bookmark-name {
    font-size: 12px;
  }

  .bookmark-desc {
    font-size: 10px;
  }

  .form-actions {
    flex-direction: row;
  }

  .form-actions .btn {
    flex: 1;
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
}

/* Portal Dialog Styles */
.portal-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
}

.portal-dialog {
  background: white;
  border-radius: 12px;
  padding: 24px;
  min-width: 320px;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.portal-dialog h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
  font-weight: 600;
}

.dialog-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dialog-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.dialog-btn.copy {
  background: #28a745;
  color: white;
}

.dialog-btn.copy:hover {
  background: #218838;
  transform: translateY(-1px);
}

.dialog-btn.external {
  background: #007bff;
  color: white;
}

.dialog-btn.external:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.dialog-btn.internal {
  background: #6c757d;
  color: white;
}

.dialog-btn.internal:hover {
  background: #545b62;
  transform: translateY(-1px);
}

.dialog-btn.cancel {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.dialog-btn.cancel:hover {
  background: #e9ecef;
  color: #495057;
}

/* 数据存储信息对话框样式 */
.data-info-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content.small {
  max-width: 600px;
  width: 90%;
}

.storage-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text, #1f2937);
  display: flex;
  align-items: center;
  gap: 8px;
}

.storage-paths {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.path-item {
  padding: 12px;
  background: var(--color-surface, #f8fafc);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 8px;
}

.path-item strong {
  display: block;
  margin-bottom: 4px;
  color: var(--color-text, #1f2937);
  font-size: 14px;
}

.path-item code {
  display: block;
  background: var(--color-background, #ffffff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 4px;
  padding: 8px 12px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  color: var(--color-text, #1f2937);
  word-break: break-all;
  line-height: 1.4;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--color-surface, #f8fafc);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--color-textSecondary, #6b7280);
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-primary, #3b82f6);
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-buttons .btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content.small {
    width: 95%;
    margin: 16px;
  }

  .storage-paths {
    gap: 8px;
  }

  .path-item {
    padding: 10px;
  }

  .path-item code {
    font-size: 12px;
    padding: 6px 8px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .action-buttons .btn {
    justify-content: center;
  }
}
</style>
