<template>
  <div>
    <canvas ref="canvasRef" />
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 200
  },
  level: {
    type: String,
    default: 'M'
  }
})

const canvasRef = ref(null)

// 动态导入qrcode库
let QRCode;

onMounted(async () => {
  const QRCodeModule = await import('qrcode')
  QRCode = QRCodeModule.default
  
  drawQRCode()
})

const drawQRCode = async () => {
  if (!canvasRef.value || !QRCode) return
  
  try {
    await QRCode.toCanvas(canvasRef.value, props.value, {
      width: props.size,
      errorCorrectionLevel: props.level
    })
  } catch (error) {
    console.error('生成二维码失败:', error)
  }
}

// 监听value变化重新绘制
watchEffect(() => {
  if(QRCode) {
    drawQRCode()
  }
})
</script>