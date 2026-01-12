<template>
  <el-dialog title="Google验证器绑定" v-model="showDialog" width="400px" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
    <div v-if="step === 1" class="bind-step">
      <p class="step-title">请扫描下方二维码完成绑定：</p>
      <div class="qr-container">
        <vue-qrcode v-if="currentQrCode" :value="currentQrCode" :size="200" level="H" class="qr-code" />
        <div v-else class="loading-placeholder">加载中...</div>
      </div>
      <p class="secret-info">
        如果无法扫描，请手动添加：<br/>
        <strong>密钥:</strong> {{ currentSecret || '加载中...' }}<br/>
        <strong>账户:</strong> {{ googleAuthInfo.account || '加载中...' }}
      </p>
      <el-button type="primary" @click="nextStep" style="margin-top: 20px;">下一步</el-button>
    </div>
    <div v-if="step === 2" class="verify-step">
      <p class="step-title">请输入Google验证器中的6位验证码完成绑定：</p>
      <el-form :model="verifyForm" :rules="verifyRules" ref="verifyFormRef">
        <el-form-item prop="code">
          <el-input v-model="verifyForm.code" placeholder="请输入6位验证码" maxlength="6" style="width: 200px;" />
        </el-form-item>
      </el-form>
      <div class="button-group">
        <el-button @click="prevStep">上一步</el-button>
        <el-button type="primary" :loading="verifying" @click="verifyCode">验证</el-button>
      </div>
    </div>
    <div v-if="step === 3" class="success-step">
      <div class="success-icon">
        <el-icon><Check /></el-icon>
      </div>
      <p class="success-text">Google验证器绑定成功！</p>
      <p class="success-desc">从下次登录开始，您需要提供Google验证码才能登录。</p>
      <el-button type="primary" @click="finishBinding" style="margin-top: 20px;">完成</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import VueQrcode from '@/components/QRCode'
import { Check } from '@element-plus/icons-vue'
import {bindGoogleAuthCodeWithUsername} from '@/api/login'
import useUserStore from '@/store/modules/user'
import { ElMessage } from 'element-plus'
import { getCurrentInstance } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  qrCodeUrl: {
    type: String,
    default: ''
  },
  secret: {
    type: String,
    default: ''
  },
  username: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'bind-success'])

const step = ref(1)
const verifying = ref(false)
const googleAuthInfo = ref({})
const verifyForm = reactive({
  code: ''
})
const verifyRules = {
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^\d{6}$/, message: '请输入6位数字验证码', trigger: 'blur' }
  ]
}

const showDialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 从props或内部状态获取二维码和密钥
const currentQrCode = computed(() => {
  return googleAuthInfo.value.qrCodeUrl || ''
})
const currentSecret = computed(() => {
  return googleAuthInfo.value.secret || ''
})

// 由于现在通过props传递数据，不再需要全局事件监听器
// 由于现在主要通过props传递数据，这个函数已不再使用
// 处理显示绑定对话框的事件
function handleShowBindDialog(event) {
  const { qrCode, secret, username } = event.detail || {}
  if (qrCode && secret) {
    // 更新googleAuthInfo
    googleAuthInfo.value = {
      qrCodeUrl: qrCode,
      secret: secret,
      account: username // 使用当前域名作为账户名
    }
    step.value = 1 // 重置到第一步
    // 显示对话框
    emit('update:modelValue', true)
  }
}


function nextStep() {
  step.value = 2
}

function prevStep() {
  step.value = 1
}

const verifyFormRef = ref(null)

async function verifyCode() {
  if (!verifyFormRef.value) {
    ElMessage.error('表单未正确初始化')
    return
  }
  verifyFormRef.value.validate(async (valid) => {
    if (valid) {
      verifying.value = true
      try {
        const userStore = useUserStore()
        // 优先使用props传入的用户名，如果为空再尝试从userStore获取
        const userName = props.username || userStore.name
        const res = await bindGoogleAuthCodeWithUsername(verifyForm.code, currentSecret.value, userName)
        if (res.code === 200) {
          step.value = 3
        } else {
          ElMessage.error(res.msg || '验证码验证失败')
        }
      } catch (error) {
        console.error('绑定Google验证器失败:', error)
        ElMessage.error('验证码验证失败')
      } finally {
        verifying.value = false
      }
    }
  })
}

function finishBinding() {
  const userStore = useUserStore()
  userStore.needBindGoogleAuth = false
  showDialog.value = false
  step.value = 1
  verifyForm.code = ''
  emit('bind-success')
}

// 监听对话框显示状态
watch(showDialog, (newVal) => {
  if (newVal) {
    // 当对话框显示时，优先使用props中的数据
    if (props.qrCodeUrl && props.secret) {
      googleAuthInfo.value = {
        qrCodeUrl: props.qrCodeUrl,
        secret: props.secret,
        account: props.username // 使用当前域名作为账户名
      }
      step.value = 1
    }
  }
})
</script>

<style scoped>
.step-title {
  text-align: center;
  margin-bottom: 20px;
  font-weight: bold;
}

.qr-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.loading-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 200px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.secret-info {
  font-size: 12px;
  color: #666;
  text-align: center;
  word-break: break-all;
  margin-bottom: 20px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.success-icon {
  text-align: center;
  font-size: 48px;
  color: #67c23a;
  margin-bottom: 10px;
}

.success-text {
  text-align: center;
  font-size: 16px;
  color: #67c23a;
  margin-bottom: 10px;
}

.success-desc {
  text-align: center;
  font-size: 14px;
  color: #606266;
  margin-bottom: 20px;
}
</style>
