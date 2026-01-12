<template>
  <router-view />
  <google-auth-bind-dialog v-model="showGoogleAuthBindDialog" :qr-code-url="qrCodeUrl" :secret="secret" :username="username" @bind-success="handleBindSuccess" />
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import useSettingsStore from '@/store/modules/settings'
import useUserStore from '@/store/modules/user'
import { handleThemeStyle } from '@/utils/theme'
import GoogleAuthBindDialog from '@/components/GoogleAuthBindDialog'

const showGoogleAuthBindDialog = ref(false)
const qrCodeUrl = ref('')
const secret = ref('')
const username = ref('')

onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme)
  })
  
  // 监听全局事件，显示Google验证器绑定对话框
  window.addEventListener('show-google-auth-bind', handleShowGoogleAuthBind)
})

onUnmounted(() => {
  // 移除事件监听器
  window.removeEventListener('show-google-auth-bind', handleShowGoogleAuthBind)
})

// 处理显示Google验证器绑定对话框的事件
function handleShowGoogleAuthBind(event) {
  const { qrCode, secret: secretValue, username: userName } = event.detail || {}
  if (qrCode && secretValue) {
    // 设置绑定信息
    qrCodeUrl.value = qrCode
    secret.value = secretValue
    username.value = userName
    showGoogleAuthBindDialog.value = true
  }
}

function handleBindSuccess() {
  // 绑定成功后的处理
  showGoogleAuthBindDialog.value = false
  qrCodeUrl.value = ''
  secret.value = ''
}
</script>
