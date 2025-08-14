<template>
  <div class="token-card">
    <!-- 状态指示器 -->
    <div v-if="(token.portal_url && portalInfo.data) || token.ban_status" class="status-indicator">
      <!-- 账号状态优先显示 -->
      <span v-if="token.ban_status" :class="['status-badge', token.ban_status === 'SUSPENDED' ? 'banned' : 'active']">
        {{ token.ban_status === 'SUSPENDED' ? '已封禁' : '正常' }}
      </span>
      <!-- Portal状态作为备选 -->
      <span v-else-if="token.portal_url && portalInfo.data" :class="['status-badge', portalInfo.data.is_active ? 'active' : 'inactive']">
        {{ portalInfo.data.is_active ? '正常' : '失效' }}
      </span>
    </div>

    <div class="card-main">
      <div class="token-info">
        <h3 class="tenant-name">{{ displayUrl }}</h3>
        <div class="token-meta">
          <!-- 第一行：创建日期和邮箱备注 -->
          <div class="meta-row">
            <span class="created-date">{{ formatDate(token.created_at) }}</span>
            <div v-if="token.email_note" class="email-note-container">
              <span class="email-note">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" class="email-icon">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                {{ token.email_note }}
              </span>
              <button @click="copyEmailNote" class="copy-email-btn" title="复制邮箱备注">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
              </button>
            </div>
          </div>
          <!-- 第二行：Portal信息 -->
          <template v-if="token.portal_url">
            <div class="meta-row portal-row">
              <!-- 优先显示Portal数据，无论是来自本地缓存还是网络请求 -->
              <template v-if="portalInfo.data">
                <span class="portal-meta expiry">过期: {{ formatExpiryDate(portalInfo.data.expiry_date) }}</span>
                <span class="portal-meta balance">剩余: {{ portalInfo.data.credits_balance }}</span>
              </template>
              <!-- 如果没有数据且正在加载，显示加载状态 -->
              <span v-else-if="isLoadingPortalInfo" class="portal-meta loading">加载中...</span>
              <!-- 不显示错误信息，静默处理所有错误 -->
            </div>
          </template>
        </div>
      </div>

      <div class="actions">
        <button @click="openEditorModal" class="btn-action editor" title="一键上号">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z"/>
          </svg>
        </button>
        <button @click="copyToken" class="btn-action" title="复制Token">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
          </svg>
        </button>
        <button @click="copyTenantUrl" class="btn-action" title="复制租户URL">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
          </svg>
        </button>
        <button @click="checkAccountStatus" :class="['btn-action', 'status-check', { loading: isCheckingStatus }]" :disabled="isCheckingStatus" title="检测账号状态">
          <svg v-if="!isCheckingStatus" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
          <div v-else class="loading-spinner"></div>
        </button>
        <button v-if="token.portal_url" @click="$emit('open-portal', token)" class="btn-action portal" title="打开Portal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
          </svg>
        </button>
        <button @click="$emit('edit', token)" class="btn-action edit" title="编辑Token">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
        <button @click="deleteToken" class="btn-action delete" title="删除Token">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- 增强版编辑器选择模态框 -->
  <Teleport to="body">
    <Transition name="modal" appear>
      <div v-if="showEditorModal" class="editor-modal-overlay" @click.self="closeModal">
        <div class="editor-modal" @click.stop>
          <div class="modal-header">
            <h3>选择编辑器</h3>
            <div class="modal-subtitle">一键打开编辑器并自动认证</div>
            <button @click.stop="showEditorModal = false" class="modal-close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          <div class="modal-content">
            <div class="editor-options">
              <button
                v-for="(editor, index) in availableEditors"
                :key="editor.id"
                @click="openEditor(editor.id)"
                :class="['editor-option', editor.id + '-option']"
                :title="`按 ${index + 1} 快速选择`"
              >
                <div class="editor-icon">
                  <component :is="editor.icon" />
                </div>
                <div class="editor-info">
                  <div class="editor-name-row">
                    <span class="editor-name">{{ editor.name }}</span>
                  </div>
                  <span class="editor-desc">{{ editor.description }}</span>
                </div>
                <div class="shortcut-key">{{ index + 1 }}</div>
              </button>
            </div>
            <div class="modal-footer">
              <div class="tips">
                <span class="tip-text">💡 提示：按数字键 1-{{ availableEditors.length }} 快速选择</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, h } from 'vue'
