<template>
  <div class="token-form-modal">
    <div class="modal-overlay" @click="handleCancel">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditing ? '编辑Token' : '添加Token' }}</h2>
          <button class="close-btn" @click="handleCancel">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="tenantUrl">租户URL *</label>
              <input
                id="tenantUrl"
                v-model="formData.tenantUrl"
                type="url"
                placeholder="https://example.augmentcode.com/"
                required
                :disabled="isLoading"
              >
              <div v-if="errors.tenantUrl" class="error-message">{{ errors.tenantUrl }}</div>
            </div>

            <div class="form-group">
              <label for="accessToken">访问令牌 *</label>
              <textarea
                id="accessToken"
                v-model="formData.accessToken"
                placeholder="请输入访问令牌..."
                rows="3"
                required
                :disabled="isLoading"
              ></textarea>
              <div v-if="errors.accessToken" class="error-message">{{ errors.accessToken }}</div>
            </div>

            <div class="form-group">
              <label for="portalUrl">Portal URL (可选)</label>
              <input
                id="portalUrl"
                v-model="formData.portalUrl"
                type="url"
                placeholder="https://portal.withorb.com/view?token=xxx"
                :disabled="isLoading"
              >
              <div class="help-text">用于查看账户余额和过期时间</div>
              <div v-if="errors.portalUrl" class="error-message">{{ errors.portalUrl }}</div>
            </div>

            <div class="form-group">
              <label for="emailNote">邮箱备注 (可选)</label>
              <input
                id="emailNote"
                v-model="formData.emailNote"
                type="text"
                placeholder="请输入邮箱相关备注"
                :disabled="isLoading"
              >
              <div class="help-text">用于记录与此Token相关的邮箱信息</div>
              <div v-if="errors.emailNote" class="error-message">{{ errors.emailNote }}</div>
            </div>

            <div class="form-actions">
              <button type="button" @click="handleCancel" class="btn secondary" :disabled="isLoading">
                取消
              </button>
              <button type="submit" class="btn primary" :disabled="isLoading || !isFormValid">
                <span v-if="isLoading" class="loading-spinner"></span>
                {{ isLoading ? '保存中...' : (isEditing ? '更新' : '保存') }}
              </button>
            </div>
          </form>
        </div>


      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { invoke } from '@tauri-apps/api/core'

// Props
const props = defineProps({
  token: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'success', 'show-status'])

// Reactive data
const formData = ref({
  tenantUrl: '',
  accessToken: '',
  portalUrl: '',
  emailNote: ''
})

const errors = ref({
  tenantUrl: '',
  accessToken: '',
  portalUrl: '',
  emailNote: ''
})

const isLoading = ref(false)

// Computed properties
const isEditing = computed(() => !!props.token)

const isFormValid = computed(() => {
  return (formData.value.tenantUrl || '').trim() &&
         (formData.value.accessToken || '').trim() &&
         !errors.value.tenantUrl &&
         !errors.value.accessToken &&
         !errors.value.portalUrl &&
         !errors.value.emailNote
})

// Watch for token prop changes (for editing)
watch(() => props.token, (newToken) => {
  if (newToken) {
    formData.value = {
      tenantUrl: newToken.tenant_url || '',
      accessToken: newToken.access_token || '',
      portalUrl: newToken.portal_url || '',
      emailNote: newToken.email_note || ''
    }
  } else {
    // Reset form for adding new token
    formData.value = {
      tenantUrl: '',
      accessToken: '',
      portalUrl: ''
    }
  }
  // Clear errors when token changes
  errors.value = {
    tenantUrl: '',
    accessToken: '',
    portalUrl: ''
  }
}, { immediate: true })

// Methods
const showStatus = (message, type = 'info') => {
  emit('show-status', message, type)
}

