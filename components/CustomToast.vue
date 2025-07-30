<template>
  <view v-if="visible" class="toast-overlay">
    <view class="toast-container" :class="typeClass">
      <view class="toast-decoration"></view>
      
      <view class="toast-icon">
        <text class="icon-text">{{ iconText }}</text>
      </view>
      
      <view class="toast-message">{{ message }}</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'success', // success, error, warning, info
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 2000
  }
})

const emit = defineEmits(['update:visible'])

const typeClass = computed(() => {
  return `toast-${props.type}`
})

const iconText = computed(() => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }
  return icons[props.type] || '✅'
})

watch(() => props.visible, (newVal) => {
  if (newVal && props.duration > 0) {
    setTimeout(() => {
      emit('update:visible', false)
    }, props.duration)
  }
})
</script>

<style lang="scss" scoped>
.toast-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  animation: fadeInScale 0.3s ease-out;
}

.toast-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 30rpx 40rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 25rpx;
  box-shadow: 0 15rpx 40rpx rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(20rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  min-width: 300rpx;
  max-width: 500rpx;
  overflow: hidden;
  
  &.toast-success {
    border-left: 6rpx solid #52c41a;
  }
  
  &.toast-error {
    border-left: 6rpx solid #ff4d4f;
  }
  
  &.toast-warning {
    border-left: 6rpx solid #faad14;
  }
  
  &.toast-info {
    border-left: 6rpx solid #1890ff;
  }
}

.toast-decoration {
  position: absolute;
  top: -30rpx;
  right: -30rpx;
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 50%;
  animation: rotate 4s linear infinite;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  flex-shrink: 0;
  
  .toast-success & {
    background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
  }
  
  .toast-error & {
    background: linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%);
  }
  
  .toast-warning & {
    background: linear-gradient(135deg, #fffbe6 0%, #fff1b8 100%);
  }
  
  .toast-info & {
    background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  }
}

.icon-text {
  font-size: 28rpx;
}

.toast-message {
  font-size: 28rpx;
  color: #303133;
  font-weight: 500;
  line-height: 1.4;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