import { invoke } from '@tauri-apps/api/core'

// Props
const props = defineProps({
  token: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['delete', 'copy-success', 'open-portal', 'edit'])

// 编辑器图标组件
const CursorIcon = () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'currentColor' }, [
  h('path', { d: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' })
])

const VSCodeIcon = () => h('svg', { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'currentColor' }, [
  h('path', { d: 'M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z' })
])



// 编辑器配置 - 只支持VSCode和Cursor
const editorConfigs = [
  {
    id: 'cursor',
    name: 'Cursor',
    description: 'AI-powered code editor',
    protocol: 'cursor://Augment.vscode-augment/autoAuth',
    icon: CursorIcon,
    color: '#0369a1',
    bgColor: '#e0f2fe'
  },
  {
    id: 'vscode',
    name: 'VS Code',
    description: 'Visual Studio Code',
    protocol: 'vscode://Augment.vscode-augment/autoAuth',
    icon: VSCodeIcon,
    color: '#1d4ed8',
    bgColor: '#dbeafe'
  }
]

// Reactive data
const isLoadingPortalInfo = ref(false)
const portalInfo = ref({ data: null, error: null })
const isCheckingStatus = ref(false)
const showEditorModal = ref(false)


// Computed properties
const displayUrl = computed(() => {
  try {
    const url = new URL(props.token.tenant_url)
    return url.hostname
  } catch {
    return props.token.tenant_url
  }
})

const maskedToken = computed(() => {
  const token = props.token.access_token
  if (token.length <= 20) return token
  return token.substring(0, 10) + '...' + token.substring(token.length - 10)
})

// 可用编辑器列表
const availableEditors = computed(() => {
  return editorConfigs
})



// Methods
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}





const deleteToken = () => {
  // 直接发出删除事件，让父组件处理确认逻辑
  emit('delete', props.token.id)
}

// 复制到剪贴板的通用方法 - 优化版本
const copyToClipboard = async (text) => {
  try {
    // 优先使用现代Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级到传统方法，但使用更安全的实现
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      textArea.setAttribute('readonly', '')
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    }
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}

// 复制Token
const copyToken = async () => {
  const success = await copyToClipboard(props.token.access_token)
  if (success) {
    emit('copy-success', 'Token已复制到剪贴板!', 'success')
  } else {
    emit('copy-success', '复制Token失败', 'error')
  }
}

// 复制租户URL
const copyTenantUrl = async () => {
  const success = await copyToClipboard(props.token.tenant_url)
  if (success) {
    emit('copy-success', '租户URL已复制到剪贴板!', 'success')
  } else {
    emit('copy-success', '复制租户URL失败', 'error')
  }
}

// 复制邮箱备注
const copyEmailNote = async () => {
  const success = await copyToClipboard(props.token.email_note)
  if (success) {
    emit('copy-success', '邮箱备注已复制到剪贴板!', 'success')
  } else {
    emit('copy-success', '复制邮箱备注失败', 'error')
  }
}

// 编辑器相关方法
const openEditorModal = () => {
  if (showEditorModal.value) return
  showEditorModal.value = true
}

const closeModal = () => {
  showEditorModal.value = false
}

