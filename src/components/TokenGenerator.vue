<template>
  <div class="token-generator">
    <div class="modal-overlay" @click="$emit('close')">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>生成Augment Token</h2>
          <button class="close-btn" @click="$emit('close')">×</button>
        </div>
        
        <div class="modal-body">
          <!-- Step 1: Generate Authorization URL -->
          <div class="section">
            <h3>步骤 1: 生成Augment授权URL</h3>
            <button 
              @click="generateAuthUrl" 
              :class="['btn', 'primary', { loading: isGenerating }]"
              :disabled="isGenerating"
            >
              生成Augment授权URL
            </button>
            
            <div v-if="authUrl" class="url-section">
              <p>Augment授权URL已生成:</p>
              <div class="url-input-container">
                <input
                  type="text"
                  :value="authUrl"
                  readonly
                  ref="authUrlInput"
                >
              </div>
              <div class="url-buttons">
                <button @click="copyAuthUrl" class="btn secondary">复制</button>
                <button @click="openAuthUrl" class="btn secondary" title="在系统浏览器中打开">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                  </svg>
                  外部打开
                </button>

              </div>
            </div>
          </div>

          <!-- Step 2: Enter Authorization Code -->
          <div class="section">
            <h3>步骤 2: 输入授权码</h3>
            <textarea 
              v-model="authCode"
              placeholder="在此粘贴授权码JSON..." 
              rows="4"
            ></textarea>
            <div class="button-container">
              <button 
                @click="getAccessToken" 
                :class="['btn', 'primary', { loading: isGettingToken }]"
                :disabled="!canGetToken || isGettingToken"
              >
                获取访问令牌
              </button>
            </div>
          </div>

          <!-- Step 3: Access Token -->
          <div class="section" v-if="tokenResult">
            <h3>步骤 3: Augment访问令牌</h3>
            <div class="token-section">
              <div class="result-container">
                <label>访问令牌:</label>
                <div class="token-container">
                  <input 
                    type="text" 
                    :value="tokenResult.access_token" 
                    readonly
                    ref="accessTokenInput"
                  >
                  <button @click="copyAccessToken" class="btn secondary">复制</button>
                </div>
              </div>
              <div class="result-container">
                <label>租户URL:</label>
                <div class="token-container">
                  <input 
                    type="text" 
                    :value="tokenResult.tenant_url" 
                    readonly
                    ref="tenantUrlInput"
                  >
                  <button @click="copyTenantUrl" class="btn secondary">复制</button>
                </div>
              </div>

              <!-- Additional Fields -->
              <div class="additional-fields">
                <div class="field-container">
                  <label>Portal URL:</label>
                  <input
                    type="text"
                    v-model="portalUrl"
                    placeholder="请输入 Portal 地址（可选）"
                    class="field-input"
                  >
                </div>
                <div class="field-container">
                  <label>邮箱备注:</label>
                  <input
                    type="text"
                    v-model="emailNote"
                    placeholder="请输入邮箱相关备注（可选）"
                    class="field-input"
                  >
                </div>
              </div>

              <div class="button-container">
                <button @click="saveAndClose" class="btn success">保存并关闭</button>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'

// Emits
const emit = defineEmits(['close', 'token-saved', 'show-status'])

// Reactive data
const authUrl = ref('')
const authCode = ref('')
const tokenResult = ref(null)
const isGenerating = ref(false)
const isGettingToken = ref(false)
const portalUrl = ref('')
const emailNote = ref('')

// Template refs
const authUrlInput = ref(null)
const accessTokenInput = ref(null)
const tenantUrlInput = ref(null)

// Computed properties
const canGetToken = computed(() => {
  return authUrl.value && (authCode.value || '').trim().length > 0
})

// Methods
const showStatus = (message, type = 'info') => {
  emit('show-status', message, type)
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textArea)
    return success
  }
}

const generateAuthUrl = async () => {
  isGenerating.value = true
  showStatus('正在生成Augment授权URL...', 'info')
  
  try {
    const url = await invoke('generate_augment_auth_url')
    authUrl.value = url
    showStatus('Augment授权URL生成成功!', 'success')
  } catch (error) {
    showStatus(`错误: ${error}`, 'error')
  } finally {
    isGenerating.value = false
  }
}

const copyAuthUrl = async () => {
  const success = await copyToClipboard(authUrl.value)
  showStatus(
    success ? 'URL已复制到剪贴板!' : '复制URL失败',
    success ? 'success' : 'error'
  )
}

const openAuthUrl = async () => {
  try {
    await invoke('open_url', { url: authUrl.value })
    showStatus('正在浏览器中打开授权URL...', 'info')
  } catch (error) {
    showStatus(`打开URL错误: ${error}`, 'error')
  }
}