const validateForm = () => {
  errors.value = {
    tenantUrl: '',
    accessToken: '',
    portalUrl: ''
  }

  // Validate tenant URL
  if (!(formData.value.tenantUrl || '').trim()) {
    errors.value.tenantUrl = '租户URL不能为空'
  } else {
    try {
      new URL(formData.value.tenantUrl)
    } catch {
      errors.value.tenantUrl = '请输入有效的URL格式'
    }
  }

  // Validate access token
  if (!(formData.value.accessToken || '').trim()) {
    errors.value.accessToken = '访问令牌不能为空'
  }

  // Validate portal URL (optional)
  if ((formData.value.portalUrl || '').trim()) {
    try {
      new URL(formData.value.portalUrl)
    } catch {
      errors.value.portalUrl = '请输入有效的URL格式'
    }
  }

  return !errors.value.tenantUrl && !errors.value.accessToken && !errors.value.portalUrl
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  showStatus(isEditing.value ? '正在更新Token...' : '正在保存Token...', 'info')

  try {
    if (isEditing.value) {
      // Update existing token
      const result = await invoke('update_token', {
        id: props.token.id,
        tenantUrl: (formData.value.tenantUrl || '').trim(),
        accessToken: (formData.value.accessToken || '').trim(),
        portalUrl: (formData.value.portalUrl || '').trim() || null,
        emailNote: (formData.value.emailNote || '').trim() || null
      })

      if (result) {
        showStatus('Token更新成功!', 'success')
        emit('success')
        setTimeout(() => {
          emit('close')
        }, 1000)
      } else {
        showStatus('Token更新失败: 未找到指定的Token', 'error')
      }
    } else {
      // Add new token
      const result = await invoke('save_token', {
        tenantUrl: (formData.value.tenantUrl || '').trim(),
        accessToken: (formData.value.accessToken || '').trim(),
        portalUrl: (formData.value.portalUrl || '').trim() || null,
        emailNote: (formData.value.emailNote || '').trim() || null
      })

      showStatus('Token保存成功!', 'success')
      emit('success')
      setTimeout(() => {
        emit('close')
      }, 1000)
    }
  } catch (error) {
    showStatus(`${isEditing.value ? '更新' : '保存'}Token失败: ${error}`, 'error')
  } finally {
    isLoading.value = false
  }
}

const handleCancel = () => {
  emit('close')
}
</script>

<style scoped>
/* 现代化TokenForm模态框样式 */
.token-form-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1100;
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
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  width: 100%;
  max-width: 550px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow:
    0 32px 64px rgba(0, 0, 0, 0.12),
    0 16px 32px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.3s ease-out;
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.6);
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
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(248, 250, 252, 0.95);
  color: #475569;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 现代化表单主体样式 */
.modal-body {
  padding: 32px;
  max-height: calc(90vh - 120px);
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

/* 现代化表单组样式 */
.form-group {
  margin-bottom: 28px;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
}

.form-group label::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 20px;
  height: 2px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 1px;
}

/* 现代化输入框样式 */
.form-group input,
.form-group textarea {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-sizing: border-box;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 2px rgba(0, 0, 0, 0.02);
  color: #1e293b;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow:
    0 0 0 4px rgba(59, 130, 246, 0.12),
    0 8px 24px rgba(59, 130, 246, 0.15),
    inset 0 1px 2px rgba(0, 0, 0, 0.02);
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
}

.form-group input:disabled,
.form-group textarea:disabled {
  background: rgba(248, 250, 252, 0.8);
  color: #64748b;
  border-color: rgba(203, 213, 225, 0.8);
  cursor: not-allowed;
  transform: none;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.6;
}

/* 现代化帮助文本样式 */
.help-text {
  font-size: 13px;
  color: #64748b;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 8px;
  border-left: 3px solid rgba(59, 130, 246, 0.3);
  line-height: 1.4;
}

/* 现代化错误提示样式 */
.error-message {
  color: #ef4444;
  font-size: 13px;
  font-weight: 500;
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.05);
  border-radius: 8px;
  border-left: 3px solid rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  gap: 6px;
}

.error-message::before {
  content: '⚠️';
  font-size: 14px;
}

/* 现代化表单操作区域 */
.form-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

/* 现代化按钮样式 */
.btn {
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.btn.secondary {
  background: rgba(248, 250, 252, 0.8);
  color: #475569;
  border: 1px solid rgba(226, 232, 240, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.btn.secondary:hover:not(:disabled) {
  background: rgba(241, 245, 249, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}


</style>