const openEditor = async (editorId) => {
  try {
    const editor = editorConfigs.find(e => e.id === editorId)
    if (!editor) {
      throw new Error('未找到指定编辑器')
    }

    const token = encodeURIComponent(props.token.access_token)
    const url = encodeURIComponent(props.token.tenant_url)
    const protocolUrl = `${editor.protocol}?token=${token}&url=${url}`

    // 创建隐藏链接触发协议
    const link = document.createElement('a')
    link.href = protocolUrl
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)



    // 关闭模态框
    showEditorModal.value = false

    emit('copy-success', `正在打开 ${editor.name}...`, 'success')

  } catch (error) {
    console.error('Failed to open editor:', error)
    emit('copy-success', `打开编辑器失败: ${error.message}`, 'error')
    showEditorModal.value = false
  }
}



// 键盘事件处理
const handleKeydown = (event) => {
  if (!showEditorModal.value) return

  if (event.key === 'Escape') {
    showEditorModal.value = false
    return
  }

  // 数字键快速选择
  const num = parseInt(event.key)
  if (num >= 1 && num <= availableEditors.value.length) {
    const editor = availableEditors.value[num - 1]
    if (editor) {
      openEditor(editor.id)
    }
  }
}



const extractTokenFromPortalUrl = (portalUrl) => {
  try {
    const url = new URL(portalUrl)
    return url.searchParams.get('token')
  } catch {
    return null
  }
}

const loadPortalInfo = async (forceRefresh = false) => {
  console.log('loadPortalInfo called with forceRefresh:', forceRefresh)
  console.log('token.portal_url:', props.token.portal_url)
  console.log('token.portal_info:', props.token.portal_info)

  if (!props.token.portal_url) {
    console.log('No portal_url, returning')
    return
  }

  const token = extractTokenFromPortalUrl(props.token.portal_url)
  console.log('Extracted token:', token ? 'found' : 'not found')
  if (!token) return

  // 优先显示本地存储的Portal信息
  if (!forceRefresh && props.token.portal_info) {
    console.log('Using cached portal info')
    portalInfo.value = {
      data: {
        credits_balance: props.token.portal_info.credits_balance,
        expiry_date: props.token.portal_info.expiry_date,
        is_active: props.token.portal_info.is_active
      },
      error: null
    }
  } else if (!props.token.portal_info) {
    // 如果没有本地数据，先清空错误状态
    console.log('No cached data, clearing error state')
    portalInfo.value = { data: null, error: null }
  }

  // 在后台获取最新信息
  console.log('Starting background fetch')
  isLoadingPortalInfo.value = true

  try {
    // 首先获取customer信息
    console.log('Calling get_customer_info...')
    const customerResponse = await invoke('get_customer_info', { token })
    console.log('Customer response received:', customerResponse)
    const customerData = JSON.parse(customerResponse)
    console.log('Customer data parsed:', customerData)

    if (customerData.customer && customerData.customer.ledger_pricing_units && customerData.customer.ledger_pricing_units.length > 0) {
      const customerId = customerData.customer.id
      const pricingUnitId = customerData.customer.ledger_pricing_units[0].id
      console.log('Customer ID:', customerId, 'Pricing Unit ID:', pricingUnitId)

      // 获取ledger summary
      console.log('Calling get_ledger_summary...')
      const ledgerResponse = await invoke('get_ledger_summary', {
        customerId,
        pricingUnitId,
        token
      })
      console.log('Ledger response received:', ledgerResponse)
      const ledgerData = JSON.parse(ledgerResponse)
      console.log('Ledger data parsed:', ledgerData)

      if (ledgerData.credit_blocks && ledgerData.credit_blocks.length > 0) {
        console.log('Credit blocks found:', ledgerData.credit_blocks.length)
        const newPortalData = {
          credits_balance: parseInt(ledgerData.credits_balance) || 0,
          expiry_date: ledgerData.credit_blocks[0].expiry_date,
          is_active: ledgerData.credit_blocks[0].is_active
        }
        console.log('New portal data:', newPortalData)

        // 更新UI显示
        portalInfo.value = {
          data: newPortalData,
          error: null
        }
        console.log('UI updated with portal data')

        // 保存到本地存储
        try {
          const saveResult = await invoke('update_token_portal_info', {
            id: props.token.id,
            creditsBalance: parseInt(ledgerData.credits_balance) || 0,
            expiryDate: ledgerData.credit_blocks[0].expiry_date,
            isActive: ledgerData.credit_blocks[0].is_active
          })
          console.log('Portal info saved successfully:', saveResult)
        } catch (saveError) {
          console.error('Failed to save portal info:', saveError)
        }

        // 更新本地token对象
        props.token.portal_info = {
          credits_balance: parseInt(ledgerData.credits_balance) || 0,
          expiry_date: ledgerData.credit_blocks[0].expiry_date,
          is_active: ledgerData.credit_blocks[0].is_active,
          last_updated: new Date().toISOString()
        }
        console.log('Updated token portal_info:', props.token.portal_info)
      } else {
        // 如果没有本地数据，静默处理，不显示错误信息
        if (!props.token.portal_info) {
          portalInfo.value = { data: null, error: null }
        }
      }
    } else {
      // 如果没有本地数据，静默处理，不显示错误信息
      if (!props.token.portal_info) {
        portalInfo.value = { data: null, error: null }
      }
    }
  } catch (error) {
    console.error('Failed to load portal info:', error)
    // 无论是否有本地数据，都不显示错误信息，静默处理
    if (!props.token.portal_info) {
      portalInfo.value = { data: null, error: null }
    }
    // 如果是强制刷新，则抛出错误以便上层处理
    if (forceRefresh) {
      throw error
    }
  } finally {
    isLoadingPortalInfo.value = false
  }
}