const getAccessToken = async () => {
  if (!(authCode.value || '').trim()) {
    showStatus('请输入授权码', 'error')
    return
  }

  isGettingToken.value = true
  showStatus('正在获取Augment访问令牌...', 'info')

  try {
    const result = await invoke('get_augment_token', { code: (authCode.value || '').trim() })
    tokenResult.value = result
    showStatus('Augment访问令牌获取成功!', 'success')
  } catch (error) {
    showStatus(`错误: ${error}`, 'error')
  } finally {
    isGettingToken.value = false
  }
}

const copyAccessToken = async () => {
  const success = await copyToClipboard(tokenResult.value.access_token)
  showStatus(
    success ? '访问令牌已复制到剪贴板!' : '复制令牌失败',
    success ? 'success' : 'error'
  )
}

const copyTenantUrl = async () => {
  const success = await copyToClipboard(tokenResult.value.tenant_url)
  showStatus(
    success ? '租户URL已复制到剪贴板!' : '复制URL失败',
    success ? 'success' : 'error'
  )
}

const saveAndClose = async () => {
  try {
    await invoke('save_token', {
      tenantUrl: tokenResult.value.tenant_url,
      accessToken: tokenResult.value.access_token,
      portalUrl: (portalUrl.value || '').trim() || null,
      emailNote: (emailNote.value || '').trim() || null
    })
    showStatus('Token保存成功!', 'success')
    emit('token-saved')
    setTimeout(() => {
      emit('close')
    }, 1000)
  } catch (error) {
    showStatus(`保存失败: ${error}`, 'error')
  }
}

// Initialize
// showStatus('准备生成OAuth令牌', 'info')
</script>

<style scoped>
/* 现代化TokenGenerator模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow:
    0 32px 64px rgba(0, 0, 0, 0.12),
    0 16px 32px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.3s ease-out;

  /* 自定义滚动条 */
  scrollbar-width: thin;
  scrollbar-color: rgba(59, 130, 246, 0.3) transparent;
}

.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: transparent;
}

.modal-content::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.3);
  border-radius: 4px;
  transition: background 0.3s ease;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.5);
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
  font-size: 1.75rem;
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
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

/* 现代化步骤section样式 */
.section {
  margin-bottom: 36px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.06),
    0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  position: relative;
}

.section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8, #7c3aed);
  border-radius: 16px 16px 0 0;
}

.section:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 4px 16px rgba(0, 0, 0, 0.06);
  border-color: rgba(59, 130, 246, 0.3);
}

.section h3 {
  margin: 0 0 20px 0;
  color: #1e293b;
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section h3::before {
  content: counter(step-counter);
  counter-increment: step-counter;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.modal-body {
  counter-reset: step-counter;
}

/* 现代化按钮样式 */
.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.btn.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn.success:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn.loading {
  position: relative;
  color: transparent;
}

.btn.loading::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  margin: auto;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.btn.primary.loading::after {
  border-top-color: white;
}

.btn.secondary.loading::after {
  border-top-color: #475569;
}

.btn.success.loading::after {
  border-top-color: white;
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

/* 现代化URL和Token区域样式 */
.url-section, .token-section {
  margin-top: 20px;
  padding: 16px;
  background: rgba(59, 130, 246, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  text-align: left;
}

.url-section p, .token-section p {
  margin: 0 0 12px 0;
  text-align: left;
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

.url-input-container {
  margin-top: 12px;
}

/* 现代化输入框样式 */
.url-input-container input,
textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 10px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 2px rgba(0, 0, 0, 0.02);
  color: #1e293b;
  box-sizing: border-box;
}

.url-input-container input:focus,
textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow:
    0 0 0 4px rgba(59, 130, 246, 0.12),
    0 8px 24px rgba(59, 130, 246, 0.15),
    inset 0 1px 2px rgba(0, 0, 0, 0.02);
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
}

textarea {
  min-height: 120px;
  resize: vertical;
  line-height: 1.5;
}

.url-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.url-buttons .btn {
  padding: 10px 18px;
  font-size: 13px;
  min-width: 100px;
}

.token-container {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.token-container input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 11px;
  min-width: 0;
}

.token-container .btn {
  flex-shrink: 0;
  padding: 8px 12px;
  font-size: 12px;
  white-space: nowrap;
}

.result-container {
  margin-bottom: 15px;
}

.result-container label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
}

.additional-fields {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e1e5e9;
}

.field-container {
  margin-bottom: 15px;
}

.field-container label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.field-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.field-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-input::placeholder {
  color: #9ca3af;
}

.button-container {
  margin-top: 15px;
}


</style>