const formatExpiryDate = (dateString) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

// 检测账号状态
const checkAccountStatus = async () => {
  console.log('checkAccountStatus called')
  if (isCheckingStatus.value) return

  isCheckingStatus.value = true

  try {
    // 并行执行两个操作：账号状态检测和Portal信息获取
    const promises = []

    // 1. 账号状态检测
    console.log('Adding account status check promise')
    const statusCheckPromise = invoke('check_account_status', {
      token: props.token.access_token,
      tenantUrl: props.token.tenant_url
    })
    promises.push(statusCheckPromise)

    // 2. Portal信息获取（如果有portal_url）
    let portalInfoPromise = null
    if (props.token.portal_url) {
      console.log('Adding portal info promise')
      portalInfoPromise = loadPortalInfo(true) // 强制刷新
      promises.push(portalInfoPromise)
    } else {
      console.log('No portal_url, skipping portal info fetch')
    }

    // 等待所有操作完成
    const results = await Promise.allSettled(promises)

    // 处理账号状态检测结果
    const statusResult = results[0]
    let statusMessage = ''
    let statusType = 'info'

    if (statusResult.status === 'fulfilled') {
      const result = statusResult.value
      // 更新token的ban_status
      const banStatus = result.is_banned ? 'SUSPENDED' : 'ACTIVE'
      await invoke('update_token_ban_status', {
        id: props.token.id,
        banStatus: banStatus
      })

      // 更新本地token对象
      props.token.ban_status = banStatus

      statusMessage = result.is_banned ? '账号已封禁' : '账号状态正常'
      statusType = result.is_banned ? 'error' : 'success'
    } else {
      console.error('Account status check failed:', statusResult.reason)
      statusMessage = `状态检测失败: ${statusResult.reason}`
      statusType = 'error'
    }

    // 处理Portal信息获取结果（静默更新，不在通知中显示）
    if (portalInfoPromise && results.length > 1) {
      const portalResult = results[1]
      if (portalResult.status === 'rejected') {
        console.error('Portal info fetch failed:', portalResult.reason)
        // 如果有本地数据，继续显示本地数据，不显示错误
      }
      // loadPortalInfo方法已经处理了成功和失败的情况
    }

    // 发送账号状态消息（不包含次数信息）
    const finalMessage = `检测完成：${statusMessage}`
    emit('copy-success', finalMessage, statusType)

  } catch (error) {
    console.error('Account status check failed:', error)
    emit('copy-success', `检测失败: ${error}`, 'error')
  } finally {
    isCheckingStatus.value = false
    isLoadingPortalInfo.value = false
  }
}

// 暴露刷新Portal信息的方法
const refreshPortalInfo = async () => {
  if (props.token.portal_url) {
    return await loadPortalInfo(true) // 强制刷新
  }
  return Promise.resolve()
}

// 组件挂载时加载Portal信息和初始化编辑器数据
onMounted(() => {
  // 加载Portal信息
  if (props.token.portal_url) {
    // 如果有本地数据，立即显示
    if (props.token.portal_info) {
      portalInfo.value = {
        data: {
          credits_balance: props.token.portal_info.credits_balance,
          expiry_date: props.token.portal_info.expiry_date,
          is_active: props.token.portal_info.is_active
        },
        error: null
      }
    }
    // 然后在后台刷新数据
    loadPortalInfo(false)
  }



  // 添加键盘事件监听器
  document.addEventListener('keydown', handleKeydown)
})

// 组件卸载时清理事件监听器
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// 暴露方法给父组件
defineExpose({
  refreshPortalInfo
})
</script>

<style scoped>
/* 现代化卡片样式 */
.token-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 16px;
  padding: 24px;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.06),
    0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: fit-content;
  min-height: 140px;
  position: relative;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  overflow: hidden;
}

.token-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #1d4ed8, #7c3aed);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.token-card:hover::before {
  opacity: 1;
}

.status-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}

.status-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-badge.active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.status-badge.inactive {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.status-badge.banned {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.token-card:hover {
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.12),
    0 8px 24px rgba(0, 0, 0, 0.08),
    0 4px 16px rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.5);
  transform: translateY(-4px) scale(1.02);
}

.card-main {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.token-info {
  flex: 1;
  min-width: 0;
}

.tenant-name {
  margin: 0 0 6px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  word-break: break-all;
  line-height: 1.3;
}

.token-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.portal-row {
  margin-top: 2px;
}

.created-date {
  font-size: 12px;
  color: #666;
}

.email-note-container {
  display: flex;
  align-items: center;
  gap: 6px;
}

.email-note {
  font-size: 12px;
  color: #4f46e5;
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f0f9ff;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #e0f2fe;
}

.email-icon {
  flex-shrink: 0;
  opacity: 0.7;
}

.copy-email-btn {
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  color: #6b7280;
  border-radius: 3px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-email-btn:hover {
  background: #f3f4f6;
  color: #4f46e5;
}

.copy-email-btn:active {
  transform: scale(0.95);
}

.portal-meta {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
}

.portal-meta.loading {
  color: #6c757d;
  font-style: italic;
}

.portal-meta.error {
  color: #dc3545;
  background: #f8d7da;
}

.portal-meta.expiry {
  color: #856404;
  background: #fff3cd;
}

.portal-meta.balance {
  color: #155724;
  background: #d4edda;
  font-weight: 600;
}





/* 现代化操作按钮区域 */
.actions {
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: flex-end;
  margin-top: auto;
  flex-wrap: wrap;
  padding-top: 8px;
}

.btn-action {
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.btn-action::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  transition: left 0.5s ease;
}

.btn-action:hover::before {
  left: 100%;
}

.btn-action:hover {
  background: rgba(241, 245, 249, 0.9);
  border-color: rgba(203, 213, 225, 0.8);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 特殊按钮样式 */
.btn-action.delete {
  color: #ef4444;
}

.btn-action.delete:hover {
  background: rgba(254, 242, 242, 0.9);
  border-color: rgba(252, 165, 165, 0.8);
  color: #dc2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.btn-action.portal {
  color: #3b82f6;
}

.btn-action.portal:hover {
  background: rgba(239, 246, 255, 0.9);
  border-color: rgba(147, 197, 253, 0.8);
  color: #1d4ed8;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.btn-action.edit {
  color: #10b981;
}

.btn-action.edit:hover {
  background: rgba(236, 253, 245, 0.9);
  border-color: rgba(167, 243, 208, 0.8);
  color: #059669;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.btn-action.editor {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-action.editor:hover {
  background: linear-gradient(135deg, #005a9e, #0284c7);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3);
}

.btn-action.status-check {
  color: #ffc107;
}

.btn-action.status-check:hover {
  background: #fff3cd;
  border-color: #ffeaa7;
}

.btn-action.status-check.loading {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 14px;
  height: 14px;
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



/* 响应式处理 */
@media (max-width: 768px) {
  .token-card {
    padding: 16px;
    min-height: 100px;
  }

  .card-main {
    gap: 12px;
  }

  .tenant-name {
    font-size: 14px;
  }

  .actions {
    gap: 4px;
  }

  .btn-action {
    padding: 6px;
    min-width: 32px;
    min-height: 32px;
  }

  .btn-action svg {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 480px) {
  .token-card {
    padding: 12px;
  }

  .actions {
    gap: 3px;
    justify-content: center;
  }

  .btn-action {
    padding: 6px;
    min-width: 30px;
    min-height: 30px;
  }

  .btn-action svg {
    width: 14px;
    height: 14px;
  }

  .token-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

/* 模态框过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .editor-modal,
.modal-leave-to .editor-modal {
  transform: translateY(-20px) scale(0.95);
}

.modal-enter-to .editor-modal,
.modal-leave-from .editor-modal {
  transform: translateY(0) scale(1);
}

/* 编辑器选择模态框样式 */
.editor-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
  pointer-events: auto;
}

.editor-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  transition: transform 0.3s ease;
  position: relative;
  pointer-events: auto;
  margin: auto;
}

.modal-header {
  display: flex;
  flex-direction: column;
  padding: 24px 28px 16px;
  border-bottom: 1px solid #e1e5e9;
  position: relative;
}

.modal-header h3 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.modal-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.modal-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #6b7280;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-content {
  padding: 20px 28px 24px;
}

.editor-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.editor-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.editor-option:hover {
  border-color: #3b82f6;
  background: #f8fafc;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

.editor-option:active {
  background: #f1f5f9;
  transform: translateY(0);
}

.editor-option.recommended {
  border-color: #10b981;
  background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
}

.editor-option.recommended:hover {
  border-color: #059669;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.2);
}

.editor-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #f3f4f6;
  transition: all 0.2s ease;
}

.cursor-option .editor-icon {
  background: #e0f2fe;
  color: #0369a1;
}

.vscode-option .editor-icon {
  background: #dbeafe;
  color: #1d4ed8;
}



.editor-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.editor-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.editor-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}



.editor-desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.editor-stats {
  margin-top: 2px;
}



.shortcut-key {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.editor-option:hover .shortcut-key {
  background: #3b82f6;
  color: white;
}

.modal-footer {
  padding: 16px 28px 0;
  border-top: 1px solid #f3f4f6;
}

.tips {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tip-text {
  font-size: 13px;
  color: #6b7280;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .editor-modal {
    width: 95%;
    margin: 16px;
  }

  .modal-header {
    padding: 20px 24px 12px;
  }

  .modal-header h3 {
    font-size: 18px;
  }

  .modal-content {
    padding: 16px 24px 20px;
  }

  .editor-option {
    padding: 12px;
    gap: 12px;
  }

  .editor-icon {
    width: 40px;
    height: 40px;
  }

  .editor-name {
    font-size: 15px;
  }

  .editor-desc {
    font-size: 12px;
  }

  .shortcut-key {
    width: 20px;
    height: 20px;
    font-size: 11px;
  }
}


</style>
